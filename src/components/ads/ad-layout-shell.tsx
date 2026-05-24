"use client";

import { AdUnit } from "@/components/ads/ad-unit";
import { cn } from "@/lib/utils";

function SideRail({
  placement,
  side,
}: {
  placement: "sidebar-left" | "sidebar-right";
  side: "left" | "right";
}) {
  return (
    <aside
      className={cn(
        "ad-rail hidden w-40 shrink-0 xl:block",
        side === "left" ? "ad-rail-left" : "ad-rail-right",
      )}
      aria-label={
        side === "left" ? "Left advertisement" : "Right advertisement"
      }
    >
      <div className="sticky top-20 pt-2">
        <AdUnit placement={placement} variant="sidebar" />
      </div>
    </aside>
  );
}

export function AdLayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="ad-layout mx-auto flex w-full max-w-6xl flex-1 gap-4 px-4 lg:gap-6">
      <SideRail placement="sidebar-left" side="left" />
      <div className="mx-auto min-w-0 w-full max-w-2xl flex-1">{children}</div>
      <SideRail placement="sidebar-right" side="right" />
    </div>
  );
}
