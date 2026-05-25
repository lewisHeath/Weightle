"use client";

import Link from "next/link";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ObjectImage } from "@/components/object-image";
import { Button } from "@/components/ui/button";
import { objectsById, getImageUrl } from "@/lib/data";
import { formatMass, formatMassDelta } from "@/lib/format-mass";
import { getScoreEmoji } from "@/lib/category-emoji";
import { pairs } from "@/lib/data";
import { resolvePair } from "@/lib/pairs";
import { cn } from "@/lib/utils";
import type { GameMode, RoundGuess } from "@/lib/types";
import { PerfectCelebration } from "@/components/perfect-celebration";
import { useResultsKeyboard } from "@/hooks/use-results-keyboard";

interface ResultsSummaryProps {
  mode: GameMode;
  pairIds: string[];
  guesses: RoundGuess[];
  onShare?: () => void;
  shareCopied?: boolean;
  onPlayAgain?: () => void;
}

export function ResultsSummary({
  mode,
  pairIds,
  guesses,
  onShare,
  shareCopied,
  onPlayAgain,
}: ResultsSummaryProps) {
  const router = useRouter();
  const score = guesses.filter((g) => g.correct).length;
  const totalKgOff = guesses.reduce((sum, g) => sum + g.kgOff, 0);
  const perfect = score === 5;

  const handlePlayAgain = useCallback(() => {
    if (onPlayAgain) {
      onPlayAgain();
      return;
    }
    router.push("/play/unlimited");
  }, [onPlayAgain, router]);

  useResultsKeyboard({ onPrimary: handlePlayAgain });

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] w-full max-w-lg flex-col justify-between gap-4 py-6 sm:min-h-0 sm:justify-start sm:gap-6 sm:py-0">
      <PerfectCelebration active={perfect} />
      <div className="rounded-2xl border border-border/70 bg-card/75 p-5 text-center shadow-sm shadow-black/10">
        <h1 className="text-xl font-bold sm:text-3xl">
          {perfect ? "🏆 Perfect!" : `${getScoreEmoji(score, 5)} Results`}
        </h1>
        <p
          className={cn(
            "mt-1 text-4xl font-bold tabular-nums sm:mt-2 sm:text-5xl",
            perfect && "text-success",
          )}
        >
          {score}
          <span className="text-lg text-muted-foreground sm:text-2xl">/5</span>
        </p>
        {totalKgOff > 0 && (
          <p className="mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-base">
            📏 {formatMassDelta(totalKgOff)} off
          </p>
        )}
      </div>

      {/* Mobile: compact one-line rounds */}
      <ul className="space-y-2 sm:hidden">
        {guesses.map((guess, i) => {
          const pair = pairs.find((p) => p.id === pairIds[i]);
          if (!pair) return null;
          const resolved = resolvePair(pair, objectsById);
          if (!resolved) return null;
          const picked = objectsById.get(guess.pickedId);
          const heavier = objectsById.get(guess.heavierId);
          if (!picked || !heavier) return null;

          return (
            <li
              key={i}
              className={cn(
                "flex items-center gap-2 rounded-2xl border bg-card/80 px-2.5 py-2 text-xs shadow-sm shadow-black/10",
                guess.correct
                  ? "border-success/30 bg-success-soft/50"
                  : "border-danger/30 bg-danger-soft/50",
              )}
            >
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-muted">
                <ObjectImage
                  src={getImageUrl(picked)}
                  alt={picked.name}
                  sizes="36px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "font-medium",
                    guess.correct ? "text-success" : "text-danger",
                  )}
                >
                  {guess.correct ? "✅" : "❌"} Round {i + 1}: picked{" "}
                  <span className="text-foreground">{picked.name}</span>
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  Heavier: {heavier.name} ({formatMass(heavier.massKg)})
                  {!guess.correct && ` · Off by ${formatMassDelta(guess.kgOff)}`}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Desktop: full round cards */}
      <ul className="hidden space-y-3 sm:block">
        {guesses.map((guess, i) => {
          const pair = pairs.find((p) => p.id === pairIds[i]);
          if (!pair) return null;
          const resolved = resolvePair(pair, objectsById);
          if (!resolved) return null;
          const picked = objectsById.get(guess.pickedId);
          const heavier = objectsById.get(guess.heavierId);
          if (!picked || !heavier) return null;

          return (
            <li
              key={i}
              className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/80 p-3 shadow-sm shadow-black/10"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                <ObjectImage
                  src={getImageUrl(picked)}
                  alt={picked.name}
                  sizes="48px"
                />
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <span
                  className={
                    guess.correct
                      ? "font-medium text-success"
                      : "font-medium text-danger"
                  }
                >
                  {guess.correct ? "✅" : "❌"} Round {i + 1}
                </span>
                <p className="truncate text-muted-foreground">
                  Picked {picked.name} · Heavier: {heavier.name} (
                  {formatMass(heavier.massKg)})
                </p>
                {!guess.correct && (
                  <p className="text-xs text-muted-foreground">
                    Off by {formatMassDelta(guess.kgOff)}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-1.5 sm:gap-2">
        <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-col sm:gap-2">
          {onShare && (
            <Button
              variant="outline"
              size="sm"
              className="sm:h-10 sm:px-4 sm:text-sm"
              onClick={onShare}
            >
              {shareCopied ? "✅ Copied!" : "📋 Share"}
            </Button>
          )}
          {mode === "daily" ? (
            <Button
              asChild
              variant="secondary"
              size="sm"
              className={cn("sm:h-10 sm:px-4 sm:text-sm", !onShare && "col-span-2")}
            >
              <Link href="/play/unlimited">♾️ Play Unlimited</Link>
            </Button>
          ) : onPlayAgain ? (
            <Button
              variant="secondary"
              size="sm"
              className={cn("sm:h-10 sm:px-4 sm:text-sm", !onShare && "col-span-2")}
              onClick={handlePlayAgain}
            >
              Play again 🔁
            </Button>
          ) : (
            <Button
              asChild
              variant="secondary"
              size="sm"
              className={cn("sm:h-10 sm:px-4 sm:text-sm", !onShare && "col-span-2")}
            >
              <Link href="/play/unlimited">Play again</Link>
            </Button>
          )}
        </div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="hidden sm:inline-flex sm:h-10 sm:px-4 sm:text-sm"
        >
          <Link href="/">🏠 Back home</Link>
        </Button>
        <p className="hidden text-center text-xs text-muted-foreground sm:block">
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            Enter
          </kbd>{" "}
          to play again
        </p>
      </div>
    </div>
  );
}
