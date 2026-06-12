import { objects } from "@/lib/data";
import type { ObjectCategory } from "@/lib/types";

export const CATEGORY_ORDER: ObjectCategory[] = [
  "animal",
  "food",
  "vehicle",
  "household",
  "sport",
  "nature",
  "other",
];

export const CATEGORY_LABELS: Record<ObjectCategory, string> = {
  animal: "Animals",
  food: "Food & drink",
  vehicle: "Vehicles",
  household: "Household",
  sport: "Sport & recreation",
  nature: "Nature & geology",
  other: "Everything else",
};

export const CATEGORY_DESCRIPTIONS: Record<ObjectCategory, string> = {
  animal:
    "From insects to whales — compare the mass of living creatures using sourced biological estimates.",
  food:
    "Everyday ingredients, meals, and packaged foods with weights tied to typical serving sizes.",
  vehicle:
    "Cars, aircraft, ships, and other machines where manufacturer or reference data defines mass.",
  household:
    "Tools, furniture, appliances, and objects you might find around the home or office.",
  sport:
    "Balls, rackets, gym equipment, and gear used in sport and recreation.",
  nature:
    "Rocks, plants, weather phenomena, and natural formations with published mass figures.",
  other:
    "Landmarks, monuments, musical instruments, and objects that do not fit a single theme.",
};

export function getObjectsByCategory(): Record<ObjectCategory, typeof objects> {
  const grouped = Object.fromEntries(
    CATEGORY_ORDER.map((c) => [c, [] as typeof objects]),
  ) as Record<ObjectCategory, typeof objects>;

  for (const obj of objects) {
    grouped[obj.category].push(obj);
  }

  for (const category of CATEGORY_ORDER) {
    grouped[category].sort((a, b) => a.name.localeCompare(b.name));
  }

  return grouped;
}

export function getCategoryCounts(): Record<ObjectCategory, number> {
  const counts = Object.fromEntries(
    CATEGORY_ORDER.map((c) => [c, 0]),
  ) as Record<ObjectCategory, number>;

  for (const obj of objects) {
    counts[obj.category]++;
  }

  return counts;
}

export function isObjectCategory(value: string): value is ObjectCategory {
  return CATEGORY_ORDER.includes(value as ObjectCategory);
}
