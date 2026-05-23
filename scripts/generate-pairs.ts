import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const MIN_RATIO = 1.2;

interface ObjectEntry {
  id: string;
  massKg: number;
}

const objects: ObjectEntry[] = JSON.parse(
  readFileSync(join(process.cwd(), "src/data/objects.json"), "utf-8"),
);

const pairs: { id: string; objectAId: string; objectBId: string }[] = [];

for (let i = 0; i < objects.length; i++) {
  for (let j = i + 1; j < objects.length; j++) {
    const a = objects[i];
    const b = objects[j];
    const lighter = Math.min(a.massKg, b.massKg);
    const heavier = Math.max(a.massKg, b.massKg);
    if (heavier / lighter >= MIN_RATIO) {
      pairs.push({
        id: `${a.id}__${b.id}`,
        objectAId: a.id,
        objectBId: b.id,
      });
    }
  }
}

writeFileSync(
  join(process.cwd(), "src/data/pairs.json"),
  JSON.stringify(pairs, null, 2) + "\n",
);
console.log(`Generated ${pairs.length} pairs`);
