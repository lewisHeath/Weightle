"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HomeStats } from "@/components/home-stats";
import {
  useHomeKeyboard,
} from "@/hooks/use-home-keyboard";

function ShortcutKey({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-md border border-border/80 bg-muted px-1.5 py-0.5 font-mono text-[10px] shadow-sm shadow-black/10">
      {children}
    </kbd>
  );
}

function HomeKeyboardHints() {
  return (
    <p className="text-center text-xs text-muted-foreground">
      <ShortcutKey>D</ShortcutKey> daily · <ShortcutKey>U</ShortcutKey>{" "}
      unlimited · <ShortcutKey>M</ShortcutKey> mute
    </p>
  );
}

function StepItem({
  step,
  colorClassName,
  children,
}: {
  step: number;
  colorClassName: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-2">
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${colorClassName}`}
      >
        {step}
      </span>
      <span>{children}</span>
    </li>
  );
}

export function HomeMenu() {
  useHomeKeyboard();

  return (
    <div className="flex flex-col items-center gap-7">
      <div className="text-center">
        <p
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border/80 bg-card/80 text-4xl shadow-sm shadow-black/20"
          aria-hidden
        >
          ⚖️
        </p>
        <h1 className="text-shimmer mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
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
          className="h-[3.25rem] w-full border border-daily/70 bg-daily text-white shadow-md shadow-daily/20 hover:bg-daily/90"
        >
          <Link href="/play/daily">📅 Daily Weightle</Link>
        </Button>
        <Button
          asChild
          size="lg"
          className="h-[3.25rem] w-full border border-unlimited/70 bg-unlimited text-white shadow-md shadow-unlimited/20 hover:bg-unlimited/90"
        >
          <Link href="/play/unlimited">♾️ Unlimited Weightle</Link>
        </Button>
      </div>

      <HomeKeyboardHints />

      <Card className="w-full max-w-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">💡 How it works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ol className="space-y-2">
            <StepItem step={1} colorClassName="bg-daily">
              Compare two objects side by side 👀
            </StepItem>
            <StepItem step={2} colorClassName="bg-unlimited">
              Tap the one you think weighs more 👆
            </StepItem>
            <StepItem step={3} colorClassName="bg-amber-500">
              See the real weights after each pick ⚖️
            </StepItem>
            <StepItem step={4} colorClassName="bg-success">
              Complete all 5 rounds for your score 🏆
            </StepItem>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
