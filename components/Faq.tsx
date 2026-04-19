import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faq = [
  {
    question: "Do I need to provide selectors or XPaths?",
    answer:
      "No. Send a URL and Web-to-JSON returns structured output with summary, key points, entities, facts, and links."
  },
  {
    question: "Will this work on SPAs and dynamic pages?",
    answer:
      "Yes. Requests are rendered with Puppeteer first, then extraction runs on visible page content, not raw HTML alone."
  },
  {
    question: "How does paid access work?",
    answer:
      "After purchase, Lemon Squeezy sends a webhook. Enter the same purchase email to activate an access cookie used by /api/extract."
  },
  {
    question: "What if no AI key is configured?",
    answer:
      "The API still works with deterministic extraction so you can ship immediately, then enable OpenAI or Anthropic later for richer results."
  }
];

export function Faq() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="mb-8 text-center text-3xl font-semibold sm:text-4xl">FAQ</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {faq.map((item) => (
          <Card key={item.question}>
            <CardHeader>
              <CardTitle className="text-lg">{item.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted">{item.answer}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
