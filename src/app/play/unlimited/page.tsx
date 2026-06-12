import type { Metadata } from "next";
import { GameBoard } from "@/components/game-board";

export const metadata: Metadata = {
  title: "Unlimited Weightle — Which is heavier?",
  description:
    "Practice Weightle with a fresh random set of five object comparisons every game.",
};

export default function UnlimitedPlayPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-6 hidden text-center sm:mb-8 sm:block">
        <h1 className="text-2xl font-bold">♾️ Unlimited Weightle</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A fresh random set every game 🎲
        </p>
      </div>
      <GameBoard mode="unlimited" />
    </div>
  );
}
