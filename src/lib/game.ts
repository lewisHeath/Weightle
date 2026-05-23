import { pairs, objectsById } from "./data";
import { getDailyPairIds, ROUNDS_PER_GAME } from "./daily";
import { computeKgOff, getHeavierId, resolvePair } from "./pairs";
import { hashString, seededShuffle } from "./seeded-random";
import { getUtcDateString } from "./utc-date";
import type { GameMode, RoundGuess } from "./types";

export function getPairIdsForMode(
  mode: GameMode,
  sessionSeed?: string,
): string[] {
  if (mode === "daily") {
    return getDailyPairIds();
  }
  const seed = hashString(sessionSeed ?? `${Date.now()}-${Math.random()}`);
  return seededShuffle(pairs, seed)
    .slice(0, ROUNDS_PER_GAME)
    .map((p) => p.id);
}

export function buildGuess(
  pairId: string,
  pickedId: string,
  roundIndex: number,
): RoundGuess | null {
  const pair = pairs.find((p) => p.id === pairId);
  if (!pair) return null;
  const resolved = resolvePair(pair, objectsById);
  if (!resolved) return null;
  const { a, b } = resolved;
  const heavierId = getHeavierId(a, b);
  const picked = pickedId === a.id ? a : b;
  const other = pickedId === a.id ? b : a;
  const correct = pickedId === heavierId;
  return {
    roundIndex,
    pickedId,
    correct,
    heavierId,
    kgOff: computeKgOff(picked, other, heavierId),
  };
}

export function getDailyDate(): string {
  return getUtcDateString();
}

export { ROUNDS_PER_GAME };
