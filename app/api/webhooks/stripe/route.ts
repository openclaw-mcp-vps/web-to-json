import { NextResponse } from "next/server";
import Stripe from "stripe";

import { grantEntitlement } from "@/lib/entitlements";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!webhookSecret || !stripeSecretKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing STRIPE_WEBHOOK_SECRET or STRIPE_SECRET_KEY.",
      },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing Stripe signature header.",
      },
      { status: 400 },
    );
  }

  const rawBody = await request.text();
  const stripe = new Stripe(stripeSecretKey);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: `Invalid Stripe webhook signature: ${(error as Error).message}`,
      },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.id) {
      await grantEntitlement(
        session.id,
        session.customer_details?.email ?? session.customer_email ?? null,
      );
    }
  }

  return NextResponse.json({ ok: true });
}
