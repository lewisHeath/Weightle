import { pairs } from "./data";
import { hashString, seededShuffle } from "./seeded-random";
import { getUtcDateString } from "./utc-date";

const ROUNDS_PER_GAME = 5;

export function getDailyPairIds(date: string = getUtcDateString()): string[] {
  const seed = hashString(`weightle-daily-${date}`);
  const shuffled = seededShuffle(pairs, seed);
  return shuffled.slice(0, ROUNDS_PER_GAME).map((p) => p.id);
}

export { ROUNDS_PER_GAME };
