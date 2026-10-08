
import { NextResponse } from "next/server";
import Replicate from "replicate";
import { createAdminSupabase, requireUser } from "@/lib/supabase-server";
import { deleteAudio, putAudio, signedAudioUrl } from "@/lib/r2";
import { creditCostForDuration } from "@/lib/credits";

export const runtime = "nodejs";
export const maxDuration = 300;

const MODEL =
  "lucataco/ace-step:280fc4f9ee507577f880a167f639c02622421d8fecf492454320311217b688f1";

type Body = {
  prompt?: string;
  lyrics?: string;
  title?: string;
  bpm?: number;
  language?: string;
  voice?: string;
  durationSeconds?: number;
  instrumental?: boolean;
  negativePrompt?: string;
};

function clean(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function duration(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n)
    ? Math.max(30, Math.min(240, n || 180))
    : 180;
}

function extFrom(contentType: string, url: string) {
  const ct = contentType.toLowerCase();

  if (ct.includes("mpeg") || ct.includes("mp3")) return "mp3";
  if (ct.includes("wav")) return "wav";
  if (ct.includes("ogg")) return "ogg";
  if (ct.includes("aac")) return "aac";

  return url.match(/\.([a-z0-9]{2,5})(?:\?|$)/i)?.[1] || "mp3";
}

function isRateLimit(error: any) {
  const message = String(error?.message || "");
  return (
    error?.status === 429 ||
    error?.response?.status === 429 ||
    /\b429\b|too many requests|throttled|rate limit/i.test(message)
  );
}

function retryDelay(error: any, attempt: number) {
  const message = String(error?.message || "");
  const match = message.match(/"retry_after"\s*:\s*(\d+)/i);

  const seconds = match
    ? Number(match[1])
    : Math.min(10 * attempt, 40);

  return Math.max(10, Math.min(seconds + 2, 60)) * 1000;
}

async function runWithRetry(
  replicate: Replicate,
  input: Record<string, unknown>,
  version: "A" | "B"
) {
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`V8: Version ${version}, tentativa ${attempt}`);

      return await replicate.run(MODEL, { input });
    } catch (error: any) {
      if (!isRateLimit(error) || attempt === maxAttempts) {
        throw error;
      }

      const delay = retryDelay(error, attempt);

      console.warn(
        `V8: limite 429 na Version ${version}. ` +
        `Nova tentativa em ${Math.round(delay / 1000)} segundos.`
      );

      await wait(delay);
    }
  }

  throw new Error("Limite de tentativas atingido.");
}

async function compose(body: Body, version: "A" | "B") {
  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    throw new Error("REPLICATE_API_TOKEN em falta.");
  }

  const replicate = new Replicate({ auth: token });

  const title = clean(body.title, 120) || "BRUNIUH AI Song";
  const style = clean(body.prompt, 2200);
  const lyrics = clean(body.lyrics, 4000);
  const negative = clean(body.negativePrompt, 600);
  const seconds = duration(body.durationSeconds);

  const tags = [
    style,
    body.bpm ? `${Number(body.bpm)} BPM` : "",
    body.language ? `${clean(body.language, 40)} lyrics` : "",
    body.voice && !body.instrumental
      ? clean(body.voice, 100)
      : "",
    negative ? `avoid ${negative}` : "",
    `Version ${version}`
  ].filter(Boolean).join(", ");

  const output: any = await runWithRetry(
    replicate,
    {
      tags,
      lyrics: body.instrumental ? "[instrumental]" : lyrics,
      duration: seconds
    },
    version
  );

  let audioUrl = "";

  if (typeof output === "string") {
    audioUrl = output;
  } else if (output && typeof output.url === "function") {
    audioUrl = String(output.url());
  } else if (typeof output?.url === "string") {
    audioUrl = output.url;
  }

  if (!audioUrl) {
    throw new Error(`Version ${version}: áudio não devolvido pelo Replicate.`);
  }

  const response = await fetch(audioUrl, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(
      `Version ${version}: download falhou (${response.status}).`
    );
  }

  const contentType =
    response.headers.get("content-type") || "audio/mpeg";

  const bytes = Buffer.from(await response.arrayBuffer());

  console.log(`V8: Version ${version} pronta (${bytes.length} bytes).`);

  return {
    bytes,
    contentType,
    providerSongId: crypto.randomUUID(),
    title: `${title} — Version ${version}`,
    durationSeconds: seconds,
    sourceUrl: audioUrl
  };
}

export async function POST(req: Request) {
  const auth = await requireUser(req);

  if ("error" in auth) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  let body: Body;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Pedido inválido." },
      { status: 400 }
    );
  }

  if (!clean(body.prompt, 2200)) {
    return NextResponse.json(
      { error: "Escreve o Style of Music." },
      { status: 400 }
    );
  }

  const requestedSeconds = duration(body.durationSeconds);

  if (Number(body.durationSeconds || 180) > 240) {
    return NextResponse.json(
      { error: "Este motor suporta até 4 minutos por música." },
      { status: 400 }
    );
  }

  const generationRef = `gen_${crypto.randomUUID()}`;
  const cost = creditCostForDuration(requestedSeconds);

  const { data: remainingCredits, error: spendError } =
    await auth.supabase.rpc("spend_credits", {
      p_amount: cost,
      p_reason: "music_generation",
      p_reference: generationRef
    });

  if (spendError) {
    const message = spendError.message.includes("INSUFFICIENT_CREDITS")
      ? "Créditos insuficientes."
      : spendError.message;

    return NextResponse.json(
      { error: message },
      { status: 402 }
    );
  }

  const admin = createAdminSupabase();
  const uploaded: string[] = [];
  const insertedSongIds: string[] = [];

  try {
    console.log("V8: geração iniciada.");

    // Uma versão de cada vez para respeitar o limite do Replicate.
    const a = await compose(body, "A");

    await wait(11000);

    const b = await compose(body, "B");

    const songs: any[] = [];

    for (const item of [a, b]) {
      const dbId = crypto.randomUUID();
      const extension = extFrom(item.contentType, item.sourceUrl);
      const storageKey = `${auth.user.id}/${dbId}.${extension}`;

      console.log(`V8: upload R2 — ${item.title}`);

      await putAudio(storageKey, item.bytes, item.contentType);
      uploaded.push(storageKey);

      const inserted = await admin
        .from("songs")
        .insert({
          id: dbId,
          user_id: auth.user.id,
          title: item.title,
          style: clean(body.prompt, 2200),
          audio_path: storageKey,
          duration_seconds: item.durationSeconds,
          provider: "replicate-ace-step",
          provider_song_id: item.providerSongId
        })
        .select("id,title,style,audio_path,duration_seconds,created_at")
        .single();

      if (inserted.error) {
        throw new Error(`Base de dados: ${inserted.error.message}`);
      }

      insertedSongIds.push(dbId);

      songs.push({
        id: inserted.data.id,
        title: inserted.data.title,
        style: inserted.data.style,
        durationSeconds: inserted.data.duration_seconds,
        createdAt: inserted.data.created_at,
        audioUrl: await signedAudioUrl(storageKey, 3600)
      });
    }

    console.log("V8: duas músicas geradas e guardadas.");

    return NextResponse.json({
      songs,
      credits: remainingCredits,
      generationCostCredits: cost
    });
  } catch (error: any) {
    console.error("V8: ERRO MUSIC:", error);

    for (const key of uploaded) {
      try {
        await deleteAudio(key);
      } catch (cleanupError) {
        console.error("V8: falha na limpeza R2:", cleanupError);
      }
    }

    if (insertedSongIds.length > 0) {
      const { error: cleanupError } = await admin
        .from("songs")
        .delete()
        .in("id", insertedSongIds);

      if (cleanupError) {
        console.error("V8: falha na limpeza Supabase:", cleanupError);
      }
    }

    const { error: refundError } = await admin.rpc("refund_credits", {
      p_user_id: auth.user.id,
      p_amount: cost,
      p_reference: generationRef
    });

    if (refundError) {
      console.error("V8: falha no reembolso:", refundError);
    }

    return NextResponse.json(
      {
        error: error?.message || "Falha na geração.",
        creditsRefunded: !refundError
      },
      { status: 502 }
    );
  }
}
