"use client";

import { useEffect, useState } from "react";
import { DailyCountdown } from "@/components/countdown";
import { loadStats, hasPlayedDailyToday, loadDailyCompletion } from "@/lib/storage";
import { getUtcDateString } from "@/lib/utc-date";
import Link from "next/link";

export function HomeStats() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<ReturnType<typeof loadStats> | null>(null);
  const [playedToday, setPlayedToday] = useState(false);
  const [todayScore, setTodayScore] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    setStats(loadStats());
    const today = getUtcDateString();
    const completion = loadDailyCompletion(today);
    setPlayedToday(hasPlayedDailyToday());
    setTodayScore(completion?.score ?? null);
  }, []);

  if (!mounted) return <div className="h-16" />;

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <DailyCountdown />
      {stats && stats.dailyStreak > 0 && (
        <p className="text-sm text-muted-foreground">
          🔥 Daily streak:{" "}
          <span className="font-semibold text-foreground">
            {stats.dailyStreak}
          </span>
        </p>
      )}
      {playedToday && todayScore !== null && (
        <p className="text-sm">
          Today&apos;s daily: 📅{" "}
          <span className="font-semibold">{todayScore}/5</span>
          {" · "}
          <Link href="/play/daily" className="underline text-muted-foreground">
            View results
          </Link>
        </p>
      )}
      {stats && (stats.dailyHistory.length > 0 || stats.unlimitedGamesPlayed > 0) && (
        <Link href="/stats" className="text-sm text-muted-foreground underline">
          View all stats
        </Link>
      )}
    </div>
  );
}
