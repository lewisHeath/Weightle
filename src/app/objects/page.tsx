import type { Metadata } from "next";
import Link from "next/link";
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  getCategoryCounts,
} from "@/lib/categories";
import { getCategoryEmoji } from "@/lib/category-emoji";
import { objects } from "@/lib/data";

export const metadata: Metadata = {
  title: "Object library — Weightle",
  description:
    "Browse every object in Weightle with curated mass estimates, qualifiers, and reference sources.",
};

export default function ObjectsIndexPage() {
  const counts = getCategoryCounts();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Object library</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Weightle compares real objects using a hand-curated dataset of{" "}
          {objects.length.toLocaleString()} items. Each entry includes a mass in
          kilograms, a plain-language qualifier, and a linked source. Browse by
          category below or search from any category page.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {CATEGORY_ORDER.map((category) => (
          <Link
            key={category}
            href={`/objects/category/${category}`}
            className="rounded-2xl border border-border/70 bg-card/85 p-5 shadow-sm shadow-black/10 transition-colors hover:border-border hover:bg-card"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden>
                {getCategoryEmoji(category)}
              </span>
              <div className="min-w-0 space-y-1">
                <h2 className="font-semibold text-foreground">
                  {CATEGORY_LABELS[category]}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {CATEGORY_DESCRIPTIONS[category]}
                </p>
                <p className="text-xs text-muted-foreground/80">
                  {counts[category].toLocaleString()} objects
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Weights are estimates with stated assumptions. See{" "}
        <Link href="/faq" className="text-primary underline">
          FAQ
        </Link>{" "}
        for how values are chosen, or{" "}
        <Link href="/contact" className="text-primary underline">
          contact us
        </Link>{" "}
        to suggest a correction.
      </p>
    </div>
  );
}
