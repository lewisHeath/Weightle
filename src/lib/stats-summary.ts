import type { WeightleStats } from "./types";
import { getUtcDateString } from "./utc-date";

export interface DailyHistoryEntry {
  date: string;
  score: number;
  totalKgOff: number;
}

export interface CalendarDay {
  date: string;
  played: boolean;
  score?: number;
  totalKgOff?: number;
}

export function getLastUtcDates(count: number): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i),
    );
    dates.push(getUtcDateString(d));
  }
  return dates;
}

export function buildCalendarDays(
  history: DailyHistoryEntry[],
  dayCount = 30,
): CalendarDay[] {
  const byDate = new Map(history.map((h) => [h.date, h]));
  return getLastUtcDates(dayCount).map((date) => {
    const entry = byDate.get(date);
    if (!entry) return { date, played: false };
    return {
      date,
      played: true,
      score: entry.score,
      totalKgOff: entry.totalKgOff,
    };
  });
}

export function averageKgOff(history: DailyHistoryEntry[]): number | null {
  if (history.length === 0) return null;
  const sum = history.reduce((acc, h) => acc + h.totalKgOff, 0);
  return sum / history.length;
}

export function countDailyGamesPlayed(history: DailyHistoryEntry[]): number {
  return history.length;
}

export function getScoreTone(score: number): string {
  if (score >= 5) return "bg-success";
  if (score >= 4) return "bg-success/75";
  if (score >= 3) return "bg-daily/80";
  if (score >= 2) return "bg-unlimited/60";
  if (score >= 1) return "bg-danger/70";
  return "bg-danger";
}

export function formatStatDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export type StatsSnapshot = Pick<
  WeightleStats,
  | "dailyStreak"
  | "bestDailyScore"
  | "unlimitedGamesPlayed"
  | "dailyHistory"
>;
