import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ObjectImage } from "@/components/object-image";
import {
  CATEGORY_LABELS,
  getObjectsByCategory,
} from "@/lib/categories";
import { getCategoryEmoji } from "@/lib/category-emoji";
import { objects, objectsById, getImageUrl } from "@/lib/data";
import { formatMass } from "@/lib/format-mass";

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return objects.map((obj) => ({ id: obj.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const obj = objectsById.get(id);
  if (!obj) return { title: "Not found" };

  return {
    title: `${obj.name} — ${formatMass(obj.massKg)} | Weightle`,
    description: `${obj.qualifier}. Curated mass estimate used in Weightle with linked source.`,
  };
}

export default async function ObjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const obj = objectsById.get(id);
  if (!obj) notFound();

  const grouped = getObjectsByCategory();
  const sameCategory = grouped[obj.category]
    .filter((item) => item.id !== obj.id)
    .slice(0, 6);

  return (
    <article className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">
          <Link href="/objects" className="text-primary underline">
            Object library
          </Link>
          {" · "}
          <Link
            href={`/objects/category/${obj.category}`}
            className="text-primary underline"
          >
            {CATEGORY_LABELS[obj.category]}
          </Link>
        </p>
        <h1 className="mt-2 text-2xl font-bold">{obj.name}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          This entry is part of the Weightle curated dataset. When {obj.name}{" "}
          appears in a round, the comparison uses the mass and qualifier below.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/85 shadow-sm shadow-black/10">
        <div className="relative aspect-[4/3] w-full bg-muted">
          <ObjectImage
            src={getImageUrl(obj)}
            alt={obj.name}
            sizes="(max-width: 672px) 100vw, 672px"
          />
        </div>
        <dl className="grid gap-4 p-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-muted-foreground">Mass</dt>
            <dd className="mt-1 text-lg font-semibold text-foreground">
              {formatMass(obj.massKg)}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                ({obj.massKg.toLocaleString()} kg)
              </span>
            </dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">Category</dt>
            <dd className="mt-1 text-foreground">
              {getCategoryEmoji(obj.category)} {CATEGORY_LABELS[obj.category]}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-medium text-muted-foreground">Qualifier</dt>
            <dd className="mt-1 text-foreground">{obj.qualifier}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-medium text-muted-foreground">Source</dt>
            <dd className="mt-1">
              <a
                href={obj.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                {obj.sourceUrl.replace(/^https?:\/\/(www\.)?/, "")}
              </a>
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-medium text-muted-foreground">Image credit</dt>
            <dd className="mt-1 text-muted-foreground">{obj.attribution}</dd>
          </div>
        </dl>
      </div>

      <section className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        <h2 className="text-base font-semibold text-foreground">
          How this weight was chosen
        </h2>
        <p>
          We pick a single canonical mass for each object so every player sees
          the same answer. The qualifier explains which variant we mean — for
          example, a specific model, age group, or typical size. When multiple
          references disagree, we choose the figure that best matches the
          qualifier and document the source here.
        </p>
        <p>
          Think a value is wrong?{" "}
          <Link href="/contact" className="text-primary underline">
            Send us a correction
          </Link>{" "}
          with a reference link.
        </p>
      </section>

      {sameCategory.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">
            More in {CATEGORY_LABELS[obj.category]}
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {sameCategory.map((related) => (
              <li key={related.id}>
                <Link
                  href={`/objects/${related.id}`}
                  className="block rounded-xl border border-border/60 px-3 py-2 text-sm transition-colors hover:bg-muted/40"
                >
                  <span className="font-medium text-foreground">
                    {related.name}
                  </span>
                  <span className="ml-2 text-muted-foreground">
                    {formatMass(related.massKg)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-sm">
        <Link href="/play/daily" className="text-primary underline">
          Play today&apos;s puzzle →
        </Link>
      </p>
    </article>
  );
}
