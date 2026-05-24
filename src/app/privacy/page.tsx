import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy — Weightle",
  description: "How Weightle handles your data, cookies, and advertising.",
};

export default function PrivacyPage() {
  return (
    <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Privacy policy</h1>
        <p className="mt-2">
          Last updated: May 2026. Weightle ({""}
          <a
            href="https://weightle.app"
            className="text-primary underline"
          >
            weightle.app
          </a>
          ) is a free daily guessing game. This policy explains what we collect
          and how advertising works on the site.
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">
          What we store on your device
        </h2>
        <p>
          Weightle saves game progress and preferences in your browser&apos;s{" "}
          <strong className="text-foreground">localStorage</strong>, including
          daily completion, streaks, stats, sound/theme settings, and your
          cookie consent choice. This data stays on your device and is not sent
          to our servers.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Cookies & ads</h2>
        <p>
          If you <strong className="text-foreground">accept</strong> cookies in
          our banner, we may show personalized ads served by{" "}
          <strong className="text-foreground">Google AdSense</strong>. Google may
          use cookies and similar technologies to serve and measure those ads.
          If you <strong className="text-foreground">reject</strong>{" "}
          non-essential cookies, we still show ads but they are
          non-personalized and do not use ad-tracking cookies.
        </p>
        <p>
          We use{" "}
          <a
            href="https://developers.google.com/tag-platform/security/guides/consent"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            Google Consent Mode
          </a>{" "}
          so ad-related storage stays denied until you accept.
        </p>
        <p>
          Manage your choice anytime via{" "}
          <strong className="text-foreground">Cookie settings</strong> in the
          site footer.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">
          Third-party services
        </h2>
        <ul className="list-inside list-disc space-y-1">
          <li>
            <strong className="text-foreground">Google AdSense</strong> — ads
            (only if you accept cookies). See{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Google&apos;s privacy policy
            </a>
            .
          </li>
          <li>
            <strong className="text-foreground">Cloudflare CDN</strong> — object
            images at cdn.weightle.app.
          </li>
          <li>
            <strong className="text-foreground">Hosting</strong> — the site runs
            on Google Cloud Run in the EU (europe-west2).
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Your rights</h2>
        <p>
          Depending on where you live (e.g. UK, EU, California), you may have
          rights to access, delete, or object to certain processing. Because we
          do not operate user accounts, most game data is already under your
          control via clearing site data in your browser.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Children</h2>
        <p>
          Weightle is intended for a general audience. We do not knowingly
          collect personal information from children.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Changes</h2>
        <p>
          We may update this policy as the site changes. Continued use after
          updates means you accept the revised policy.
        </p>
      </section>

      <p>
        <Link href="/" className="text-primary underline">
          ← Back home
        </Link>
      </p>
    </div>
  );
}
