"use client";

import { useEffect } from "react";

interface UseGameKeyboardOptions {
  enabled: boolean;
  revealed: boolean;
  onPickLeft: () => void;
  onPickRight: () => void;
  onContinue: () => void;
}

export function useGameKeyboard({
  enabled,
  revealed,
  onPickLeft,
  onPickRight,
  onContinue,
}: UseGameKeyboardOptions): void {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (revealed) {
        if (event.key === "Enter") {
          event.preventDefault();
          onContinue();
        }
        return;
      }

      switch (event.key) {
        case "1":
        case "ArrowLeft":
          event.preventDefault();
          onPickLeft();
          break;
        case "2":
        case "ArrowRight":
          event.preventDefault();
          onPickRight();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, revealed, onPickLeft, onPickRight, onContinue]);
}
