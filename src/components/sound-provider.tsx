"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  playSound,
  unlockAudio,
  type CompleteOptions,
  type SoundName,
} from "@/lib/sounds";

const STORAGE_KEY = "weightle-sound-enabled";

type SoundContextValue = {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  toggleSound: () => void;
  play: (name: SoundName, options?: CompleteOptions) => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [soundEnabled, setSoundEnabledState] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setSoundEnabledState(stored !== "false");
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);
    localStorage.setItem(STORAGE_KEY, String(enabled));
    if (enabled) unlockAudio();
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabledState((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      if (next) unlockAudio();
      return next;
    });
  }, []);

  const play = useCallback(
    (name: SoundName, options?: CompleteOptions) => {
      if (!soundEnabled) return;
      playSound(name, options);
    },
    [soundEnabled],
  );

  return (
    <SoundContext.Provider
      value={{ soundEnabled, setSoundEnabled, toggleSound, play }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound must be used within SoundProvider");
  return ctx;
}
