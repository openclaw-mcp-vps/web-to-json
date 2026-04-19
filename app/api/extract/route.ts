import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { scrapePage } from "@/lib/scraper";
import { extractStructuredData } from "@/lib/ai-extractor";
import { ACCESS_COOKIE_NAME, verifyAccessToken } from "@/lib/auth";
import { logExtraction } from "@/lib/database";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  url: z.string().url(),
  provider: z.enum(["auto", "openai", "anthropic"]).optional().default("auto")
});

function normalizeUrl(raw: string) {
  const parsed = new URL(raw);

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http and https URLs are supported.");
  }

  return parsed.toString();
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Paid access required. Purchase first, then activate your cookie." },
      { status: 402 }
    );
  }

  const access = await verifyAccessToken(token);

  if (!access) {
    return NextResponse.json(
      { message: "Access cookie is invalid or expired. Re-activate access from the homepage." },
      { status: 401 }
    );
  }

  const parseResult = bodySchema.safeParse(await request.json().catch(() => null));

  if (!parseResult.success) {
    return NextResponse.json(
      {
        message: "Invalid request body. Expected { url: string, provider?: 'auto'|'openai'|'anthropic' }."
      },
      { status: 400 }
    );
  }

  try {
    const url = normalizeUrl(parseResult.data.url);
    const page = await scrapePage(url);
    const data = await extractStructuredData(page, {
      provider: parseResult.data.provider
    });

    await logExtraction({
      email: access.email,
      url,
      provider: data.provider
    });

    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Extraction failed.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
