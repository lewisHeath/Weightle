import type { WeightleObject, WeightlePair } from "./types";

export const MIN_WEIGHT_RATIO = 1.2;

export function getHeavierId(
  a: WeightleObject,
  b: WeightleObject,
): string {
  return a.massKg >= b.massKg ? a.id : b.id;
}

export function isValidPair(a: WeightleObject, b: WeightleObject): boolean {
  if (a.id === b.id) return false;
  const lighter = Math.min(a.massKg, b.massKg);
  const heavier = Math.max(a.massKg, b.massKg);
  return heavier / lighter >= MIN_WEIGHT_RATIO;
}

export function computeKgOff(
  picked: WeightleObject,
  other: WeightleObject,
  heavierId: string,
): number {
  if (picked.id === heavierId) return 0;
  return Math.abs(picked.massKg - other.massKg);
}

export function resolvePair(
  pair: WeightlePair,
  objectsById: Map<string, WeightleObject>,
): { a: WeightleObject; b: WeightleObject } | null {
  const a = objectsById.get(pair.objectAId);
  const b = objectsById.get(pair.objectBId);
  if (!a || !b) return null;
  return { a, b };
}
