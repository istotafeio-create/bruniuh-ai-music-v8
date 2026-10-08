import { NextResponse } from "next/server";
import { stripeClient } from "@/lib/stripe";
import { requireUser } from "@/lib/supabase-server";
import { CREDIT_PACKS, type CreditPackId } from "@/lib/credits";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const auth = await requireUser(req);

  if ("error" in auth) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const body = await req.json();
    const packId = body.packId as CreditPackId;
    const pack = CREDIT_PACKS[packId];

    if (!pack) {
      return NextResponse.json(
        { error: "Pacote de créditos inválido." },
        { status: 400 }
      );
    }

    const priceId = process.env[pack.envPriceId];

    if (!priceId) {
      return NextResponse.json(
        { error: `${pack.envPriceId} em falta.` },
        { status: 500 }
      );
    }

    const stripe = stripeClient();
    const origin = new URL(req.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],

      metadata: {
        user_id: auth.user.id,
        credits: String(pack.credits),
        pack_id: packId
      },

      success_url: `${origin}/studio?payment=success`,
      cancel_url: `${origin}/studio?payment=cancelled`
    });

    if (!session.url) {
      throw new Error("Stripe não devolveu o endereço de pagamento.");
    }

    return NextResponse.json({
      url: session.url
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Não foi possível iniciar o pagamento." },
      { status: 500 }
    );
  }
}