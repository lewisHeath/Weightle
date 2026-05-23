"use client";

import Link from "next/link";
import { ObjectImage } from "@/components/object-image";
import { Button } from "@/components/ui/button";
import { objectsById, getImageUrl } from "@/lib/data";
import { formatMass, formatMassDelta } from "@/lib/format-mass";
import { getScoreEmoji } from "@/lib/category-emoji";
import { pairs } from "@/lib/data";
import { resolvePair } from "@/lib/pairs";
import type { GameMode, RoundGuess } from "@/lib/types";

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
  const score = guesses.filter((g) => g.correct).length;
  const totalKgOff = guesses.reduce((sum, g) => sum + g.kgOff, 0);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          {getScoreEmoji(score, 5)} Results
        </h1>
        <p className="mt-2 text-5xl font-bold tabular-nums">
          {score}
          <span className="text-2xl text-muted-foreground">/5</span>
        </p>
        {totalKgOff > 0 && (
          <p className="mt-2 text-muted-foreground">
            📏 Total weight off: {formatMassDelta(totalKgOff)}
          </p>
        )}
      </div>

      <ul className="space-y-3">
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
              className="flex items-center gap-3 rounded-lg border bg-card p-3"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
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

      <div className="flex flex-col gap-2">
        {onShare && (
          <Button variant="outline" onClick={onShare}>
            {shareCopied ? "✅ Copied!" : "📋 Share results"}
          </Button>
        )}
        {mode === "daily" ? (
          <Button asChild variant="secondary">
            <Link href="/play/unlimited">♾️ Play Unlimited</Link>
          </Button>
        ) : onPlayAgain ? (
          <Button variant="secondary" onClick={onPlayAgain}>
            Play again 🔁
          </Button>
        ) : (
          <Button asChild variant="secondary">
            <Link href="/play/unlimited">Play again</Link>
          </Button>
        )}
        <Button asChild variant="ghost">
          <Link href="/">🏠 Back home</Link>
        </Button>
      </div>
    </div>
  );
}
