import type { Metadata } from "next";
import { DailyGate } from "@/components/daily-gate";

export const metadata: Metadata = {
  title: "Daily Weightle — Which is heavier?",
  description:
    "Play today's shared Weightle puzzle. Five rounds, same objects for everyone, resets at midnight UTC.",
};

export default function DailyPlayPage() {
  return <DailyGate />;
}
