import type { CompleteOptions, SoundName } from "./sounds";

const PATTERNS: Record<SoundName, number | number[]> = {
  pick: 10,
  correct: [10, 30, 10],
  wrong: [20, 40, 20],
  continue: 5,
  complete: [10, 20, 10, 20, 30],
  share: 8,
  playAgain: [10, 20, 10],
};

export function vibrateFor(name: SoundName, options: CompleteOptions = {}): void {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;

  const perfect =
    name === "complete" &&
    options.score !== undefined &&
    options.total !== undefined &&
    options.score === options.total;

  if (perfect) {
    navigator.vibrate([10, 30, 10, 30, 10, 40, 50]);
    return;
  }

  navigator.vibrate(PATTERNS[name]);
}
