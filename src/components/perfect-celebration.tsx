"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

const EMOJI = ["⚖️", "🏆", "🎉", "✨", "💪"];

function fireEmojiConfetti(): void {
  const scalar = 1.8;
  const shapes = EMOJI.map((text) =>
    confetti.shapeFromText({ text, scalar }),
  );

  confetti({
    shapes,
    particleCount: 36,
    spread: 72,
    startVelocity: 28,
    ticks: 220,
    origin: { y: 0.55 },
    scalar,
  });

  window.setTimeout(() => {
    confetti({
      shapes,
      particleCount: 24,
      spread: 100,
      startVelocity: 22,
      ticks: 180,
      origin: { x: 0.2, y: 0.6 },
      scalar,
    });
    confetti({
      shapes,
      particleCount: 24,
      spread: 100,
      startVelocity: 22,
      ticks: 180,
      origin: { x: 0.8, y: 0.6 },
      scalar,
    });
  }, 180);
}

export function PerfectCelebration({ active }: { active: boolean }) {
  const fired = useRef(false);

  useEffect(() => {
    if (!active || fired.current) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    fired.current = true;
    fireEmojiConfetti();
  }, [active]);

  return null;
}
