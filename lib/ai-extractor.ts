import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { z } from "zod";
import type { ScrapedPage } from "@/lib/scraper";

const structuredSchema = z.object({
  summary: z.string().min(20),
  keyPoints: z.array(z.string()).min(3).max(10),
  entities: z.object({
    people: z.array(z.string()).max(15),
    organizations: z.array(z.string()).max(15),
    products: z.array(z.string()).max(15),
    locations: z.array(z.string()).max(15)
  }),
  facts: z
    .array(
      z.object({
        label: z.string().min(2),
        value: z.string().min(1)
      })
    )
    .max(20)
});

export type StructuredExtraction = z.infer<typeof structuredSchema> & {
  source: {
    requestedUrl: string;
    finalUrl: string;
    title: string;
    description: string;
    isLikelyPaywalled: boolean;
  };
  links: Array<{ text: string; href: string }>;
  extractedAt: string;
  provider: "openai" | "anthropic" | "heuristic";
};

export type ExtractOptions = {
  provider?: "auto" | "openai" | "anthropic";
};

const promptTemplate = `Extract structured data from this webpage text.

Return JSON only with this shape:
{
  "summary": string,
  "keyPoints": string[],
  "entities": {
    "people": string[],
    "organizations": string[],
    "products": string[],
    "locations": string[]
  },
  "facts": [{ "label": string, "value": string }]
}

Rules:
- Keep summary under 120 words.
- keyPoints must be concrete, not generic.
- facts should include numbers, pricing, dates, limits, quotas, terms, or claims if present.
- If uncertain, omit rather than invent.
- Output strictly valid JSON.`;

function parseJsonCandidate(input: string) {
  const cleaned = input
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(cleaned);
}

function unique(list: string[]) {
  return Array.from(new Set(list.map((v) => v.trim()).filter(Boolean)));
}

function heuristicExtract(page: ScrapedPage): StructuredExtraction {
  const lines = page.textContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 35);

  const keyPoints = unique(lines).slice(0, 6);
  const summary = keyPoints.slice(0, 3).join(" ").slice(0, 560);

  const entities = {
    people: [] as string[],
    organizations: [] as string[],
    products: [] as string[],
    locations: [] as string[]
  };

  const namedTokens = page.textContent.match(/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+){0,2}\b/g) ?? [];
  const popularTokens = unique(namedTokens).slice(0, 40);

  for (const token of popularTokens) {
    if (/Inc|LLC|Ltd|Company|Corp|Labs|AI|OpenAI|Google|Microsoft|Amazon|Meta/i.test(token)) {
      entities.organizations.push(token);
      continue;
    }

    if (/API|SDK|Chrome|iPhone|Android|Next\.js|Claude|GPT/i.test(token)) {
      entities.products.push(token);
      continue;
    }

    if (/\b(Street|Avenue|Road|City|County|State|USA|United States|Europe|Asia)\b/i.test(token)) {
      entities.locations.push(token);
      continue;
    }

    entities.people.push(token);
  }

  const priceLikeFacts = page.textContent.match(
    /[^\n]*\$\s?\d+[\d.,]*(?:\/[a-z]+)?[^\n]*/gi
  ) ?? [];
  const metricFacts = page.textContent.match(
    /[^\n]*\d+\s?(?:%|ms|seconds|minutes|hours|days|months|years)[^\n]*/gi
  ) ?? [];

  const numericFacts = unique([...priceLikeFacts, ...metricFacts].slice(0, 10));

  const facts = numericFacts.map((entry, idx) => ({
    label: `Observed claim ${idx + 1}`,
    value: entry.trim().slice(0, 220)
  }));

  return {
    summary: summary.length > 0 ? summary : page.description || "Page content extracted successfully.",
    keyPoints: keyPoints.length > 0 ? keyPoints : [page.description || page.title],
    entities: {
      people: unique(entities.people).slice(0, 10),
      organizations: unique(entities.organizations).slice(0, 10),
      products: unique(entities.products).slice(0, 10),
      locations: unique(entities.locations).slice(0, 10)
    },
    facts,
    source: {
      requestedUrl: page.requestedUrl,
      finalUrl: page.finalUrl,
      title: page.title,
      description: page.description,
      isLikelyPaywalled: page.isLikelyPaywalled
    },
    links: page.visibleLinks.slice(0, 12),
    extractedAt: new Date().toISOString(),
    provider: "heuristic"
  };
}

async function extractWithOpenAI(page: ScrapedPage) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const client = new OpenAI({ apiKey });
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: promptTemplate },
      {
        role: "user",
        content: JSON.stringify({
          url: page.finalUrl,
          title: page.title,
          description: page.description,
          textContent: page.textContent.slice(0, 36_000)
        })
      }
    ]
  });

  const raw = completion.choices[0]?.message?.content;

  if (!raw) {
    return null;
  }

  const parsed = structuredSchema.parse(parseJsonCandidate(raw));

  return {
    ...parsed,
    source: {
      requestedUrl: page.requestedUrl,
      finalUrl: page.finalUrl,
      title: page.title,
      description: page.description,
      isLikelyPaywalled: page.isLikelyPaywalled
    },
    links: page.visibleLinks.slice(0, 12),
    extractedAt: new Date().toISOString(),
    provider: "openai" as const
  };
}

async function extractWithAnthropic(page: ScrapedPage) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return null;
  }

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-latest",
    max_tokens: 1800,
    temperature: 0,
    system: promptTemplate,
    messages: [
      {
        role: "user",
        content: JSON.stringify({
          url: page.finalUrl,
          title: page.title,
          description: page.description,
          textContent: page.textContent.slice(0, 36_000)
        })
      }
    ]
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  if (!text) {
    return null;
  }

  const parsed = structuredSchema.parse(parseJsonCandidate(text));

  return {
    ...parsed,
    source: {
      requestedUrl: page.requestedUrl,
      finalUrl: page.finalUrl,
      title: page.title,
      description: page.description,
      isLikelyPaywalled: page.isLikelyPaywalled
    },
    links: page.visibleLinks.slice(0, 12),
    extractedAt: new Date().toISOString(),
    provider: "anthropic" as const
  };
}

export async function extractStructuredData(
  page: ScrapedPage,
  options: ExtractOptions = {}
): Promise<StructuredExtraction> {
  const requestedProvider = options.provider ?? "auto";

  if (requestedProvider === "openai") {
    const openaiResult = await extractWithOpenAI(page).catch(() => null);
    return openaiResult ?? heuristicExtract(page);
  }

  if (requestedProvider === "anthropic") {
    const anthropicResult = await extractWithAnthropic(page).catch(() => null);
    return anthropicResult ?? heuristicExtract(page);
  }

  const openaiResult = await extractWithOpenAI(page).catch(() => null);

  if (openaiResult) {
    return openaiResult;
  }

  const anthropicResult = await extractWithAnthropic(page).catch(() => null);

  if (anthropicResult) {
    return anthropicResult;
  }

  return heuristicExtract(page);
}
