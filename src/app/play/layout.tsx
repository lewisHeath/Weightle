import { PlayLayoutShell } from "@/components/play-layout-shell";

export default function PlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PlayLayoutShell>{children}</PlayLayoutShell>;
}
