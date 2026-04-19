import puppeteer, { type Page } from "puppeteer";
import { setTimeout as sleep } from "node:timers/promises";

export type ScrapedPage = {
  requestedUrl: string;
  finalUrl: string;
  title: string;
  description: string;
  textContent: string;
  visibleLinks: Array<{ text: string; href: string }>;
  isLikelyPaywalled: boolean;
};

function cleanWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function pickRelevantText(raw: string) {
  return raw
    .split("\n")
    .map((line) => cleanWhitespace(line))
    .filter((line) => line.length > 25)
    .slice(0, 800)
    .join("\n");
}

async function autoScroll(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 500;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 150);
    });
  });
}

export async function scrapePage(url: string): Promise<ScrapedPage> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage"
    ]
  });

  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(45_000);
    page.setDefaultTimeout(30_000);

    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    );

    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForNetworkIdle({ idleTime: 800, timeout: 12_000 }).catch(() => {
      return undefined;
    });

    await autoScroll(page).catch(() => {
      return undefined;
    });
    await sleep(700);

    const pageData = await page.evaluate(() => {
      const grabMeta = (name: string) => {
        const fromName = document.querySelector(
          `meta[name='${name}']`
        ) as HTMLMetaElement | null;
        const fromProperty = document.querySelector(
          `meta[property='${name}']`
        ) as HTMLMetaElement | null;

        return fromName?.content ?? fromProperty?.content ?? "";
      };

      const contentNodes = document.querySelectorAll(
        "main, article, section, h1, h2, h3, h4, p, li, blockquote"
      );
      const content = Array.from(contentNodes)
        .map((node) => node.textContent ?? "")
        .join("\n");

      const links = Array.from(document.querySelectorAll("a[href]"))
        .map((anchor) => ({
          text: (anchor.textContent ?? "").trim(),
          href: (anchor as HTMLAnchorElement).href
        }))
        .filter((link) => link.href.startsWith("http"))
        .slice(0, 80);

      const title = document.title || grabMeta("og:title") || "Untitled";
      const description =
        grabMeta("description") || grabMeta("og:description") || "";
      const bodyText = content.length > 200 ? content : document.body.innerText;

      return {
        title,
        description,
        bodyText,
        links,
        finalUrl: window.location.href
      };
    });

    const textContent = pickRelevantText(pageData.bodyText);
    const threatWindow = `${pageData.title}\n${pageData.description}\n${textContent
      .slice(0, 2500)
      .toLowerCase()}`;

    const isLikelyPaywalled =
      /subscribe to continue|members only|already a subscriber|sign in to continue|paywall|premium content|log in to read/i.test(
        threatWindow
      );

    return {
      requestedUrl: url,
      finalUrl: pageData.finalUrl,
      title: cleanWhitespace(pageData.title),
      description: cleanWhitespace(pageData.description),
      textContent,
      visibleLinks: pageData.links
        .filter((link) => link.text.length > 0)
        .map((link) => ({
          text: cleanWhitespace(link.text),
          href: link.href
        })),
      isLikelyPaywalled
    };
  } finally {
    await browser.close();
  }
}
