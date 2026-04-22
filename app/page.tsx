import Link from "next/link";

import { ApiDocs } from "@/components/ApiDocs";
import { Faq } from "@/components/Faq";
import { Hero } from "@/components/Hero";
import { Pricing } from "@/components/Pricing";
import { Problem } from "@/components/Problem";
import { Solution } from "@/components/Solution";

type HomePageProps = {
  searchParams: Promise<{
    locked?: string;
  }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? "#";
  const isLockedRedirect = params.locked === "1";

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-[-300px] h-[560px] bg-[radial-gradient(circle_at_top,rgba(47,129,247,0.25),rgba(13,17,23,0))]" />

      <header className="sticky top-0 z-40 border-b border-[#21262d] bg-[#0d1117]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-[#f0f6fc]">
            Web-to-JSON
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-[#8b949e] md:flex">
            <a href="#problem" className="hover:text-[#c9d1d9]">Problem</a>
            <a href="#solution" className="hover:text-[#c9d1d9]">Solution</a>
            <a href="#pricing" className="hover:text-[#c9d1d9]">Pricing</a>
            <a href="#faq" className="hover:text-[#c9d1d9]">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/tool"
              className="rounded-md border border-[#30363d] px-3 py-2 text-xs font-semibold text-[#c9d1d9] hover:border-[#2f81f7] sm:text-sm"
            >
              Tool
            </Link>
            <a
              href={paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-[#2f81f7] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1f6feb] sm:text-sm"
            >
              Buy
            </a>
          </div>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-10 sm:px-6 sm:py-14">
        {isLockedRedirect && (
          <div className="rounded-lg border border-[#da3633]/50 bg-[#2d1212]/40 p-4 text-sm text-[#ffb4b4]">
            Access is currently locked. Complete checkout first, then open your success URL to unlock the tool and API.
          </div>
        )}

        <Hero paymentLink={paymentLink} />
        <Problem />
        <Solution />
        <Pricing paymentLink={paymentLink} />
        <ApiDocs />
        <Faq />
      </main>
    </div>
  );
}
