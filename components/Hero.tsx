import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 sm:pt-28">
      <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-[#245f31] bg-[#122017] px-3 py-1 text-xs font-medium text-[#7ee787]">
            New API for indie builders
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Any URL into clean structured JSON in one API call.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted sm:text-xl">
            Skip brittle CSS selectors forever. Web-to-JSON renders modern sites,
            extracts the important content, and returns predictable JSON your app can
            use immediately.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/tool">
              <Button size="lg">Open Live Extractor</Button>
            </Link>
            <a href="#pricing">
              <Button variant="secondary" size="lg">
                View Pricing
              </Button>
            </a>
          </div>
          <p className="mt-4 text-sm text-muted">
            5.3k-star inspiration from eze-is/web-access, delivered as a real API and
            priced up to 10x lower than Firecrawl for solo projects.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-[#0f141b] p-4 shadow-[0_0_80px_rgba(31,111,235,0.2)] sm:p-6">
          <pre className="overflow-x-auto rounded-lg bg-[#090d13] p-4 font-[var(--font-ibm-plex-mono)] text-xs leading-relaxed text-[#a5d6ff] sm:text-sm">
{`POST /api/extract
{
  "url": "https://example.com/article"
}

200 OK
{
  "summary": "...",
  "keyPoints": ["...", "..."],
  "entities": {
    "organizations": ["..."]
  },
  "facts": [{ "label": "Price", "value": "$15/mo" }],
  "source": {
    "finalUrl": "...",
    "isLikelyPaywalled": false
  }
}`}
          </pre>
        </div>
      </div>
    </section>
  );
}
