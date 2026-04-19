import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { upsertPurchase } from "@/lib/database";

export const runtime = "nodejs";

type LemonWebhookPayload = {
  meta?: {
    event_name?: string;
    custom_data?: Record<string, unknown>;
  };
  data?: {
    id?: string;
    attributes?: Record<string, unknown>;
  };
};

function verifySignature(rawBody: string, signature: string, secret: string) {
  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");

  const signatureBuffer = Buffer.from(signature, "utf8");
  const digestBuffer = Buffer.from(digest, "utf8");

  if (signatureBuffer.length !== digestBuffer.length) {
    return false;
  }

  return timingSafeEqual(signatureBuffer, digestBuffer);
}

function pickString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json(
      { message: "Missing LEMON_SQUEEZY_WEBHOOK_SECRET." },
      { status: 500 }
    );
  }

  const signature = request.headers.get("x-signature");

  if (!signature) {
    return NextResponse.json({ message: "Missing webhook signature." }, { status: 400 });
  }

  const rawBody = await request.text();

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ message: "Invalid signature." }, { status: 401 });
  }

  let payload: LemonWebhookPayload;

  try {
    payload = JSON.parse(rawBody) as LemonWebhookPayload;
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload." }, { status: 400 });
  }

  const eventName = payload.meta?.event_name ?? "unknown";
  const attributes = payload.data?.attributes ?? {};
  const orderId =
    pickString(payload.data?.id, attributes["identifier"], attributes["order_id"]) ??
    `event-${Date.now()}`;

  const email = pickString(
    attributes["user_email"],
    attributes["customer_email"],
    payload.meta?.custom_data?.email
  );

  const productId = pickString(
    attributes["product_id"],
    attributes["variant_id"],
    (attributes["first_order_item"] as Record<string, unknown> | undefined)?.variant_id
  );

  const status: "active" | "cancelled" | "refunded" =
    eventName === "subscription_cancelled"
      ? "cancelled"
      : eventName === "subscription_refunded" || eventName === "order_refunded"
        ? "refunded"
        : "active";

  if (email && ["active", "cancelled", "refunded"].includes(status)) {
    await upsertPurchase({
      email,
      orderId,
      productId: productId ?? undefined,
      status,
      sourceEvent: eventName
    });
  }

  return NextResponse.json({ ok: true, event: eventName });
}
