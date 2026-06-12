import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  getObjectsByCategory,
  isObjectCategory,
} from "@/lib/categories";
import { getCategoryEmoji } from "@/lib/category-emoji";
import { formatMass } from "@/lib/format-mass";
import type { ObjectCategory } from "@/lib/types";

type PageProps = {
  params: Promise<{ category: string }>;
};

export function generateStaticParams() {
  return CATEGORY_ORDER.map((category) => ({ category }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  if (!isObjectCategory(category)) return { title: "Not found" };

  const label = CATEGORY_LABELS[category];
  return {
    title: `${label} — Weightle object library`,
    description: CATEGORY_DESCRIPTIONS[category],
  };
}

export default async function CategoryObjectsPage({ params }: PageProps) {
  const { category: categoryParam } = await params;
  if (!isObjectCategory(categoryParam)) notFound();

  const category = categoryParam as ObjectCategory;
  const grouped = getObjectsByCategory();
  const items = grouped[category];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          <Link href="/objects" className="text-primary underline">
            Object library
          </Link>
        </p>
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold">
          <span aria-hidden>{getCategoryEmoji(category)}</span>
          {CATEGORY_LABELS[category]}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {CATEGORY_DESCRIPTIONS[category]} This category includes{" "}
          {items.length.toLocaleString()} curated objects used in Weightle
          rounds.
        </p>
      </div>

      <ul className="divide-y divide-border/60 rounded-2xl border border-border/70 bg-card/85">
        {items.map((obj) => (
          <li key={obj.id}>
            <Link
              href={`/objects/${obj.id}`}
              className="flex items-center justify-between gap-4 px-4 py-3 text-sm transition-colors hover:bg-muted/40"
            >
              <span className="font-medium text-foreground">{obj.name}</span>
              <span className="shrink-0 text-muted-foreground">
                {formatMass(obj.massKg)}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="text-sm text-muted-foreground">
        <Link href="/objects" className="text-primary underline">
          ← All categories
        </Link>
      </p>
    </div>
  );
}
