"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type UnlockState = "idle" | "loading" | "success" | "error";

export default function SuccessPage() {
  const [sessionId, setSessionId] = useState("");
  const [state, setState] = useState<UnlockState>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const currentSessionId = new URLSearchParams(window.location.search).get("session_id") || "";
    setSessionId(currentSessionId);

    async function unlock() {
      if (!currentSessionId) {
        setState("error");
        setMessage("Missing session_id. Configure Stripe success URL as /success?session_id={CHECKOUT_SESSION_ID}.");
        return;
      }

      setState("loading");

      try {
        const response = await fetch("/api/auth/complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId: currentSessionId }),
        });

        const payload = (await response.json()) as { ok?: boolean; error?: string };

        if (!response.ok || !payload.ok) {
          setState("error");
          setMessage(payload.error || "Unable to unlock access yet. Wait for webhook delivery and retry.");
          return;
        }

        setState("success");
        setMessage("Access unlocked. You can now use the private extractor tool.");
      } catch {
        setState("error");
        setMessage("Network error while validating checkout session.");
      }
    }

    unlock();
  }, []);

  const statusText =
    state === "loading"
      ? "Verifying your Stripe session..."
      : state === "success"
        ? "Unlock successful"
        : state === "error"
          ? "Unlock failed"
          : "Preparing unlock...";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-4 py-8 sm:px-6">
      <div className="rounded-2xl border border-[#30363d] bg-[#0f1722]/75 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#79c0ff]">Stripe Checkout</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#f0f6fc]">{statusText}</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#8b949e]">{message}</p>

        {sessionId && <p className="mt-2 text-xs text-[#8b949e]">Session: {sessionId}</p>}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/tool" className="inline-flex">
            <Button className="w-full sm:w-auto">Open Extractor Tool</Button>
          </Link>
          <Link href="/" className="inline-flex">
            <Button variant="secondary" className="w-full sm:w-auto">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
