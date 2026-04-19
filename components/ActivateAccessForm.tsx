"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ActivateAccessForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const payload = (await res.json()) as { message?: string };

      if (!res.ok) {
        setMessage(payload.message ?? "Could not activate access.");
        return;
      }

      setMessage("Access activated. Redirecting to the extractor...");
      setTimeout(() => {
        router.push("/tool");
      }, 700);
    } catch {
      setMessage("Network error while activating access.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
      <input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@yourdomain.com"
        className="h-11 rounded-md border border-border bg-[#0c1118] px-4 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
      />
      <Button type="submit" disabled={loading} className="h-11">
        {loading ? "Verifying purchase..." : "Activate Paid Access"}
      </Button>
      {message ? <p className="sm:col-span-2 text-sm text-muted">{message}</p> : null}
    </form>
  );
}
