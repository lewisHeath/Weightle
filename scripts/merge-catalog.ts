/**
 * Merge catalog-seed.jsonl into objects.json and resolve Wikipedia images in batch.
 * Run: npx tsx scripts/merge-catalog.ts
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { ObjectCategory, WeightleObject } from "../src/lib/types";

const USER_AGENT = "Weightle/1.0 (https://weightle.app; catalog-merge)";

interface SeedEntry {
  id: string;
  name: string;
  massKg: number;
  category: ObjectCategory;
  wikiTitle: string;
  qualifier: string;
}

const objectsPath = join(process.cwd(), "src/data/objects.json");
const seedPath = join(process.cwd(), "src/data/catalog-seed.jsonl");

const existing: WeightleObject[] = JSON.parse(readFileSync(objectsPath, "utf-8"));
const existingIds = new Set(existing.map((o) => o.id));
const existingNames = new Set(existing.map((o) => o.name.toLowerCase()));

const seeds: SeedEntry[] = readFileSync(seedPath, "utf-8")
  .trim()
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line) as SeedEntry);

const toAdd: SeedEntry[] = [];
for (const seed of seeds) {
  if (existingIds.has(seed.id) || existingNames.has(seed.name.toLowerCase())) {
    continue;
  }
  toAdd.push(seed);
}

console.log(`Existing: ${existing.length}, seed: ${seeds.length}, new: ${toAdd.length}`);

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWikiImages(titles: string[]): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  const batchSize = 50;

  for (let i = 0; i < titles.length; i += batchSize) {
    const batch = titles.slice(i, i + batchSize);
    const api = new URL("https://en.wikipedia.org/w/api.php");
    api.searchParams.set("action", "query");
    api.searchParams.set("titles", batch.join("|"));
    api.searchParams.set("prop", "pageimages");
    api.searchParams.set("piprop", "original");
    api.searchParams.set("format", "json");

    const res = await fetch(api.toString(), {
      headers: { "User-Agent": USER_AGENT },
    });
    if (!res.ok) {
      console.warn(`Wikipedia API ${res.status} for batch ${i / batchSize + 1}`);
      await sleep(3000);
      continue;
    }

    const data = (await res.json()) as {
      query?: {
        pages?: Record<
          string,
          { title?: string; missing?: string; original?: { source: string } }
        >;
      };
    };

    for (const page of Object.values(data.query?.pages ?? {})) {
      if (page.title && page.original?.source) {
        result.set(page.title.replace(/ /g, "_"), page.original.source);
      }
    }

    await sleep(300);
  }

  return result;
}

async function main() {
  const wikiTitles = toAdd.map((s) => s.wikiTitle);
  console.log(`Fetching Wikipedia images for ${wikiTitles.length} entries...`);
  const images = await fetchWikiImages(wikiTitles);

  const merged: WeightleObject[] = [...existing];
  let withImage = 0;
  let withoutImage = 0;

  for (const seed of toAdd) {
    const imageUrl = images.get(seed.wikiTitle);

    merged.push({
      id: seed.id,
      name: seed.name,
      massKg: seed.massKg,
      qualifier: seed.qualifier,
      sourceUrl: `https://en.wikipedia.org/wiki/${seed.wikiTitle}`,
      category: seed.category,
      imageKey: imageUrl ?? `https://en.wikipedia.org/wiki/${seed.wikiTitle}`,
      attribution: "Wikimedia Commons",
    });

    if (imageUrl) withImage++;
    else withoutImage++;
  }

  writeFileSync(objectsPath, JSON.stringify(merged, null, 2) + "\n");
  console.log(
    `Merged ${merged.length} objects (${withImage} with images, ${withoutImage} fallback)`,
  );
}

main();
