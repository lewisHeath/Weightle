"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GameBoard } from "@/components/game-board";
import { ResultsSummary } from "@/components/results-summary";
import { Button } from "@/components/ui/button";
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
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">📅 Daily Weightle</h1>
          <p className="mt-2 text-muted-foreground">
            You&apos;ve already played today. Come back after midnight UTC ⏰
          </p>
        </div>
        <ResultsSummary
          mode="daily"
          pairIds={getDailyPairIds(completion.date)}
          guesses={completion.guesses}
        />
        <div className="flex justify-center">
          <Button asChild variant="secondary">
            <Link href="/play/unlimited">♾️ Play Unlimited</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">📅 Daily Weightle</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {getUtcDateString()} · Same puzzle for everyone
        </p>
      </div>
      <GameBoard mode="daily" />
    </div>
  );
}
