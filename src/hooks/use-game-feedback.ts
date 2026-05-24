"use client";

import { useCallback } from "react";
import { useSound } from "@/components/sound-provider";
import { vibrateFor } from "@/lib/haptics";
import {
  unlockAudio,
  type CompleteOptions,
  type SoundName,
} from "@/lib/sounds";

export function useGameFeedback() {
  const { play, soundEnabled } = useSound();

  const feedback = useCallback(
    (name: SoundName, options?: CompleteOptions) => {
      if (!soundEnabled) return;
      if (name === "pick") unlockAudio();
      play(name, options);
      vibrateFor(name, options);
    },
    [play, soundEnabled],
  );

  return { feedback, soundEnabled };
}
