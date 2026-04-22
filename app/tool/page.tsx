import Link from "next/link";

import { ApiDocs } from "@/components/ApiDocs";
import { ExtractorForm } from "@/components/ExtractorForm";

export const metadata = {
  title: "Extractor Tool",
  description: "Paid extractor console for Web-to-JSON.",
};

export default function ToolPage() {
  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? "#";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#21262d] pb-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#79c0ff]">Private Tool</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#f0f6fc]">Live URL → JSON Extractor</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#8b949e]">
            This route is gated by secure cookie access. Submit any URL and get structured JSON from rendered content.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/"
            className="rounded-md border border-[#30363d] px-3 py-2 text-sm font-semibold text-[#c9d1d9] hover:border-[#2f81f7]"
          >
            Back to Landing
          </Link>
          <a
            href={paymentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-[#2f81f7] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1f6feb]"
          >
            Buy Access
          </a>
        </div>
      </header>

      <ExtractorForm paymentLink={paymentLink} />

      <section className="rounded-xl border border-[#30363d] bg-[#0f1722]/70 p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-[#f0f6fc]">Best Practices</h2>
        <ul className="mt-3 space-y-2 text-sm text-[#8b949e]">
          <li>- Use canonical URLs when possible to avoid duplicate content extraction.</li>
          <li>- Retry pages that are timing-sensitive or geo-blocked to improve output coverage.</li>
          <li>- Keep your downstream parser resilient to optional/null fields.</li>
        </ul>
      </section>

      <ApiDocs />
    </main>
  );
}
