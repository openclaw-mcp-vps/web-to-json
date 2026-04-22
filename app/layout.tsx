import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";

import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://web-to-json.example";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Web-to-JSON | Any URL Into Structured JSON",
    template: "%s | Web-to-JSON",
  },
  description:
    "Web-to-JSON turns any URL into clean structured JSON in one API call. Built for indie builders who need robust extraction from SPAs, auth walls, and paywall-heavy websites.",
  keywords: [
    "web scraping api",
    "structured data extraction",
    "url to json api",
    "puppeteer extractor",
    "indie hacker api",
  ],
  openGraph: {
    title: "Web-to-JSON — any URL into clean structured JSON in one API call",
    description:
      "POST a URL and get production-friendly JSON back. No selector maintenance, works with JS-heavy pages.",
    url: siteUrl,
    siteName: "Web-to-JSON",
    type: "website",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Web-to-JSON API",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Web-to-JSON",
    description: "Any URL into clean structured JSON in one API call.",
    images: ["/og-image.svg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0d1117",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${plexMono.variable} dark h-full bg-[#0d1117]`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-[#0d1117] text-[#c9d1d9] antialiased">{children}</body>
    </html>
  );
}
