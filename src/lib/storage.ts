import type { DailyCompletion, WeightleStats } from "./types";
import { getUtcDateString } from "./utc-date";

const STATS_KEY = "weightle-stats-v1";
const DAILY_KEY = "weightle-daily-v1";

const defaultStats = (): WeightleStats => ({
  dailyStreak: 0,
  lastDailyDate: null,
  dailyHistory: [],
  unlimitedGamesPlayed: 0,
  bestDailyScore: 0,
});

export function loadStats(): WeightleStats {
  if (typeof window === "undefined") return defaultStats();
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats();
    return { ...defaultStats(), ...JSON.parse(raw) };
  } catch {
    return defaultStats();
  }
}

export function saveStats(stats: WeightleStats): void {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function loadDailyCompletion(date: string): DailyCompletion | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    if (!raw) return null;
    const map: Record<string, DailyCompletion> = JSON.parse(raw);
    return map[date] ?? null;
  } catch {
    return null;
  }
}

export function saveDailyCompletion(completion: DailyCompletion): void {
  const raw = localStorage.getItem(DAILY_KEY);
  const map: Record<string, DailyCompletion> = raw ? JSON.parse(raw) : {};
  map[completion.date] = completion;
  localStorage.setItem(DAILY_KEY, JSON.stringify(map));

  const stats = loadStats();
  const playedDate = completion.date;

  if (stats.lastDailyDate) {
    const last = new Date(`${stats.lastDailyDate}T00:00:00Z`);
    const current = new Date(`${playedDate}T00:00:00Z`);
    const diffDays = Math.round(
      (current.getTime() - last.getTime()) / 86400000,
    );
    if (diffDays === 1) {
      stats.dailyStreak += 1;
    } else if (diffDays > 1) {
      stats.dailyStreak = 1;
    }
  } else {
    stats.dailyStreak = 1;
  }

  stats.lastDailyDate = playedDate;
  stats.bestDailyScore = Math.max(stats.bestDailyScore, completion.score);
  stats.dailyHistory = [
    { date: completion.date, score: completion.score, totalKgOff: completion.totalKgOff },
    ...stats.dailyHistory.filter((h) => h.date !== completion.date),
  ].slice(0, 30);
  saveStats(stats);
}

export function incrementUnlimitedPlayed(): void {
  const stats = loadStats();
  stats.unlimitedGamesPlayed += 1;
  saveStats(stats);
}

export function hasPlayedDailyToday(): boolean {
  return loadDailyCompletion(getUtcDateString()) !== null;
}
