import Link from "next/link";
import { HomeMenu } from "@/components/home-menu";
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  getCategoryCounts,
} from "@/lib/categories";
import { getCategoryEmoji } from "@/lib/category-emoji";
import { objects, pairs } from "@/lib/data";

export default function HomePage() {
  const counts = getCategoryCounts();

  return (
    <div className="flex flex-col items-center gap-10">
      <HomeMenu />

      <section className="w-full max-w-lg space-y-4 text-sm leading-relaxed text-muted-foreground">
        <h2 className="text-center text-base font-semibold text-foreground">
          A daily weight guessing game
        </h2>
        <p>
          Weightle is a free puzzle game inspired by daily word games. Instead
          of letters, you compare real objects — from everyday items to animals,
          vehicles, and landmarks — and test your intuition about mass.
        </p>
        <p>
          Our library includes {objects.length.toLocaleString()} curated
          objects and {pairs.length.toLocaleString()} hand-validated pairs.
          Every mass has a plain-language qualifier and a linked reference so
          you know exactly what is being weighed.
        </p>
        <p className="text-center">
          <Link href="/about" className="text-primary underline">
            About Weightle
          </Link>
          {" · "}
          <Link href="/faq" className="text-primary underline">
            FAQ
          </Link>
          {" · "}
          <Link href="/contact" className="text-primary underline">
            Contact
          </Link>
        </p>
      </section>

      <section className="w-full max-w-2xl space-y-4">
        <div className="text-center">
          <h2 className="text-base font-semibold text-foreground">
            Explore the object library
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse every item in the game with weights, qualifiers, and sources.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {CATEGORY_ORDER.map((category) => (
            <Link
              key={category}
              href={`/objects/category/${category}`}
              className="rounded-xl border border-border/70 bg-card/85 px-4 py-3 text-sm transition-colors hover:bg-card"
            >
              <span className="font-medium text-foreground">
                {getCategoryEmoji(category)} {CATEGORY_LABELS[category]}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {counts[category].toLocaleString()} objects —{" "}
                {CATEGORY_DESCRIPTIONS[category].split("—")[0].trim()}
              </span>
            </Link>
          ))}
        </div>
        <p className="text-center text-sm">
          <Link href="/objects" className="text-primary underline">
            View full object library →
          </Link>
        </p>
      </section>

      <section className="w-full max-w-lg space-y-3 text-sm leading-relaxed text-muted-foreground">
        <h2 className="text-center text-base font-semibold text-foreground">
          Tips for a better score
        </h2>
        <ul className="list-inside list-disc space-y-2">
          <li>
            Read the category emoji on each card — animals, vehicles, and food
            follow very different scales.
          </li>
          <li>
            When two items look close, pick the one whose typical real-world
            version is denser or larger.
          </li>
          <li>
            After each round, note the revealed weights; similar objects often
            reappear in Unlimited mode.
          </li>
          <li>
            Use the{" "}
            <Link href="/objects" className="text-primary underline">
              object library
            </Link>{" "}
            to study masses before your next daily attempt.
          </li>
        </ul>
      </section>
    </div>
  );
}
