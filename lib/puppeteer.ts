import puppeteer, { type Browser } from "puppeteer";

export interface RenderedPage {
  sourceUrl: string;
  finalUrl: string;
  title: string;
  description: string;
  language: string;
  textContent: string;
  headings: string[];
  links: Array<{ text: string; href: string }>;
  jsonLd: unknown[];
  paywallSignals: string[];
}

let browserPromise: Promise<Browser> | null = null;

function normalizeUrl(value: string) {
  const normalized = value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;

  const parsed = new URL(normalized);

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are supported.");
  }

  return parsed.toString();
}

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });
  }

  return browserPromise;
}

async function scrollPage(page: Awaited<ReturnType<Browser["newPage"]>>) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 600;
      const timer = window.setInterval(() => {
        const documentHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= documentHeight * 1.5) {
          window.clearInterval(timer);
          resolve();
        }
      }, 150);

      window.setTimeout(() => {
        window.clearInterval(timer);
        resolve();
      }, 3500);
    });
  });
}

function parseJsonLd(rawEntries: string[]) {
  const parsed: unknown[] = [];

  for (const entry of rawEntries) {
    try {
      parsed.push(JSON.parse(entry));
    } catch {
      continue;
    }
  }

  return parsed;
}

export async function renderWebPage(inputUrl: string): Promise<RenderedPage> {
  const url = normalizeUrl(inputUrl);
  const browser = await getBrowser();
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  );

  await page.setViewport({ width: 1440, height: 2000 });

  try {
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    await scrollPage(page);

    const extracted = await page.evaluate(() => {
      const textNodes = Array.from(
        document.querySelectorAll("main, article, section, p, h1, h2, h3, h4, li"),
      )
        .map((node) => node.textContent?.replace(/\s+/g, " ").trim() ?? "")
        .filter((value) => value.length > 30);

      const headings = Array.from(document.querySelectorAll("h1, h2, h3"))
        .map((node) => node.textContent?.trim() ?? "")
        .filter(Boolean)
        .slice(0, 24);

      const links = Array.from(document.querySelectorAll("a[href]"))
        .map((node) => ({
          text: node.textContent?.replace(/\s+/g, " ").trim() ?? "",
          href: (node as HTMLAnchorElement).href,
        }))
        .filter((item) => item.href.startsWith("http"))
        .slice(0, 120);

      const jsonLd = Array.from(
        document.querySelectorAll('script[type="application/ld+json"]'),
      )
        .map((node) => node.textContent?.trim() ?? "")
        .filter(Boolean);

      const pageText = document.body?.innerText?.replace(/\s+/g, " ").trim() ?? "";
      const blockers = ["subscribe to continue", "sign in to continue", "disable ad blocker", "paywall", "member-only"];
      const lowerText = pageText.toLowerCase();
      const paywallSignals = blockers.filter((needle) => lowerText.includes(needle));

      const description =
        document
          .querySelector('meta[name="description"]')
          ?.getAttribute("content")
          ?.trim() ?? "";

      return {
        title: document.title?.trim() ?? "",
        description,
        language: document.documentElement.lang || "unknown",
        textContent: textNodes.join("\n").slice(0, 32000),
        headings,
        links,
        jsonLd,
        paywallSignals,
      };
    });

    return {
      sourceUrl: url,
      finalUrl: page.url(),
      title: extracted.title,
      description: extracted.description,
      language: extracted.language,
      textContent: extracted.textContent,
      headings: extracted.headings,
      links: extracted.links,
      jsonLd: parseJsonLd(extracted.jsonLd),
      paywallSignals: extracted.paywallSignals,
    };
  } finally {
    await page.close();
  }
}
