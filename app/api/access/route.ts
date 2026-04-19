import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_COOKIE_NAME, verifyAccessToken } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ access: false });
  }

  const access = await verifyAccessToken(token);

  if (!access) {
    return NextResponse.json({ access: false });
  }

  return NextResponse.json({ access: true, email: access.email, plan: access.plan });
}
