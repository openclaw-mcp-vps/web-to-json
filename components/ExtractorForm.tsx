"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ExtractResponse {
  ok: boolean;
  data?: unknown;
  error?: string;
}

interface ExtractorFormProps {
  paymentLink: string;
}

export function ExtractorForm({ paymentLink }: ExtractorFormProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<unknown>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  const prettyJson = useMemo(() => {
    if (!result) {
      return "";
    }

    return JSON.stringify(result, null, 2);
  }, [result]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    setElapsedMs(null);
    setIsLoading(true);

    const startedAt = performance.now();

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const payload = (await response.json()) as ExtractResponse;
      const duration = Math.round(performance.now() - startedAt);
      setElapsedMs(duration);

      if (response.status === 401) {
        setError("This endpoint is locked. Complete checkout, then return to /success with your Stripe session ID.");
        return;
      }

      if (!response.ok || !payload.ok) {
        setError(payload.error || "Extraction failed. Please retry with a valid URL.");
        return;
      }

      setResult(payload.data ?? null);
    } catch {
      setError("Network error while calling the extractor API.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="rounded-xl border border-[#30363d] bg-[#0f1722]/80 p-4 sm:p-6">
        <label htmlFor="url" className="mb-2 block text-sm font-semibold text-[#f0f6fc]">
          URL to extract
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            id="url"
            type="url"
            required
            placeholder="https://example.com/article"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            autoComplete="off"
          />
          <Button type="submit" disabled={isLoading} className="sm:w-auto">
            {isLoading ? "Extracting..." : "Extract JSON"}
          </Button>
        </div>
        <p className="mt-3 text-xs text-[#8b949e]">
          This endpoint renders JavaScript-driven pages before extraction. Typical latency: 2-8 seconds per page.
        </p>
      </form>

      {error && (
        <div className="rounded-lg border border-[#da3633]/40 bg-[#2d1212]/40 p-4 text-sm text-[#ffb4b4]">
          <p>{error}</p>
          <a href={paymentLink} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex">
            <Button variant="secondary" size="sm">
              Buy Access with Stripe
            </Button>
          </a>
        </div>
      )}

      {prettyJson && (
        <div className="space-y-2 rounded-xl border border-[#30363d] bg-[#0f1722]/80 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-[#f0f6fc]">Extraction Result</h3>
            <span className="text-xs text-[#8b949e]">{elapsedMs ? `${elapsedMs} ms` : ""}</span>
          </div>
          <pre className="max-h-[520px] overflow-auto rounded-md border border-[#30363d] bg-[#0b1016] p-4 text-xs text-[#a5d6ff]">
            {prettyJson}
          </pre>
        </div>
      )}
    </div>
  );
}
