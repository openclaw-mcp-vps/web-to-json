import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURES = [
  {
    title: "Rendered Browser Capture",
    description:
      "Puppeteer loads the page as a real browser session so SPAs, delayed scripts, and dynamic layouts are actually captured.",
  },
  {
    title: "AI Structured Extraction",
    description:
      "Claude or OpenAI converts noisy page text into stable JSON with key points, entities, and typed fields.",
  },
  {
    title: "Paywall-Aware Signals",
    description:
      "Returns paywall/auth-wall indicators so your pipeline knows when extraction quality is likely constrained.",
  },
  {
    title: "Cookie-Based Paid Access",
    description:
      "Purchased users unlock `/tool` and `/api/extract` access via secure cookie, keeping the monetized feature behind the wall.",
  },
];

export function Solution() {
  return (
    <section id="solution" className="space-y-5">
      <h2 className="text-3xl font-semibold tracking-tight text-[#f0f6fc]">What You Get In One Call</h2>
      <p className="max-w-3xl text-[#8b949e]">
        The API is intentionally narrow: send URL in, receive practical JSON out, with enough structure to plug directly
        into lead enrichment, content indexing, or monitoring workflows.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {FEATURES.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#8b949e]">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
