import { NextResponse } from "next/server";

import {
  ACCESS_COOKIE_NAME,
  createAccessToken,
  getAccessCookieOptions,
} from "@/lib/auth";
import { hasSessionEntitlement } from "@/lib/entitlements";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      sessionId?: string;
    };

    const sessionId = payload.sessionId?.trim();

    if (!sessionId) {
      return NextResponse.json(
        {
          ok: false,
          error: "sessionId is required.",
        },
        { status: 400 },
      );
    }

    const entitled = await hasSessionEntitlement(sessionId);

    if (!entitled) {
      return NextResponse.json(
        {
          ok: false,
          error: "Session not unlocked yet. Stripe webhook may still be processing.",
        },
        { status: 403 },
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      ACCESS_COOKIE_NAME,
      createAccessToken(sessionId),
      getAccessCookieOptions(),
    );

    return response;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to complete access unlock.",
      },
      { status: 500 },
    );
  }
}
