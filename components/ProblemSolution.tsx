import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ProblemSolution() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>The problem</CardTitle>
            <CardDescription>
              Scraping pipelines break every time frontends change.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted">
            <p>- CSS selectors are brittle and expensive to maintain.</p>
            <p>- Headless render + parsing logic steals dev time from product work.</p>
            <p>- Most APIs fail on JavaScript-heavy pages and gated content.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>The solution</CardTitle>
            <CardDescription>One endpoint that returns usable structured JSON.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted">
            <p>- Puppeteer renders SPAs exactly like a real browser session.</p>
            <p>- AI extraction returns summary, entities, facts, and useful links.</p>
            <p>- Built for solo makers who need data now, not scraper maintenance.</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
