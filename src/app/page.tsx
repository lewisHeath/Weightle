import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HomeStats } from "@/components/home-stats";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <p className="text-4xl" aria-hidden>
          ⚖️
        </p>
        <h1 className="text-shimmer mt-2 text-4xl font-bold sm:text-5xl">
          The Weightle
        </h1>
        <p className="mt-3 max-w-md text-lg text-muted-foreground">
          Two objects. One question: which is heavier? 🏋️ Five rounds — how
          many can you get right?
        </p>
      </div>

      <HomeStats />

      <div className="grid w-full max-w-sm gap-3">
        <Button
          asChild
          size="lg"
          className="w-full bg-daily text-white shadow-md shadow-daily/25 hover:bg-daily/90"
        >
          <Link href="/play/daily">📅 Daily Weightle</Link>
        </Button>
        <Button
          asChild
          size="lg"
          className="w-full bg-unlimited text-white shadow-md shadow-unlimited/25 hover:bg-unlimited/90"
        >
          <Link href="/play/unlimited">♾️ Unlimited Weightle</Link>
        </Button>
      </div>

      <Card className="w-full max-w-sm border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">🎯 How it works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ol className="list-inside list-decimal space-y-1">
            <li>Compare two objects side by side 👀</li>
            <li>Tap the one you think weighs more 👆</li>
            <li>See the real weights after each pick ⚖️</li>
            <li>Complete all 5 rounds for your score 🏆</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
