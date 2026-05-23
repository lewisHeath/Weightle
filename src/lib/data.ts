import objectsJson from "@/data/objects.json";
import pairsJson from "@/data/pairs.json";
import type { WeightleObject, WeightlePair } from "./types";

export const objects: WeightleObject[] = objectsJson as WeightleObject[];
export const pairs: WeightlePair[] = pairsJson as WeightlePair[];

export const objectsById = new Map(objects.map((o) => [o.id, o]));

export function getImageUrl(object: WeightleObject): string {
  const base =
    process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? "https://cdn.weightle.app";
  if (object.imageKey.startsWith("http")) {
    return object.imageKey;
  }
  return `${base}/objects/${object.imageKey}`;
}
