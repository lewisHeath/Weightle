"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function HowToPlay() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          How to play
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>⚖️ How to play Weightle</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3 pt-2 text-left text-muted-foreground">
              <p>
                You&apos;ll see two objects. Tap the one you think is{" "}
                <strong className="text-foreground">heavier</strong>.
              </p>
              <p>
                There are <strong className="text-foreground">5 rounds</strong>{" "}
                per game. After each pick, we reveal the real weights and how
                far off you were.
              </p>
              <p>
                <strong className="text-foreground">📅 Daily Weightle</strong> is
                the same puzzle for everyone and resets at midnight UTC.
              </p>
              <p>
                <strong className="text-foreground">♾️ Unlimited</strong> gives you
                a fresh random set every time.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
