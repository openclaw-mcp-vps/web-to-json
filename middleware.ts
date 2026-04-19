import { NextRequest, NextResponse } from "next/server";

const ACCESS_COOKIE_NAME = "w2j_access";

export function middleware(request: NextRequest) {
  const hasAccessCookie = Boolean(request.cookies.get(ACCESS_COOKIE_NAME)?.value);

  if (hasAccessCookie) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/extract")) {
    return NextResponse.json(
      { message: "Paid access required. Purchase and activate first." },
      { status: 402 }
    );
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/";
  redirectUrl.searchParams.set("paywall", "1");

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/tool", "/tool/:path*", "/api/extract"]
};
