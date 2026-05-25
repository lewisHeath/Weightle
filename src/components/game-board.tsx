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
import { cn, randomSessionId } from "@/lib/utils";
import {
  saveDailyCompletion,
  incrementUnlimitedPlayed,
} from "@/lib/storage";
import { getUtcDateString } from "@/lib/utc-date";
import type { GameMode, RoundGuess } from "@/lib/types";
import { useGameFeedback } from "@/hooks/use-game-feedback";
import { useGameKeyboard } from "@/hooks/use-game-keyboard";

interface GameBoardProps {
  mode: GameMode;
}

export function GameBoard({ mode }: GameBoardProps) {
  const router = useRouter();
  const { feedback } = useGameFeedback();
  const [sessionSeed, setSessionSeed] = useState(() => randomSessionId());
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
      feedback("pick");
      feedback(guess.correct ? "correct" : "wrong");
      setGuesses((g) => [...g, guess]);
      setRevealed(true);
    },
    [revealed, currentPairId, roundIndex, feedback],
  );

  const handleContinue = useCallback(() => {
    if (roundIndex + 1 >= ROUNDS_PER_GAME) {
      const score = guesses.filter((g) => g.correct).length;
      feedback("complete", { score, total: ROUNDS_PER_GAME });
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
    feedback("continue");
    setRoundIndex((r) => r + 1);
    setRevealed(false);
  }, [roundIndex, mode, guesses, feedback]);

  const handleShare = useCallback(() => {
    const score = guesses.filter((g) => g.correct).length;
    const lines = [
      `Weightle ${mode === "daily" ? getUtcDateString() : "Unlimited"} ${score}/5`,
      ...guesses.map((g) => (g.correct ? "🟩" : "🟥")),
      "https://weightle.app",
    ];
    void navigator.clipboard.writeText(lines.join("\n")).then(() => {
      feedback("share");
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  }, [guesses, mode, feedback]);

  const handlePlayAgain = useCallback(() => {
    feedback("playAgain");
    setSessionSeed(randomSessionId());
    setRoundIndex(0);
    setGuesses([]);
    setRevealed(false);
    setFinished(false);
    setShareCopied(false);
  }, [feedback]);

  useGameKeyboard({
    enabled: !finished && !!resolved,
    revealed,
    onPickLeft: () => {
      if (resolved) handlePick(resolved.a.id);
    },
    onPickRight: () => {
      if (resolved) handlePick(resolved.b.id);
    },
    onContinue: handleContinue,
  });

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
  const continueLabel =
    roundIndex + 1 >= ROUNDS_PER_GAME ? "🏆 See results" : "Continue ➡️";

  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center sm:justify-start">
      <div className="mx-auto -mt-8 flex w-full max-w-2xl flex-col gap-3 sm:mt-0 sm:gap-6">
        <div className="shrink-0 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground sm:text-sm">
            <span>
              Round {roundIndex + 1} of {ROUNDS_PER_GAME}
            </span>
            <span
              className={cn(
                "rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground",
              )}
            >
              {mode === "daily" ? "📅 Daily" : "♾️ Unlimited"}
            </span>
          </div>
          <Progress value={progress} />
        </div>

        <p className="shrink-0 text-center text-base font-medium sm:text-lg">
          ⚖️ Which is heavier?
        </p>

        <div className="flex min-h-0 shrink-0 flex-col gap-2 sm:flex-row sm:gap-4">
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

        <p className="hidden shrink-0 text-center text-xs text-muted-foreground sm:block">
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            1
          </kbd>{" "}
          /{" "}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            2
          </kbd>{" "}
          or{" "}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            ←
          </kbd>{" "}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            →
          </kbd>{" "}
          to pick
          {revealed && (
            <>
              {" · "}
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                Enter
              </kbd>{" "}
              to continue
            </>
          )}
        </p>

        {revealed && lastGuess && (
          <>
            <div className="fixed inset-x-0 bottom-0 top-16 z-10 bg-background/65 backdrop-blur-[2px] dark:bg-black/70 sm:hidden" />
            <div
              className={cn(
                "z-20 space-y-2 sm:space-y-3",
                "fixed left-1/2 top-[calc(50dvh+3.5rem)] w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-background/95 p-3 shadow-2xl backdrop-blur-sm",
                "sm:static sm:inset-auto sm:w-full sm:translate-x-0 sm:translate-y-0 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none",
              )}
            >
              <FeedbackPanel guess={lastGuess} compact />
              <Button size="lg" className="w-full" onClick={handleContinue}>
                {continueLabel}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
