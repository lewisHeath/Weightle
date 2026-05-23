"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ObjectCard } from "@/components/object-card";
import { FeedbackPanel } from "@/components/feedback-panel";
import { ResultsSummary } from "@/components/results-summary";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { pairs, objectsById } from "@/lib/data";
import {
  buildGuess,
  getPairIdsForMode,
  ROUNDS_PER_GAME,
} from "@/lib/game";
import { resolvePair, getHeavierId } from "@/lib/pairs";
import {
  saveDailyCompletion,
  incrementUnlimitedPlayed,
} from "@/lib/storage";
import { getUtcDateString } from "@/lib/utc-date";
import type { GameMode, RoundGuess } from "@/lib/types";

interface GameBoardProps {
  mode: GameMode;
}

export function GameBoard({ mode }: GameBoardProps) {
  const router = useRouter();
  const [sessionSeed, setSessionSeed] = useState(() => crypto.randomUUID());
  const pairIds = useMemo(
    () => getPairIdsForMode(mode, sessionSeed),
    [mode, sessionSeed],
  );

  const [roundIndex, setRoundIndex] = useState(0);
  const [guesses, setGuesses] = useState<RoundGuess[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const currentPairId = pairIds[roundIndex];
  const currentPair = pairs.find((p) => p.id === currentPairId);
  const resolved = currentPair
    ? resolvePair(currentPair, objectsById)
    : null;

  const lastGuess = guesses[guesses.length - 1];

  const handlePick = useCallback(
    (pickedId: string) => {
      if (revealed || !currentPairId) return;
      const guess = buildGuess(currentPairId, pickedId, roundIndex);
      if (!guess) return;
      setGuesses((g) => [...g, guess]);
      setRevealed(true);
    },
    [revealed, currentPairId, roundIndex],
  );

  const handleContinue = useCallback(() => {
    if (roundIndex + 1 >= ROUNDS_PER_GAME) {
      setGuesses((finalGuesses) => {
        const score = finalGuesses.filter((g) => g.correct).length;
        const totalKgOff = finalGuesses.reduce((s, g) => s + g.kgOff, 0);
        if (mode === "daily") {
          saveDailyCompletion({
            date: getUtcDateString(),
            score,
            totalKgOff,
            guesses: finalGuesses,
            playedAt: new Date().toISOString(),
          });
        } else {
          incrementUnlimitedPlayed();
        }
        return finalGuesses;
      });
      setFinished(true);
      return;
    }
    setRoundIndex((r) => r + 1);
    setRevealed(false);
  }, [roundIndex, mode]);

  const handleShare = useCallback(() => {
    const score = guesses.filter((g) => g.correct).length;
    const lines = [
      `Weightle ${mode === "daily" ? getUtcDateString() : "Unlimited"} ${score}/5`,
      ...guesses.map((g) => (g.correct ? "🟩" : "🟥")),
      "https://weightle.app",
    ];
    void navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  }, [guesses, mode]);

  const handlePlayAgain = useCallback(() => {
    setSessionSeed(crypto.randomUUID());
    setRoundIndex(0);
    setGuesses([]);
    setRevealed(false);
    setFinished(false);
    setShareCopied(false);
  }, []);

  if (finished) {
    return (
      <ResultsSummary
        mode={mode}
        pairIds={pairIds}
        guesses={guesses}
        onShare={handleShare}
        shareCopied={shareCopied}
        onPlayAgain={mode === "unlimited" ? handlePlayAgain : undefined}
      />
    );
  }

  if (!resolved) {
    return (
      <p className="text-center text-muted-foreground">
        Could not load this round.{" "}
        <button
          type="button"
          className="underline"
          onClick={() => router.push("/")}
        >
          Go home
        </button>
      </p>
    );
  }

  const { a, b } = resolved;
  const heavierId = getHeavierId(a, b);
  const progress = ((roundIndex + (revealed ? 1 : 0)) / ROUNDS_PER_GAME) * 100;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Round {roundIndex + 1} of {ROUNDS_PER_GAME}
          </span>
          <span className="capitalize">{mode}</span>
        </div>
        <Progress value={progress} />
      </div>

      <p className="text-center text-lg font-medium">
        Which is heavier?
      </p>

      <div className="flex gap-3 sm:gap-4">
        <ObjectCard
          object={a}
          onPick={() => handlePick(a.id)}
          disabled={revealed}
          reveal={revealed}
          isHeavier={a.id === heavierId}
          isPicked={lastGuess?.pickedId === a.id}
          isWrongPick={
            revealed && lastGuess?.pickedId === a.id && !lastGuess.correct
          }
        />
        <ObjectCard
          object={b}
          onPick={() => handlePick(b.id)}
          disabled={revealed}
          reveal={revealed}
          isHeavier={b.id === heavierId}
          isPicked={lastGuess?.pickedId === b.id}
          isWrongPick={
            revealed && lastGuess?.pickedId === b.id && !lastGuess.correct
          }
        />
      </div>

      {revealed && lastGuess && (
        <>
          <FeedbackPanel guess={lastGuess} />
          <Button size="lg" className="w-full" onClick={handleContinue}>
            {roundIndex + 1 >= ROUNDS_PER_GAME ? "See results" : "Continue"}
          </Button>
        </>
      )}
    </div>
  );
}
