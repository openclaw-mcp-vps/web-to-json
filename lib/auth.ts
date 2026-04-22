import { createHmac, timingSafeEqual } from "crypto";

export const ACCESS_COOKIE_NAME = "webtojson_access";
const TOKEN_SEPARATOR = ".";

function getAccessSecret() {
  return (
    process.env.ACCESS_COOKIE_SECRET ||
    process.env.STRIPE_WEBHOOK_SECRET ||
    "local-dev-access-secret"
  );
}

function toBase64Url(buffer: Buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (normalized.length % 4)) % 4;
  return Buffer.from(normalized + "=".repeat(padLength), "base64");
}

function createSignature(sessionId: string) {
  const digest = createHmac("sha256", getAccessSecret())
    .update(sessionId)
    .digest();
  return toBase64Url(digest);
}

export function createAccessToken(sessionId: string) {
  return `${sessionId}${TOKEN_SEPARATOR}${createSignature(sessionId)}`;
}

export function verifyAccessToken(value?: string | null) {
  if (!value) {
    return null;
  }

  const [sessionId, providedSignature] = value.split(TOKEN_SEPARATOR);

  if (!sessionId || !providedSignature) {
    return null;
  }

  const expectedSignature = createSignature(sessionId);
  const providedBuffer = fromBase64Url(providedSignature);
  const expectedBuffer = fromBase64Url(expectedSignature);

  if (providedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  return sessionId;
}

export function getAccessCookieOptions() {
  const oneMonthInSeconds = 60 * 60 * 24 * 30;

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: oneMonthInSeconds,
  };
}
