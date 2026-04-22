import { type NextRequest, NextResponse } from "next/server";

const ACCESS_COOKIE_NAME = "webtojson_access";
const TOKEN_SEPARATOR = ".";

function getAccessSecret() {
  return (
    process.env.ACCESS_COOKIE_SECRET ||
    process.env.STRIPE_WEBHOOK_SECRET ||
    "local-dev-access-secret"
  );
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function signSessionId(sessionId: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getAccessSecret()),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(sessionId));
  return toBase64Url(new Uint8Array(signature));
}

async function isValidAccessToken(token?: string) {
  if (!token) {
    return false;
  }

  const [sessionId, providedSignature] = token.split(TOKEN_SEPARATOR);

  if (!sessionId || !providedSignature) {
    return false;
  }

  const expectedSignature = await signSessionId(sessionId);
  return providedSignature === expectedSignature;
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const valid = await isValidAccessToken(token);

  if (valid) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        ok: false,
        error: "Paid access required.",
      },
      { status: 401 },
    );
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/";
  redirectUrl.searchParams.set("locked", "1");
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/tool/:path*", "/api/extract"],
};
