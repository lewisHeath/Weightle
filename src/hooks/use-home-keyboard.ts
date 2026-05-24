"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSound } from "@/components/sound-provider";
import { playSound, unlockAudio } from "@/lib/sounds";

export function useHomeKeyboard(): void {
  const router = useRouter();
  const { soundEnabled, toggleSound } = useSound();

  const playMenuSound = useCallback(() => {
    unlockAudio();
    playSound("menu");
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "d") {
        event.preventDefault();
        if (soundEnabled) playMenuSound();
        router.push("/play/daily");
        return;
      }

      if (key === "u") {
        event.preventDefault();
        if (soundEnabled) playMenuSound();
        router.push("/play/unlimited");
        return;
      }

      if (key === "m") {
        event.preventDefault();
        if (soundEnabled) {
          playMenuSound();
          toggleSound();
        } else {
          toggleSound();
          playMenuSound();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, soundEnabled, toggleSound, playMenuSound]);
}
