"use client";

import { formatMass, formatMassDelta, formatPercentOff } from "@/lib/format-mass";
import { getCorrectMessage, getWrongMessage } from "@/lib/feedback";
import { objectsById } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { RoundGuess } from "@/lib/types";

interface FeedbackPanelProps {
  guess: RoundGuess;
  compact?: boolean;
}

export function FeedbackPanel({ guess, compact }: FeedbackPanelProps) {
  const picked = objectsById.get(guess.pickedId);
  const heavier = objectsById.get(guess.heavierId);
  if (!picked || !heavier) return null;

  const message = guess.correct
    ? getCorrectMessage()
    : getWrongMessage(guess.kgOff);

  return (
    <div
      className={cn(
        "animate-feedback-in rounded-2xl border shadow-sm shadow-black/10",
        compact ? "p-3" : "p-4",
        guess.correct
          ? "border-success/45 bg-success-soft/85"
          : "border-danger/45 bg-danger-soft/85",
      )}
    >
      <p
        className={cn(
          compact ? "text-base font-semibold" : "text-lg font-semibold",
          guess.correct ? "text-success" : "text-danger",
        )}
      >
        {guess.correct ? "✅ Correct!" : "❌ Not quite"}
      </p>
      <p className={cn("mt-1 text-muted-foreground", compact && "text-sm")}>
        {message}
      </p>
      {!guess.correct && (
        <p className={cn("mt-2 text-foreground", compact ? "text-xs" : "text-sm")}>
          <strong className="font-semibold">{heavier.name}</strong> weighs{" "}
          <strong className="font-semibold">{formatMass(heavier.massKg)}</strong>
          {" — "}
          <strong className="font-semibold">{formatMassDelta(guess.kgOff)}</strong>{" "}
          more than {picked.name}
          {!compact && (
            <>
              {" "}
              ({formatPercentOff(picked.massKg, heavier.massKg)} heavier)
            </>
          )}
        </p>
      )}
      {guess.correct && !compact && (
        <p className="mt-2 text-sm text-muted-foreground">
          {heavier.name} at {formatMass(heavier.massKg)} beats the other.
        </p>
      )}
    </div>
  );
}
