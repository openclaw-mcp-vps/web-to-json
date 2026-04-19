import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk"
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://web-to-json.com"),
  title: "Web-to-JSON | Any URL into clean structured JSON in one API call",
  description:
    "Post any URL and get structured JSON back. Handles SPAs, auth walls, and paywalls without brittle CSS selectors.",
  applicationName: "Web-to-JSON",
  keywords: [
    "web scraping API",
    "structured extraction",
    "URL to JSON",
    "indie hacker API",
    "Firecrawl alternative"
  ],
  openGraph: {
    title: "Web-to-JSON",
    description:
      "Turn any URL into structured JSON. Built for indie builders who need extraction without selector maintenance.",
    url: "https://web-to-json.com",
    siteName: "Web-to-JSON",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Web-to-JSON",
    description:
      "POST a URL to our API and get clean JSON back. No selectors. SPA-ready."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} bg-background text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
