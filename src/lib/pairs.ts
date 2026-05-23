import type { WeightleObject, WeightlePair } from "./types";

/** Heavier object must be at least 8% heavier (guessable but not a coin flip). */
export const MIN_WEIGHT_RATIO = 1.08;
/** Heavier object at most 35% heavier — beyond this comparisons feel trivial. */
export const MAX_WEIGHT_RATIO = 1.35;

export function weightRatio(a: WeightleObject, b: WeightleObject): number {
  const lighter = Math.min(a.massKg, b.massKg);
  const heavier = Math.max(a.massKg, b.massKg);
  return heavier / lighter;
}

export function getHeavierId(
  a: WeightleObject,
  b: WeightleObject,
): string {
  return a.massKg >= b.massKg ? a.id : b.id;
}

export function isValidPair(a: WeightleObject, b: WeightleObject): boolean {
  if (a.id === b.id) return false;
  const ratio = weightRatio(a, b);
  return ratio >= MIN_WEIGHT_RATIO && ratio <= MAX_WEIGHT_RATIO;
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
