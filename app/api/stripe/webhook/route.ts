import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripeClient } from "@/lib/stripe";
import { createAdminSupabase } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook não configurado." }, { status: 503 });

  const signature = (await headers()).get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Sem assinatura Stripe." }, { status: 400 });

  const raw = await req.text();
  const stripe = stripeClient();

  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch (e: any) {
    return NextResponse.json({ error: `Webhook inválido: ${e.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    if (session.payment_status === "paid") {
      const userId = session.metadata?.user_id;
      const credits = Number(session.metadata?.credits || 0);

      if (userId && credits > 0) {
        const admin = createAdminSupabase();
        const { error } = await admin.rpc("add_credits_from_stripe", {
          p_user_id: userId,
          p_amount: credits,
          p_session_id: session.id
        });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
