import Link from "next/link";

import { Button } from "@/components/ui/button";

interface HeroProps {
  paymentLink: string;
}

export function Hero({ paymentLink }: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-[#30363d] bg-gradient-to-br from-[#0d1117] via-[#111d2f] to-[#0d1117] p-6 shadow-[0_0_120px_rgba(47,129,247,0.16)] sm:p-10">
      <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-[#2f81f7]/20 blur-3xl" />

      <div className="relative grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-center">
        <div className="space-y-6">
          <p className="inline-flex items-center rounded-full border border-[#2f81f7]/50 bg-[#0d1117]/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#79c0ff]">
            Data Extraction API
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-[#f0f6fc] sm:text-5xl">
            Web-to-JSON
            <span className="block text-[#79c0ff]">Any URL into clean structured JSON in one API call.</span>
          </h1>

          <p className="max-w-2xl text-lg leading-relaxed text-[#8b949e]">
            POST a URL and get normalized JSON back. No brittle CSS selectors. Built for SPA rendering,
            dynamic pages, login gates, and paywall-heavy sites where simple HTML scraping fails.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/tool" className="inline-flex">
              <Button size="lg" className="w-full sm:w-auto">
                Open Live Extractor
              </Button>
            </Link>

            <a href={paymentLink} target="_blank" rel="noopener noreferrer" className="inline-flex">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Buy Unlimited $15/mo
              </Button>
            </a>
          </div>

          <p className="text-sm text-[#8b949e]">
            Simple pricing: <span className="text-[#c9d1d9]">$0.01/page pay-as-you-go</span> or
            <span className="text-[#c9d1d9]"> $15/month unlimited</span>.
          </p>
        </div>

        <div className="rounded-2xl border border-[#30363d] bg-[#0d1117]/95 p-4 font-mono text-xs text-[#a5d6ff] sm:p-6 sm:text-sm">
          <p className="mb-3 text-[#8b949e]">Example request:</p>
          <pre className="overflow-x-auto whitespace-pre-wrap break-words text-[#c9d1d9]">
{`curl -X POST https://api.webtojson.dev/api/extract \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -d '{"url":"https://example.com/post"}'`}
          </pre>
          <p className="mb-3 mt-6 text-[#8b949e]">Response shape:</p>
          <pre className="overflow-x-auto whitespace-pre-wrap break-words text-[#79c0ff]">
{`{
  "title": "Page title",
  "summary": "Concise factual summary",
  "entities": [...],
  "fields": {...},
  "keyPoints": [...]
}`}
          </pre>
        </div>
      </div>
    </section>
  );
}
