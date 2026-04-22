const FAQ_ITEMS = [
  {
    question: "How is this different from web-access skills?",
    answer:
      "web-access style skills are built for conversational agents. Web-to-JSON is an API-first service designed for production pipelines and automation jobs.",
  },
  {
    question: "Do I need to maintain selectors?",
    answer:
      "No. You send only the URL. The extractor renders the page, captures the meaningful content, and returns normalized JSON without CSS selector maintenance.",
  },
  {
    question: "Can it handle SPAs and delayed content?",
    answer:
      "Yes. Puppeteer executes client-side JavaScript, waits for network idle, and scrolls to trigger lazy-loaded sections before extraction.",
  },
  {
    question: "How does paid access work with Stripe Payment Link?",
    answer:
      "After checkout, Stripe sends a webhook event with the checkout session ID. The success page exchanges that session ID for an httpOnly cookie that unlocks the protected tool and API endpoint.",
  },
  {
    question: "What should I configure in Stripe?",
    answer:
      "Set your payment link's success URL to `/success?session_id={CHECKOUT_SESSION_ID}` so buyers can be unlocked automatically after payment.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="space-y-5">
      <h2 className="text-3xl font-semibold tracking-tight text-[#f0f6fc]">Frequently Asked Questions</h2>
      <div className="space-y-3">
        {FAQ_ITEMS.map((item) => (
          <details
            key={item.question}
            className="rounded-lg border border-[#30363d] bg-[#0f1722]/60 p-4 open:border-[#2f81f7]/50"
          >
            <summary className="cursor-pointer list-none text-base font-semibold text-[#f0f6fc]">
              {item.question}
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-[#8b949e]">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
