"use client";

import { formatMass, formatMassDelta, formatPercentOff } from "@/lib/format-mass";
import { getCorrectMessage, getWrongMessage } from "@/lib/feedback";
import { objectsById } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { RoundGuess } from "@/lib/types";

interface FeedbackPanelProps {
  guess: RoundGuess;
}

export function FeedbackPanel({ guess }: FeedbackPanelProps) {
  const picked = objectsById.get(guess.pickedId);
  const heavier = objectsById.get(guess.heavierId);
  if (!picked || !heavier) return null;

  const message = guess.correct
    ? getCorrectMessage()
    : getWrongMessage(guess.kgOff);

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        guess.correct
          ? "border-emerald-600/40 bg-emerald-600/10"
          : "border-red-600/40 bg-red-600/10",
      )}
    >
      <p
        className={cn(
          "text-lg font-semibold",
          guess.correct ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300",
        )}
      >
        {guess.correct ? "Correct!" : "Not quite"}
      </p>
      <p className="mt-1 text-muted-foreground">{message}</p>
      {!guess.correct && (
        <p className="mt-2 text-sm text-foreground">
          <strong className="font-semibold">{heavier.name}</strong> weighs{" "}
          <strong className="font-semibold">{formatMass(heavier.massKg)}</strong>
          {" — "}about{" "}
          <strong className="font-semibold">{formatMassDelta(guess.kgOff)}</strong>{" "}
          more than {picked.name} (
          {formatPercentOff(picked.massKg, heavier.massKg)} heavier)
        </p>
      )}
      {guess.correct && (
        <p className="mt-2 text-sm text-muted-foreground">
          {heavier.name} at {formatMass(heavier.massKg)} beats the other.
        </p>
      )}
    </div>
  );
}
