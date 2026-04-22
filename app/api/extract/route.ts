import { NextRequest, NextResponse } from "next/server";

import { extractStructuredJson } from "@/lib/ai-extractor";
import { ACCESS_COOKIE_NAME, verifyAccessToken } from "@/lib/auth";
import { renderWebPage } from "@/lib/puppeteer";
import { trackUsage } from "@/lib/usage-tracker";

export const runtime = "nodejs";
export const maxDuration = 120;

function getClientIpAddress(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");

  if (!forwarded) {
    return "unknown";
  }

  return forwarded.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const sessionId = verifyAccessToken(token);

  if (!sessionId) {
    return NextResponse.json(
      {
        ok: false,
        error: "Paid access required. Purchase and complete unlock first.",
      },
      { status: 401 },
    );
  }

  let body: { url?: string };

  try {
    body = (await request.json()) as { url?: string };
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid JSON payload.",
      },
      { status: 400 },
    );
  }

  const inputUrl = body.url?.trim();

  if (!inputUrl) {
    return NextResponse.json(
      {
        ok: false,
        error: "Request body must include a non-empty url field.",
      },
      { status: 400 },
    );
  }

  try {
    const renderedPage = await renderWebPage(inputUrl);
    const structured = await extractStructuredJson(renderedPage);

    await trackUsage({
      sessionId,
      url: renderedPage.sourceUrl,
      ipAddress: getClientIpAddress(request),
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json({
      ok: true,
      data: structured,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: (error as Error).message || "Extraction failed.",
      },
      { status: 500 },
    );
  }
}
