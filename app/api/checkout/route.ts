import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase-server";
import { stripeClient } from "@/lib/stripe";
import { CREDIT_PACKS, type CreditPackId } from "@/lib/credits";

export async function POST(req: Request) {
  const auth = await requireUser(req);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json().catch(() => ({}));
  const packId = String(body.package || "") as CreditPackId;
  const pack = CREDIT_PACKS[packId];

  if (!pack) {
    return NextResponse.json({ error: "Pacote inválido." }, { status: 400 });
  }

  const priceId = process.env[pack.envPriceId];
  if (!priceId) {
    return NextResponse.json(
      { error: `Preço Stripe ${pack.envPriceId} ainda não configurado.` },
      { status: 503 }
    );
  }

  const stripe = stripeClient();
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: auth.user.id,
    customer_email: auth.user.email || undefined,
    metadata: {
      user_id: auth.user.id,
      credits: String(pack.credits),
      package: packId
    },
    success_url: `${base}/?payment=success`,
    cancel_url: `${base}/?payment=cancelled`
  });

  return NextResponse.json({ url: session.url });
}
