import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PricingProps {
  paymentLink: string;
}

export function Pricing({ paymentLink }: PricingProps) {
  return (
    <section id="pricing" className="space-y-6">
      <h2 className="text-3xl font-semibold tracking-tight text-[#f0f6fc]">Simple Pricing for Indie Builders</h2>
      <p className="max-w-3xl text-[#8b949e]">
        Start with low variable cost when you are validating. Switch to unlimited when extraction becomes core.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-[#2f81f7]/40">
          <CardHeader>
            <CardTitle>Pay-as-you-go</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-4xl font-semibold text-[#f0f6fc]">$0.01<span className="text-lg text-[#8b949e]">/page</span></p>
            <p className="text-sm text-[#8b949e]">
              Ideal for data experiments, side projects, and low-volume jobs where every call should stay cheap.
            </p>
            <ul className="space-y-2 text-sm text-[#c9d1d9]">
              <li>- Full rendered extraction</li>
              <li>- Structured JSON output</li>
              <li>- API + dashboard tool access</li>
            </ul>
          </CardContent>
          <CardFooter>
            <a href={paymentLink} target="_blank" rel="noopener noreferrer" className="w-full">
              <Button className="w-full" variant="secondary">Buy Credits</Button>
            </a>
          </CardFooter>
        </Card>

        <Card className="relative border-[#2f81f7] shadow-[0_0_0_1px_rgba(47,129,247,0.4)]">
          <span className="absolute right-4 top-4 rounded-full border border-[#2f81f7]/50 bg-[#0d1117] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#79c0ff]">
            Best Value
          </span>
          <CardHeader>
            <CardTitle>Unlimited</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-4xl font-semibold text-[#f0f6fc]">$15<span className="text-lg text-[#8b949e]">/month</span></p>
            <p className="text-sm text-[#8b949e]">
              Built for founders shipping daily automations, ingestion pipelines, and recurring data jobs.
            </p>
            <ul className="space-y-2 text-sm text-[#c9d1d9]">
              <li>- Unlimited page extraction</li>
              <li>- Priority processing lane</li>
              <li>- Cookie-unlocked private tool</li>
            </ul>
          </CardContent>
          <CardFooter>
            <a href={paymentLink} target="_blank" rel="noopener noreferrer" className="w-full">
              <Button className="w-full">Start Unlimited</Button>
            </a>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
