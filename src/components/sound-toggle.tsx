"use client";

import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSound } from "@/components/sound-provider";

export function SoundToggle() {
  const { soundEnabled, toggleSound } = useSound();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="shrink-0"
      aria-label={soundEnabled ? "Mute sounds" : "Unmute sounds"}
      onClick={toggleSound}
    >
      {soundEnabled ? (
        <Volume2 className="h-4 w-4" />
      ) : (
        <VolumeX className="h-4 w-4" />
      )}
    </Button>
  );
}
