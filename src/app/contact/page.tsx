import type { Metadata } from "next";
import Link from "next/link";
import { getContactEmail } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Contact — Weightle",
  description: "Contact the Weightle team for feedback, corrections, or support.",
};

export default function ContactPage() {
  const email = getContactEmail();

  return (
    <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Contact</h1>
        <p className="mt-2">
          We&apos;d love to hear from you — whether it&apos;s feedback on the
          game, a correction to an object&apos;s weight, a broken image, or a
          privacy question.
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Email</h2>
        <p>
          The best way to reach us is by email:{" "}
          <a
            href={`mailto:${email}`}
            className="text-primary underline"
          >
            {email}
          </a>
        </p>
        <p>
          We aim to reply within a few business days. Please include the object
          name or a screenshot if you&apos;re reporting a data issue.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">
          Common topics
        </h2>
        <ul className="list-inside list-disc space-y-1">
          <li>
            <strong className="text-foreground">Weight corrections</strong> —
            tell us the object and a source; we update the curated dataset
            regularly.
          </li>
          <li>
            <strong className="text-foreground">Remove ads</strong> — use the
            link in the site footer, or email us if payment did not activate.
          </li>
          <li>
            <strong className="text-foreground">Privacy &amp; cookies</strong>{" "}
            — see our{" "}
            <Link href="/privacy" className="text-primary underline">
              privacy policy
            </Link>{" "}
            or use <strong className="text-foreground">Cookie settings</strong>{" "}
            in the footer.
          </li>
        </ul>
      </section>

      <p>
        <Link href="/" className="text-primary underline">
          ← Back home
        </Link>
      </p>
    </div>
  );
}
