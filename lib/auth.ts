import { jwtVerify, SignJWT } from "jose";

export const ACCESS_COOKIE_NAME = "w2j_access";
export const ACCESS_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type AccessTokenPayload = {
  email: string;
  plan: "unlimited" | "metered";
};

function getSecretKey() {
  const secret =
    process.env.ACCESS_COOKIE_SECRET ??
    process.env.LEMON_SQUEEZY_WEBHOOK_SECRET ??
    "dev-only-change-this-secret-before-production";

  return new TextEncoder().encode(secret);
}

export async function signAccessToken(payload: AccessTokenPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.email)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_COOKIE_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"]
    });

    const email = payload.email;
    const plan = payload.plan;

    if (typeof email !== "string") {
      return null;
    }

    if (plan !== "unlimited" && plan !== "metered") {
      return null;
    }

    return {
      email,
      plan
    } as AccessTokenPayload;
  } catch {
    return null;
  }
}
