import { NextRequest, NextResponse } from "next/server";

import { ACCESS_COOKIE_NAME, verifyAccessToken } from "@/lib/auth";

export function GET(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const sessionId = verifyAccessToken(token);

  return NextResponse.json({
    ok: true,
    unlocked: Boolean(sessionId),
  });
}
