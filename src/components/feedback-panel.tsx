"use client";

import { formatMass, formatMassDelta, formatPercentOff } from "@/lib/format-mass";
import { getCorrectMessage, getWrongMessage } from "@/lib/feedback";
import { objectsById } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { RoundGuess } from "@/lib/types";
import { DidYouKnow } from "@/components/did-you-know";

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
        "animate-feedback-in rounded-lg border p-4",
        guess.correct
          ? "border-success/40 bg-success-soft"
          : "border-danger/40 bg-danger-soft",
      )}
    >
      <p
        className={cn(
          "text-lg font-semibold",
          guess.correct ? "text-success" : "text-danger",
        )}
      >
        {guess.correct ? "✅ Correct!" : "❌ Not quite"}
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
      <DidYouKnow object={heavier} />
    </div>
  );
}
