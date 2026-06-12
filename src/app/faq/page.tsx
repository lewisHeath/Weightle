import type { Metadata } from "next";
import Link from "next/link";
import { getContactEmail } from "@/lib/contact";
import { objects, pairs } from "@/lib/data";

export const metadata: Metadata = {
  title: "FAQ — Weightle",
  description:
    "Frequently asked questions about Weightle, how object weights are sourced, and how the daily puzzle works.",
};

type FaqItem = { q: string; a: React.ReactNode };

const faqs: FaqItem[] = [
  {
    q: "What is Weightle?",
    a: "Weightle is a free browser game where you compare two real-world objects and guess which one is heavier. Each game has five rounds. After every pick, we reveal the actual masses and how far off you were.",
  },
  {
    q: "How is Weightle different from other daily games?",
    a: "Instead of words or numbers, Weightle tests your intuition about physical mass. Every object in the game comes from a curated dataset with a stated qualifier (for example, “average medium apple”) and a linked reference source, so you always know what is being compared.",
  },
  {
    q: "What is Daily Weightle?",
    a: "Daily Weightle is the same five-round puzzle for every player worldwide. It resets at midnight UTC. That makes it easy to compare scores with friends on the same day’s challenge.",
  },
  {
    q: "What is Unlimited Weightle?",
    a: "Unlimited mode draws a fresh random set of five rounds every time you play. It is ideal for practice or when you have already finished today’s daily puzzle.",
  },
  {
    q: "How are object weights chosen?",
    a: "Each object has a canonical mass in kilograms chosen by us from published references — manufacturer specs, encyclopaedia entries, scientific averages, or similar sources. We record a plain-language qualifier so the comparison is unambiguous, and we link to the source on every object page.",
  },
  {
    q: "Why do some weights include a qualifier?",
    a: "Mass varies. A “medium apple” and a “large watermelon” need context. Qualifiers explain exactly which version of an object we mean, which keeps comparisons fair and makes corrections easier.",
  },
  {
    q: "Can I browse all objects in the game?",
    a: (
      <>
        Yes. The{" "}
        <Link href="/objects" className="text-primary underline">
          object library
        </Link>{" "}
        lists all {objects.length.toLocaleString()} items organised by
        category, each with its weight, qualifier, and source.
      </>
    ),
  },
  {
    q: "How many possible rounds are there?",
    a: `We pre-compute valid pairs where the heavier object is at least 20% heavier than the lighter one. That gives ${pairs.length.toLocaleString()} distinct match-ups across the library.`,
  },
  {
    q: "Do I need an account?",
    a: "No. Progress, streaks, and settings are stored in your browser’s local storage. Nothing is sent to our servers unless you choose to pay to remove ads.",
  },
  {
    q: "Is Weightle free?",
    a: "Yes. The game is free to play. We may show ads to support hosting costs. You can also pay a one-time fee to hide ads on your device.",
  },
  {
    q: "How do cookies and ads work?",
    a: (
      <>
        If you accept cookies, Google AdSense may show personalised ads. If
        you reject, we still show non-personalised ads without ad-tracking
        cookies. See our{" "}
        <Link href="/privacy" className="text-primary underline">
          privacy policy
        </Link>{" "}
        for full details.
      </>
    ),
  },
  {
    q: "I found an incorrect weight — what should I do?",
    a: (
      <>
        Email us with the object name and a reference link. We review
        corrections regularly and update the curated dataset. See our{" "}
        <Link href="/contact" className="text-primary underline">
          contact page
        </Link>
        .
      </>
    ),
  },
  {
    q: "Where do the images come from?",
    a: (
      <>
        Object photos are sourced from Wikimedia Commons with attribution
        listed on our{" "}
        <Link href="/credits" className="text-primary underline">
          credits page
        </Link>
        .
      </>
    ),
  },
];

export default function FaqPage() {
  const email = getContactEmail();

  return (
    <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Frequently asked questions
        </h1>
        <p className="mt-2">
          Answers about how Weightle works, how we source weights, and how to
          get help.
        </p>
      </div>

      <div className="space-y-6">
        {faqs.map(({ q, a }) => (
          <section key={q} className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">{q}</h2>
            <div>{a}</div>
          </section>
        ))}
      </div>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-foreground">
          Still have a question?
        </h2>
        <p>
          Visit our{" "}
          <Link href="/contact" className="text-primary underline">
            contact page
          </Link>{" "}
          or email{" "}
          <a href={`mailto:${email}`} className="text-primary underline">
            {email}
          </a>
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
