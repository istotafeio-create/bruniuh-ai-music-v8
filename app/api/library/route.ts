import { NextResponse } from "next/server";
import { createAdminSupabase, requireUser } from "@/lib/supabase-server";
import { signedAudioUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await requireUser(req);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const admin = createAdminSupabase();
  const { data: songs, error } = await admin
    .from("songs")
    .select("id,title,style,audio_path,duration_seconds,created_at")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const result = await Promise.all((songs || []).map(async (song) => ({
    id: song.id,
    title: song.title,
    style: song.style,
    durationSeconds: song.duration_seconds,
    createdAt: song.created_at,
    audioUrl: await signedAudioUrl(song.audio_path, 60 * 60)
  })));

  return NextResponse.json({ songs: result });
}
