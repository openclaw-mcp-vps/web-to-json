import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PROBLEMS = [
  {
    title: "Selectors Break Every Week",
    description:
      "Most pages ship JS-heavy UI changes constantly. Hardcoded selectors drift and your scraper silently returns junk.",
  },
  {
    title: "SPAs Hide Real Content",
    description:
      "Basic HTTP fetch misses the rendered content because data lands after hydration, lazy loading, or route transitions.",
  },
  {
    title: "Auth Walls & Paywalls",
    description:
      "The useful data often sits behind soft walls or anti-bot messaging where naive extraction gives fragments only.",
  },
];

export function Problem() {
  return (
    <section id="problem" className="space-y-5">
      <h2 className="text-3xl font-semibold tracking-tight text-[#f0f6fc]">Why Most Scrapers Miss the Data</h2>
      <p className="max-w-3xl text-[#8b949e]">
        Solo builders need output they can trust in production, not selector whack-a-mole. Web-to-JSON focuses on
        rendered content quality first.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {PROBLEMS.map((problem) => (
          <Card key={problem.title}>
            <CardHeader>
              <CardTitle>{problem.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#8b949e]">{problem.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
