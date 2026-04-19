import Link from "next/link";
import { cookies } from "next/headers";
import { ToolConsole } from "@/components/ToolConsole";
import { ACCESS_COOKIE_NAME, verifyAccessToken } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ToolPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const access = token ? await verifyAccessToken(token) : null;

  if (!access) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-20">
        <Card>
          <CardHeader>
            <CardTitle>Extractor is behind the paywall</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted">
            <p>
              Purchase Unlimited, then activate access with your checkout email to unlock
              <code> /api/extract</code> and this live console.
            </p>
            <p>
              <Link href="/" className="text-[#58a6ff] hover:text-[#79c0ff]">
                Return to pricing and activation
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-semibold">Web-to-JSON Extractor</h1>
        <p className="text-sm text-muted">
          Access granted for <span className="text-foreground">{access.email}</span>. Use this
          console to test URLs, then call the API directly from your app.
        </p>
      </div>
      <ToolConsole />
    </main>
  );
}
