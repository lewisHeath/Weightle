import type { Metadata } from "next";
import Link from "next/link";
import { AdLayoutShell } from "@/components/ads/ad-layout-shell";
import { AdsenseLoader } from "@/components/ads/adsense-loader";
import { ConsentModeScript } from "@/components/ads/consent-mode-script";
import { AdFreeProvider } from "@/components/ad-free-provider";
import { ConsentProvider } from "@/components/consent-provider";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { HowToPlay } from "@/components/how-to-play";
import { SiteFooter } from "@/components/site-footer";
import { SoundProvider } from "@/components/sound-provider";
import { SoundToggle } from "@/components/sound-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeScript } from "@/components/theme-script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weightle — Which is heavier?",
  description:
    "A daily guessing game. Compare two objects and pick the heavier one.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://weightle.app",
  ),
  openGraph: {
    title: "Weightle ⚖️",
    description: "Which object is heavier? Play the daily puzzle.",
    siteName: "Weightle",
  },
  appleWebApp: {
    capable: true,
    title: "Weightle",
    statusBarStyle: "black-translucent",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <ConsentModeScript />
      </head>
      <body className="flex min-h-dvh flex-col antialiased">
        <ThemeProvider>
          <SoundProvider>
            <AdFreeProvider>
              <ConsentProvider>
              <AdsenseLoader />
              <header className="shrink-0 border-b border-border bg-card/80 backdrop-blur-sm">
                <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
                  <Link
                    href="/"
                    className="brand-link flex items-center gap-2 text-xl font-bold tracking-tight"
                  >
                    <span aria-hidden className="text-2xl leading-none">
                      ⚖️
                    </span>
                    <span className="brand-name">Weightle</span>
                  </Link>
                  <nav className="flex items-center gap-1 sm:gap-2">
                    <SoundToggle />
                    <ThemeToggle />
                    <HowToPlay />
                    <Link
                      href="/stats"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Stats
                    </Link>
                  </nav>
                </div>
              </header>
              <main className="flex flex-1 flex-col py-8">
                <AdLayoutShell>{children}</AdLayoutShell>
              </main>
              <SiteFooter />
              <CookieConsentBanner />
            </ConsentProvider>
            </AdFreeProvider>
          </SoundProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
