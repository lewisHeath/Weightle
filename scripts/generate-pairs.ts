import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import {
  isValidPair,
  MAX_WEIGHT_RATIO,
  MIN_WEIGHT_RATIO,
} from "../src/lib/pairs";
import type { WeightleObject } from "../src/lib/types";

const objects: WeightleObject[] = JSON.parse(
  readFileSync(join(process.cwd(), "src/data/objects.json"), "utf-8"),
);

const pairs: { id: string; objectAId: string; objectBId: string }[] = [];

for (let i = 0; i < objects.length; i++) {
  for (let j = i + 1; j < objects.length; j++) {
    const a = objects[i];
    const b = objects[j];
    if (isValidPair(a, b)) {
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
console.log(
  `Generated ${pairs.length} pairs (ratio ${MIN_WEIGHT_RATIO}–${MAX_WEIGHT_RATIO})`,
);
