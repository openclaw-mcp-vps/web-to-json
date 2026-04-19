import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  ACCESS_COOKIE_MAX_AGE_SECONDS,
  ACCESS_COOKIE_NAME,
  signAccessToken
} from "@/lib/auth";
import { findActivePurchaseByEmail } from "@/lib/database";

const activateSchema = z.object({
  email: z.string().email()
});

export async function POST(request: NextRequest) {
  const parseResult = activateSchema.safeParse(await request.json().catch(() => null));

  if (!parseResult.success) {
    return NextResponse.json(
      { message: "Provide a valid purchase email." },
      { status: 400 }
    );
  }

  const email = parseResult.data.email.trim().toLowerCase();
  const purchase = await findActivePurchaseByEmail(email);

  if (!purchase) {
    return NextResponse.json(
      {
        message:
          "No active purchase found for this email yet. Complete checkout first, then wait up to a minute for webhook sync."
      },
      { status: 404 }
    );
  }

  const token = await signAccessToken({
    email,
    plan: "unlimited"
  });

  const response = NextResponse.json({
    message: "Access activated.",
    email,
    plan: "unlimited"
  });

  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: token,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ACCESS_COOKIE_MAX_AGE_SECONDS
  });

  return response;
}
