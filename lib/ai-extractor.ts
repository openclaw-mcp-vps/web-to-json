import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

import type { RenderedPage } from "@/lib/puppeteer";

export interface StructuredExtraction {
  sourceUrl: string;
  finalUrl: string;
  title: string;
  description: string;
  language: string;
  pageType: "article" | "product" | "docs" | "listing" | "landing" | "unknown";
  paywallDetected: boolean;
  summary: string;
  keyPoints: string[];
  entities: Array<{ name: string; type: string; confidence: number }>;
  fields: Record<string, string | number | boolean | string[] | null>;
  links: Array<{ text: string; href: string }>;
  extractedAt: string;
}

const INSTRUCTIONS = `You are a production extraction engine.
Return strict JSON only with this schema:
{
  "pageType": "article|product|docs|listing|landing|unknown",
  "summary": "2-4 sentence useful summary",
  "keyPoints": ["short factual point"],
  "entities": [{"name":"", "type":"", "confidence":0.0}],
  "fields": {
    "author": "",
    "publishedDate": "",
    "price": "",
    "organization": "",
    "location": "",
    "contact": ""
  }
}
Rules:
- Keep only facts grounded in provided content.
- If a value is missing, return null.
- Confidence must be between 0 and 1.
- Do not include any keys outside the schema.`;

function stripCodeFences(value: string) {
  return value
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function dedupeText(items: string[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const normalized = item.toLowerCase();
    if (seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
}

function buildContext(page: RenderedPage) {
  return JSON.stringify(
    {
      sourceUrl: page.sourceUrl,
      finalUrl: page.finalUrl,
      title: page.title,
      description: page.description,
      language: page.language,
      headings: page.headings,
      links: page.links.slice(0, 40),
      jsonLd: page.jsonLd,
      paywallSignals: page.paywallSignals,
      content: page.textContent,
    },
    null,
    2,
  ).slice(0, 28000);
}

function inferPageType(page: RenderedPage): StructuredExtraction["pageType"] {
  const haystack = `${page.title} ${page.description} ${page.headings.join(" ")}`.toLowerCase();

  if (haystack.includes("documentation") || haystack.includes("api") || haystack.includes("reference")) {
    return "docs";
  }

  if (haystack.includes("buy") || haystack.includes("pricing") || haystack.includes("checkout")) {
    return "product";
  }

  if (haystack.includes("blog") || haystack.includes("news") || haystack.includes("article")) {
    return "article";
  }

  if (haystack.includes("directory") || haystack.includes("listing") || haystack.includes("results")) {
    return "listing";
  }

  if (haystack.includes("homepage") || haystack.includes("landing")) {
    return "landing";
  }

  return "unknown";
}

function summarizeFallback(text: string) {
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter((line) => line.length > 50)
    .slice(0, 3);

  if (sentences.length === 0) {
    return "The page rendered successfully, but there was limited extractable body text.";
  }

  return sentences.join(" ");
}

function heuristicExtraction(page: RenderedPage): StructuredExtraction {
  const keyPoints = dedupeText([...page.headings, ...page.textContent.split("\n")])
    .filter((value) => value.length > 20)
    .slice(0, 6);

  return {
    sourceUrl: page.sourceUrl,
    finalUrl: page.finalUrl,
    title: page.title || "Untitled page",
    description: page.description || "",
    language: page.language,
    pageType: inferPageType(page),
    paywallDetected: page.paywallSignals.length > 0,
    summary: summarizeFallback(page.textContent),
    keyPoints,
    entities: [],
    fields: {
      author: null,
      publishedDate: null,
      price: null,
      organization: null,
      location: null,
      contact: null,
    },
    links: page.links.slice(0, 30),
    extractedAt: new Date().toISOString(),
  };
}

function normalizeExtraction(page: RenderedPage, raw: unknown): StructuredExtraction {
  const fallback = heuristicExtraction(page);

  if (!raw || typeof raw !== "object") {
    return fallback;
  }

  const parsed = raw as {
    pageType?: StructuredExtraction["pageType"];
    summary?: string;
    keyPoints?: string[];
    entities?: Array<{ name?: string; type?: string; confidence?: number }>;
    fields?: Record<string, unknown>;
  };

  const entities = Array.isArray(parsed.entities)
    ? parsed.entities
        .map((entity) => ({
          name: entity.name?.trim() || "",
          type: entity.type?.trim() || "unknown",
          confidence: Math.min(1, Math.max(0, Number(entity.confidence ?? 0))),
        }))
        .filter((entity) => entity.name.length > 0)
    : [];

  const normalizedFields: Record<string, string | number | boolean | string[] | null> = {
    ...fallback.fields,
  };

  if (parsed.fields && typeof parsed.fields === "object") {
    for (const [key, value] of Object.entries(parsed.fields)) {
      if (
        value === null ||
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean" ||
        (Array.isArray(value) && value.every((item) => typeof item === "string"))
      ) {
        normalizedFields[key] = value;
      }
    }
  }

  return {
    ...fallback,
    pageType: parsed.pageType ?? fallback.pageType,
    summary: parsed.summary?.trim() || fallback.summary,
    keyPoints: Array.isArray(parsed.keyPoints)
      ? parsed.keyPoints.map((item) => item.trim()).filter(Boolean).slice(0, 8)
      : fallback.keyPoints,
    entities,
    fields: normalizedFields,
  };
}

async function extractWithOpenAI(page: RenderedPage) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const client = new OpenAI({ apiKey });
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: INSTRUCTIONS,
      },
      {
        role: "user",
        content: buildContext(page),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    return null;
  }

  return JSON.parse(stripCodeFences(content)) as unknown;
}

async function extractWithAnthropic(page: RenderedPage) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return null;
  }

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest",
    max_tokens: 1800,
    temperature: 0,
    system: INSTRUCTIONS,
    messages: [
      {
        role: "user",
        content: buildContext(page),
      },
    ],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  if (!text.trim()) {
    return null;
  }

  return JSON.parse(stripCodeFences(text)) as unknown;
}

export async function extractStructuredJson(page: RenderedPage): Promise<StructuredExtraction> {
  try {
    const anthropicResult = await extractWithAnthropic(page);

    if (anthropicResult) {
      return normalizeExtraction(page, anthropicResult);
    }
  } catch {
    // Fall through to OpenAI or heuristic extraction.
  }

  try {
    const openAiResult = await extractWithOpenAI(page);

    if (openAiResult) {
      return normalizeExtraction(page, openAiResult);
    }
  } catch {
    // Fall back to heuristic extraction.
  }

  return heuristicExtraction(page);
}
