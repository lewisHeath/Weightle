import { readFileSync } from "fs";
import { join } from "path";

const MIN_RATIO = 1.2;

interface ObjectEntry {
  id: string;
  name: string;
  massKg: number;
  qualifier: string;
  sourceUrl: string;
  imageKey: string;
  attribution: string;
}

const objects: ObjectEntry[] = JSON.parse(
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
}

const pairs: { objectAId: string; objectBId: string }[] = JSON.parse(
  readFileSync(join(process.cwd(), "src/data/pairs.json"), "utf-8"),
);

const byId = new Map(objects.map((o) => [o.id, o]));

for (const pair of pairs) {
  const a = byId.get(pair.objectAId);
  const b = byId.get(pair.objectBId);
  if (!a || !b) {
    console.error(`Pair references missing object: ${pair.objectAId} ${pair.objectBId}`);
    errors++;
    continue;
  }
  const lighter = Math.min(a.massKg, b.massKg);
  const heavier = Math.max(a.massKg, b.massKg);
  if (heavier / lighter < MIN_RATIO) {
    console.error(`Pair too close: ${pair.objectAId} vs ${pair.objectBId}`);
    errors++;
  }
}

if (errors > 0) {
  console.error(`Validation failed with ${errors} error(s)`);
  process.exit(1);
}

console.log(
  `OK: ${objects.length} objects, ${pairs.length} pairs`,
);
