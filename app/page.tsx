import Link from "next/link";
import { Hero } from "@/components/Hero";
import { Pricing } from "@/components/Pricing";
import { ProblemSolution } from "@/components/ProblemSolution";
import { Faq } from "@/components/Faq";
import { ActivateAccessForm } from "@/components/ActivateAccessForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type HomePageProps = {
  searchParams: Promise<{ paywall?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const showPaywallNotice = params.paywall === "1";

  return (
    <main>
      {showPaywallNotice ? (
        <div className="mx-auto mt-6 max-w-6xl rounded-md border border-[#d29922] bg-[#2d2108] px-4 py-3 text-sm text-[#f2cc60]">
          The extractor is protected by paid access. Purchase a plan, then activate your cookie.
        </div>
      ) : null}
      <Hero />
      <ProblemSolution />

      <section className="mx-auto max-w-6xl px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 text-sm text-muted md:grid-cols-3">
            <div>
              <p className="text-foreground">1. Send URL</p>
              <p className="mt-1">
                POST any public page URL to <code>/api/extract</code> with your paid-access
                cookie.
              </p>
            </div>
            <div>
              <p className="text-foreground">2. Render + parse</p>
              <p className="mt-1">
                Headless Chromium loads the real page, including JavaScript-heavy SPAs.
              </p>
            </div>
            <div>
              <p className="text-foreground">3. Receive JSON</p>
              <p className="mt-1">
                You get structured data ready for agents, dashboards, automations, and ETL jobs.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Pricing />

      <section className="mx-auto max-w-3xl px-6 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Already purchased?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted">
              Enter the same email used at checkout. We will verify your Lemon Squeezy purchase,
              set an access cookie, and unlock the extractor.
            </p>
            <ActivateAccessForm />
            <p className="mt-4 text-sm">
              <Link href="/tool" className="text-[#58a6ff] hover:text-[#79c0ff]">
                Go directly to the extractor
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>

      <Faq />

      <footer className="mx-auto max-w-6xl px-6 py-12 text-center text-sm text-muted">
        Web-to-JSON is designed for solo builders who need structured web data without selector
        maintenance.
      </footer>
    </main>
  );
}
