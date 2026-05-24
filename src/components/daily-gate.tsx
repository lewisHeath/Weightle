"use client";

import { useEffect, useState } from "react";
import { GameBoard } from "@/components/game-board";
import { ResultsSummary } from "@/components/results-summary";
import { loadDailyCompletion } from "@/lib/storage";
import { getUtcDateString } from "@/lib/utc-date";
import { getDailyPairIds } from "@/lib/daily";
import type { DailyCompletion } from "@/lib/types";

export function DailyGate() {
  const [mounted, setMounted] = useState(false);
  const [completion, setCompletion] = useState<DailyCompletion | null>(null);

  useEffect(() => {
    setMounted(true);
    setCompletion(loadDailyCompletion(getUtcDateString()));
  }, []);

  if (!mounted) {
    return <p className="text-center text-muted-foreground">Loading…</p>;
  }

  if (completion) {
    return (
      <>
        <p className="hidden text-center text-sm text-muted-foreground sm:block">
          You&apos;ve already played today. Come back after midnight UTC ⏰
        </p>
        <ResultsSummary
          mode="daily"
          pairIds={getDailyPairIds(completion.date)}
          guesses={completion.guesses}
        />
      </>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="hidden text-center sm:block">
        <h1 className="text-2xl font-bold">📅 Daily Weightle</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {getUtcDateString()} · Same puzzle for everyone
        </p>
      </div>
      <GameBoard mode="daily" />
    </div>
  );
}
