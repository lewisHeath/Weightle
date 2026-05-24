import { StatsDashboard } from "@/components/stats-dashboard";

export const metadata = {
  title: "Stats — Weightle",
  description: "Your Weightle daily streak, scores, and history.",
};

export default function StatsPage() {
  return <StatsDashboard />;
}
