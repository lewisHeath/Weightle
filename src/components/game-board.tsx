"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ObjectCard } from "@/components/object-card";
import { FeedbackPanel } from "@/components/feedback-panel";
import { ResultsSummary } from "@/components/results-summary";
import { Button } from "@/components/ui/button";
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

function RoundProgress({
  currentRound,
  guesses,
}: {
  currentRound: number;
  guesses: RoundGuess[];
}) {
  return (
    <div
      className="grid grid-cols-5 gap-2"
      aria-label={`Round ${currentRound} of ${ROUNDS_PER_GAME}`}
    >
      {Array.from({ length: ROUNDS_PER_GAME }, (_, index) => {
        const round = index + 1;
        const guess = guesses[index];
        const current = round === currentRound;

        return (
          <span
            key={round}
            className={cn(
              "h-2.5 rounded-full border border-border/70 bg-muted transition-all",
              guess?.correct && "border-success/50 bg-success",
              guess && !guess.correct && "border-danger/50 bg-danger",
              !guess && current && "border-daily/70 bg-daily/25",
            )}
          />
        );
      })}
    </div>
  );
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
    const label = mode === "daily" ? getUtcDateString() : "Unlimited";
    const grid = guesses.map((g) => (g.correct ? "🟩" : "🟥")).join("");
    const lines = [
      `Weightle ${label}: ${score}/${ROUNDS_PER_GAME} ${grid}`,
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
  const continueLabel =
    roundIndex + 1 >= ROUNDS_PER_GAME ? "🏆 See results" : "Continue ➡️";

  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center sm:justify-start">
      <div className="mx-auto -mt-8 flex w-full max-w-2xl flex-col gap-3 sm:mt-0 sm:gap-5">
        <div className="shrink-0 space-y-2 rounded-2xl border border-border/70 bg-card/65 p-3 shadow-sm shadow-black/10 sm:p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground sm:text-sm">
            <span>
              Round{" "}
              <span className="font-semibold text-foreground">
                {roundIndex + 1}
              </span>{" "}
              of {ROUNDS_PER_GAME}
            </span>
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                mode === "daily"
                  ? "border-daily/40 bg-daily-soft text-daily"
                  : "border-unlimited/40 bg-unlimited-soft text-unlimited",
              )}
            >
              {mode === "daily" ? "📅 Daily" : "♾️ Unlimited"}
            </span>
          </div>
          <RoundProgress
            currentRound={roundIndex + 1}
            guesses={guesses}
          />
        </div>

        <p className="shrink-0 text-center text-base font-bold sm:text-lg">
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
          <kbd className="rounded-md border border-border/80 bg-muted px-1.5 py-0.5 font-mono text-[10px] shadow-sm shadow-black/10">
            1
          </kbd>{" "}
          /{" "}
          <kbd className="rounded-md border border-border/80 bg-muted px-1.5 py-0.5 font-mono text-[10px] shadow-sm shadow-black/10">
            2
          </kbd>{" "}
          or{" "}
          <kbd className="rounded-md border border-border/80 bg-muted px-1.5 py-0.5 font-mono text-[10px] shadow-sm shadow-black/10">
            ←
          </kbd>{" "}
          <kbd className="rounded-md border border-border/80 bg-muted px-1.5 py-0.5 font-mono text-[10px] shadow-sm shadow-black/10">
            →
          </kbd>{" "}
          to pick
          {revealed && (
            <>
              {" · "}
              <kbd className="rounded-md border border-border/80 bg-muted px-1.5 py-0.5 font-mono text-[10px] shadow-sm shadow-black/10">
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
                "fixed left-1/2 top-[calc(50dvh+3.5rem)] w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border/70 bg-background/95 p-3 shadow-2xl shadow-black/40 backdrop-blur-sm",
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
