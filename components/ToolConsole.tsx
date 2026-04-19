"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ExtractResponse = {
  data?: unknown;
  message?: string;
};

export function ToolConsole() {
  const [url, setUrl] = useState("");
  const [provider, setProvider] = useState<"auto" | "openai" | "anthropic">("auto");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url, provider })
      });

      const payload = (await res.json()) as ExtractResponse;

      if (!res.ok) {
        setError(payload.message ?? "Extraction failed.");
        setResponse(null);
        return;
      }

      setResponse(JSON.stringify(payload.data, null, 2));
    } catch {
      setError("Network error while requesting extraction.");
      setResponse(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Run an extraction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <input
                type="url"
                required
                placeholder="https://example.com"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                className="h-11 rounded-md border border-border bg-[#0c1118] px-4 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
              />

              <select
                value={provider}
                onChange={(event) =>
                  setProvider(event.target.value as "auto" | "openai" | "anthropic")
                }
                className="h-11 rounded-md border border-border bg-[#0c1118] px-3 text-sm text-foreground focus:border-accent focus:outline-none"
              >
                <option value="auto">auto provider</option>
                <option value="openai">force OpenAI</option>
                <option value="anthropic">force Anthropic</option>
              </select>

              <Button type="submit" className="h-11" disabled={loading}>
                {loading ? "Extracting..." : "Extract JSON"}
              </Button>
            </div>
          </form>
          {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Structured output</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="max-h-[560px] overflow-auto rounded-md bg-[#090d13] p-4 font-[var(--font-ibm-plex-mono)] text-xs text-[#a5d6ff]">
            {response ?? "Run an extraction to see JSON output."}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API example</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-auto rounded-md bg-[#090d13] p-4 font-[var(--font-ibm-plex-mono)] text-xs text-[#c9d1d9]">
{`curl -X POST http://localhost:3000/api/extract \\
  -H "Content-Type: application/json" \\
  -H "Cookie: w2j_access=YOUR_TOKEN" \\
  -d '{"url":"https://example.com","provider":"auto"}'`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
