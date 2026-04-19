import Script from "next/script";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const productId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID;
const checkoutUrl = productId
  ? `https://checkout.lemonsqueezy.com/buy/${productId}`
  : "#";

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-16">
      <Script src="https://app.lemonsqueezy.com/js/lemon.js" strategy="afterInteractive" />

      <div className="mb-10 text-center">
        <h2 className="text-3xl font-semibold sm:text-4xl">Simple pricing that scales with side projects</h2>
        <p className="mt-3 text-muted">
          Start with pay-as-you-go. Upgrade when you need unlimited extraction.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Starter</CardTitle>
            <CardDescription>For occasional scraping jobs and small MVPs.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold">$0.01/page</p>
            <ul className="mt-5 space-y-2 text-sm text-muted">
              <li>- JSON extraction with SPA rendering</li>
              <li>- Handles auth walls and paywall detection</li>
              <li>- Ideal for scripts and cron jobs</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-[#2ea043] shadow-[0_0_32px_rgba(46,160,67,0.25)]">
          <CardHeader>
            <CardTitle>Unlimited</CardTitle>
            <CardDescription>Best for builders shipping data-heavy products.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold">$15/mo</p>
            <ul className="mt-5 space-y-2 text-sm text-muted">
              <li>- Unlimited extraction calls</li>
              <li>- Priority queue for faster processing</li>
              <li>- Cookie-based access to protected endpoint</li>
            </ul>
            <a
              href={checkoutUrl}
              className="lemonsqueezy-button mt-6 inline-flex h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-semibold text-black transition hover:bg-accent-strong disabled:pointer-events-none disabled:opacity-60"
              aria-disabled={!productId}
            >
              {productId ? "Start Unlimited with Lemon Squeezy" : "Set NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID"}
            </a>
          </CardContent>
        </Card>
      </div>
      <p className="mt-4 text-center text-xs text-muted">
        Lemon Squeezy checkout opens in overlay when configured with a valid product checkout ID.
      </p>
    </section>
  );
}
