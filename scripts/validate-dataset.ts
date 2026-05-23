import { readFileSync } from "fs";
import { join } from "path";
import {
  isValidPair,
  MAX_WEIGHT_RATIO,
  MIN_WEIGHT_RATIO,
  weightRatio,
} from "../src/lib/pairs";
import type { WeightleObject } from "../src/lib/types";

const objects: WeightleObject[] = JSON.parse(
  readFileSync(join(process.cwd(), "src/data/objects.json"), "utf-8"),
);

let errors = 0;

const ids = new Set<string>();
for (const obj of objects) {
  if (ids.has(obj.id)) {
    console.error(`Duplicate id: ${obj.id}`);
    errors++;
  }
  ids.add(obj.id);

  if (!obj.name || obj.massKg <= 0) {
    console.error(`Invalid object ${obj.id}: name or mass`);
    errors++;
  }
  if (!obj.qualifier || !obj.sourceUrl) {
    console.error(`Missing qualifier/source for ${obj.id}`);
    errors++;
  }
  if (!obj.imageKey || !obj.attribution) {
    console.error(`Missing image/attribution for ${obj.id}`);
    errors++;
  }
  if (obj.imageKey.includes("en.wikipedia.org/wiki/")) {
    console.error(
      `Invalid imageKey (Wikipedia page URL, not an image): ${obj.id}`,
    );
    errors++;
  }
  if (/\.(webm|ogv)$/i.test(obj.imageKey)) {
    console.error(`Invalid imageKey (video format): ${obj.id}`);
    errors++;
  }
}

const pairs: { objectAId: string; objectBId: string }[] = JSON.parse(
  readFileSync(join(process.cwd(), "src/data/pairs.json"), "utf-8"),
);

const byId = new Map(objects.map((o) => [o.id, o]));

for (const pair of pairs) {
  const a = byId.get(pair.objectAId);
  const b = byId.get(pair.objectBId);
  if (!a || !b) {
    console.error(
      `Pair references missing object: ${pair.objectAId} ${pair.objectBId}`,
    );
    errors++;
    continue;
  }
  if (!isValidPair(a, b)) {
    const ratio = weightRatio(a, b).toFixed(2);
    console.error(
      `Invalid pair ratio ${ratio} (${MIN_WEIGHT_RATIO}–${MAX_WEIGHT_RATIO}): ${pair.objectAId} vs ${pair.objectBId}`,
    );
    errors++;
  }
}

if (errors > 0) {
  console.error(`Validation failed with ${errors} error(s)`);
  process.exit(1);
}

console.log(`OK: ${objects.length} objects, ${pairs.length} pairs`);
