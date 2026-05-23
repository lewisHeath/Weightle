import { GameBoard } from "@/components/game-board";

export default function UnlimitedPlayPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Unlimited Weightle</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A fresh random set every game
        </p>
      </div>
      <GameBoard mode="unlimited" />
    </div>
  );
}
