import type { Metadata } from "next";
import Link from "next/link";
import { HowToPlay } from "@/components/how-to-play";
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
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <ThemeProvider>
          <header className="shrink-0 border-b border-border bg-card/80 backdrop-blur-sm">
            <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-xl font-bold tracking-tight"
              >
                <span aria-hidden className="text-2xl leading-none">
                  ⚖️
                </span>
                <span>Weightle</span>
              </Link>
              <nav className="flex items-center gap-1 sm:gap-2">
                <ThemeToggle />
                <HowToPlay />
                <Link
                  href="/credits"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Credits
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
            {children}
          </main>
          <footer className="mt-auto shrink-0 border-t py-4 text-center text-sm text-muted-foreground">
            <p>
              Weights are estimates with stated assumptions.{" "}
              <Link href="/credits" className="underline hover:text-foreground">
                Image credits
              </Link>
            </p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
