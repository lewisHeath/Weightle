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
import { cn } from "@/lib/utils";
import {
  saveDailyCompletion,
  incrementUnlimitedPlayed,
} from "@/lib/storage";
import { getUtcDateString } from "@/lib/utc-date";
import type { GameMode, RoundGuess } from "@/lib/types";
import { useSound } from "@/components/sound-provider";
import { unlockAudio } from "@/lib/sounds";
import { useGameKeyboard } from "@/hooks/use-game-keyboard";

interface GameBoardProps {
  mode: GameMode;
}

export function GameBoard({ mode }: GameBoardProps) {
  const router = useRouter();
  const { play } = useSound();
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
      unlockAudio();
      play("pick");
      play(guess.correct ? "correct" : "wrong");
      setGuesses((g) => [...g, guess]);
      setRevealed(true);
    },
    [revealed, currentPairId, roundIndex, play],
  );

  const handleContinue = useCallback(() => {
    if (roundIndex + 1 >= ROUNDS_PER_GAME) {
      const score = guesses.filter((g) => g.correct).length;
      play("complete", { score, total: ROUNDS_PER_GAME });
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
    play("continue");
    setRoundIndex((r) => r + 1);
    setRevealed(false);
  }, [roundIndex, mode, guesses, play]);

  const handleShare = useCallback(() => {
    const score = guesses.filter((g) => g.correct).length;
    const lines = [
      `Weightle ${mode === "daily" ? getUtcDateString() : "Unlimited"} ${score}/5`,
      ...guesses.map((g) => (g.correct ? "🟩" : "🟥")),
      "https://weightle.app",
    ];
    void navigator.clipboard.writeText(lines.join("\n")).then(() => {
      play("share");
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  }, [guesses, mode, play]);

  const handlePlayAgain = useCallback(() => {
    play("playAgain");
    setSessionSeed(crypto.randomUUID());
    setRoundIndex(0);
    setGuesses([]);
    setRevealed(false);
    setFinished(false);
    setShareCopied(false);
  }, [play]);

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

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
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

      <p className="text-center text-lg font-medium">
        ⚖️ Which is heavier?
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

      <p className="text-center text-xs text-muted-foreground">
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
          <FeedbackPanel guess={lastGuess} />
          <Button size="lg" className="w-full" onClick={handleContinue}>
            {roundIndex + 1 >= ROUNDS_PER_GAME ? "🏆 See results" : "Continue ➡️"}
          </Button>
        </>
      )}
    </div>
  );
}
