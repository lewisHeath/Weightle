import { GameBoard } from "@/components/game-board";

export default function UnlimitedPlayPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="hidden text-center sm:block">
        <h1 className="text-2xl font-bold">♾️ Unlimited Weightle</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A fresh random set every game 🎲
        </p>
      </div>
      <GameBoard mode="unlimited" />
    </div>
  );
}
