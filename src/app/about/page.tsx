import type { Metadata } from "next";
import Link from "next/link";
import { objects, pairs } from "@/lib/data";

export const metadata: Metadata = {
  title: "About — Weightle",
  description:
    "Learn about Weightle, a free daily weight-guessing game with curated object data and sourced images.",
};

export default function AboutPage() {
  return (
    <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
      <div>
        <h1 className="text-2xl font-bold text-foreground">About Weightle</h1>
        <p className="mt-2">
          Weightle is a free browser game at{" "}
          <a
            href="https://weightle.app"
            className="text-primary underline"
          >
            weightle.app
          </a>
          . Each round shows two real-world objects side by side — your job is
          to pick the heavier one. After each guess, we reveal the actual
          weights and how close you were.
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Game modes</h2>
        <ul className="list-inside list-disc space-y-1">
          <li>
            <strong className="text-foreground">Daily Weightle</strong> — one
            shared puzzle for everyone, resetting at midnight UTC. Compare
            scores with friends on the same five rounds.
          </li>
          <li>
            <strong className="text-foreground">Unlimited Weightle</strong> —
            a fresh random set of five rounds every time you play.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">
          Curated data
        </h2>
        <p>
          The game uses a hand-curated library of{" "}
          <strong className="text-foreground">
            {objects.length.toLocaleString()} objects
          </strong>{" "}
          and{" "}
          <strong className="text-foreground">
            {pairs.length.toLocaleString()} valid pairs
          </strong>
          . Each object has a canonical mass in kilograms, a plain-language
          qualifier (e.g. &ldquo;average medium apple&rdquo;), and a linked
          source. Pairs are only included when the weight difference is at
          least 20%, so every round has a clear answer. Browse the full{" "}
          <Link href="/objects" className="text-primary underline">
            object library
          </Link>{" "}
          or read the{" "}
          <Link href="/faq" className="text-primary underline">
            FAQ
          </Link>{" "}
          for more detail.
        </p>
        <p>
          Object photos come from{" "}
          <strong className="text-foreground">Wikimedia Commons</strong> with
          full attribution on our{" "}
          <Link href="/credits" className="text-primary underline">
            credits page
          </Link>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">
          Privacy &amp; ads
        </h2>
        <p>
          Weightle does not require an account. Game progress and preferences
          are stored locally in your browser. We may show ads via Google
          AdSense; you can accept or reject ad cookies, or pay once to remove
          ads entirely. See our{" "}
          <Link href="/privacy" className="text-primary underline">
            privacy policy
          </Link>{" "}
          for details.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Contact</h2>
        <p>
          Questions, feedback, or corrections?{" "}
          <Link href="/contact" className="text-primary underline">
            Get in touch
          </Link>
          .
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
