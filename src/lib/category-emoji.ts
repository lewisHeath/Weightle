import type { ObjectCategory } from "./types";

const CATEGORY_EMOJI: Record<ObjectCategory, string> = {
  animal: "🐾",
  food: "🍎",
  vehicle: "🚗",
  household: "🏠",
  sport: "⚽",
  nature: "🌿",
  other: "📦",
};

export function getCategoryEmoji(category: ObjectCategory): string {
  return CATEGORY_EMOJI[category];
}

export function getScoreEmoji(score: number, total: number): string {
  if (score === total) return "🏆";
  if (score >= total - 1) return "🔥";
  if (score >= total / 2) return "💪";
  return "⚖️";
}
