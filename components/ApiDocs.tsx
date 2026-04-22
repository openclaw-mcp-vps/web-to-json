import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ApiDocs() {
  return (
    <section id="api" className="space-y-5">
      <h2 className="text-3xl font-semibold tracking-tight text-[#f0f6fc]">API Quickstart</h2>
      <p className="max-w-3xl text-[#8b949e]">
        The extractor endpoint accepts a URL and returns normalized JSON from rendered page content.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>POST /api/extract</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-[#c9d1d9]">
          <div>
            <p className="mb-2 font-semibold text-[#f0f6fc]">Request body</p>
            <pre className="overflow-x-auto rounded-md border border-[#30363d] bg-[#0b1016] p-4 text-xs text-[#79c0ff]">{`{
  "url": "https://example.com"
}`}</pre>
          </div>

          <div>
            <p className="mb-2 font-semibold text-[#f0f6fc]">Response body (example)</p>
            <pre className="overflow-x-auto rounded-md border border-[#30363d] bg-[#0b1016] p-4 text-xs text-[#a5d6ff]">{`{
  "ok": true,
  "data": {
    "title": "Example Domain",
    "summary": "...",
    "keyPoints": ["..."],
    "entities": [],
    "fields": {
      "author": null,
      "publishedDate": null,
      "price": null
    }
  }
}`}</pre>
          </div>

          <p className="text-[#8b949e]">
            If neither `OPENAI_API_KEY` nor `ANTHROPIC_API_KEY` is configured, the endpoint still returns useful
            heuristic JSON so your workflow remains operational.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
