"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMassDelta } from "@/lib/format-mass";
import { loadStats } from "@/lib/storage";
import {
  averageKgOff,
  buildCalendarDays,
  countDailyGamesPlayed,
  formatStatDate,
  getScoreTone,
  type CalendarDay,
} from "@/lib/stats-summary";
import { cn } from "@/lib/utils";

function DayCell({
  day,
  selected,
  onSelect,
}: {
  day: CalendarDay;
  selected: boolean;
  onSelect: (day: CalendarDay) => void;
}) {
  const label = day.played
    ? `${formatStatDate(day.date)}: ${day.score}/5, ${formatMassDelta(day.totalKgOff ?? 0)} off`
    : `${formatStatDate(day.date)}: not played`;

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={selected}
      onClick={() => onSelect(day)}
      onMouseEnter={() => onSelect(day)}
      className={cn(
        "aspect-square w-full min-w-0 rounded-md border transition-transform active:scale-95",
        day.played ? getScoreTone(day.score ?? 0) : "border-border bg-muted",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        !day.played && "border-dashed",
      )}
    />
  );
}

export function StatsDashboard() {
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState<CalendarDay | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = useMemo(() => (mounted ? loadStats() : null), [mounted]);
  const calendar = useMemo(
    () => buildCalendarDays(stats?.dailyHistory ?? []),
    [stats],
  );
  const avgOff = useMemo(
    () => averageKgOff(stats?.dailyHistory ?? []),
    [stats],
  );
  const dailyPlayed = useMemo(
    () => countDailyGamesPlayed(stats?.dailyHistory ?? []),
    [stats],
  );

  if (!mounted) {
    return <div className="h-64 animate-pulse rounded-lg bg-muted" />;
  }

  if (!stats || (dailyPlayed === 0 && stats.unlimitedGamesPlayed === 0)) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div>
          <h1 className="text-3xl font-bold">📊 Stats</h1>
          <p className="mt-2 text-muted-foreground">
            Play your first daily to start tracking streaks and scores.
          </p>
        </div>
        <Button asChild size="lg" className="bg-daily text-white hover:bg-daily/90">
          <Link href="/play/daily">📅 Play Daily Weightle</Link>
        </Button>
      </div>
    );
  }

  const defaultDay =
    [...calendar].reverse().find((d) => d.played) ?? calendar.at(-1)!;
  const focus = selected ?? defaultDay;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">📊 Stats</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Daily puzzle history · UTC dates
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              🔥 Streak
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold tabular-nums">
            {stats.dailyStreak}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              🏆 Best
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold tabular-nums">
            {stats.bestDailyScore}/5
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              📅 Dailies
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold tabular-nums">
            {dailyPlayed}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              ♾️ Unlimited
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold tabular-nums">
            {stats.unlimitedGamesPlayed}
          </CardContent>
        </Card>
      </div>

      {avgOff !== null && (
        <p className="text-center text-sm text-muted-foreground">
          📏 Average weight off (daily):{" "}
          <span className="font-semibold text-foreground">
            {formatMassDelta(avgOff)}
          </span>
        </p>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Last 30 days</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
            {calendar.map((day) => (
              <DayCell
                key={day.date}
                day={day}
                selected={focus.date === day.date}
                onSelect={setSelected}
              />
            ))}
          </div>

          <div
            className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-center text-sm"
            aria-live="polite"
          >
            <span className="font-medium">{formatStatDate(focus.date)}</span>
            {focus.played ? (
              <>
                {" · "}
                <span className="font-semibold">{focus.score}/5</span>
                {" · "}
                <span>{formatMassDelta(focus.totalKgOff ?? 0)} off</span>
              </>
            ) : (
              <span className="text-muted-foreground"> · Not played</span>
            )}
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Tap a day on mobile · hover on desktop
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button asChild variant="secondary">
          <Link href="/play/daily">📅 Play today&apos;s daily</Link>
        </Button>
      </div>
    </div>
  );
}
