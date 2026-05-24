"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AdUnit } from "@/components/ads/ad-unit";
import { useConsent } from "@/components/consent-provider";
import { hasAdConsentChoice } from "@/lib/consent";
import {
  loadAdRailsCollapsed,
  saveAdRailsCollapsed,
  toggleAdRail,
  type AdRailSide,
} from "@/lib/ad-rail-storage";
import { cn } from "@/lib/utils";

function SideRail({
  placement,
  side,
  collapsed,
  onToggle,
  showToggle,
}: {
  placement: "sidebar-left" | "sidebar-right";
  side: AdRailSide;
  collapsed: boolean;
  onToggle: () => void;
  showToggle: boolean;
}) {
  const isLeft = side === "left";
  const ExpandIcon = isLeft ? ChevronRight : ChevronLeft;
  const CollapseIcon = isLeft ? ChevronLeft : ChevronRight;

  return (
    <aside
      className={cn(
        "ad-rail shrink-0",
        isLeft ? "ad-rail-left" : "ad-rail-right",
        collapsed && "ad-rail-collapsed",
        !showToggle && "ad-rail-responsive-hidden",
      )}
      aria-label={isLeft ? "Left advertisement" : "Right advertisement"}
      aria-hidden={collapsed}
    >
      {showToggle && (
        <button
          type="button"
          className="ad-rail-toggle"
          onClick={onToggle}
          aria-label={collapsed ? "Show sidebar ad" : "Hide sidebar ad"}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <ExpandIcon className="h-4 w-4" aria-hidden />
          ) : (
            <CollapseIcon className="h-4 w-4" aria-hidden />
          )}
        </button>
      )}
      <div className="ad-rail-inner sticky top-20 pt-2">
        <AdUnit placement={placement} variant="sidebar" />
      </div>
    </aside>
  );
}

export function AdLayoutShell({ children }: { children: React.ReactNode }) {
  const { consent, adsEnabled } = useConsent();
  const [collapsed, setCollapsed] = useState({ left: false, right: false });
  const [railsVisible, setRailsVisible] = useState(false);

  useEffect(() => {
    setCollapsed(loadAdRailsCollapsed());
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 52rem)");
    const update = () => setRailsVisible(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const showAds =
    adsEnabled && hasAdConsentChoice(consent) && railsVisible;

  const toggle = useCallback((side: AdRailSide) => {
    setCollapsed((prev) => {
      const next = toggleAdRail(prev, side);
      saveAdRailsCollapsed(next);
      return next;
    });
  }, []);

  return (
    <div
      className={cn(
        "ad-layout mx-auto flex w-full max-w-6xl flex-1 px-4",
        collapsed.left && collapsed.right && "ad-layout-both-collapsed",
      )}
    >
      <SideRail
        placement="sidebar-left"
        side="left"
        collapsed={collapsed.left}
        onToggle={() => toggle("left")}
        showToggle={showAds}
      />
      <div className="mx-auto min-w-0 w-full max-w-2xl flex-1">{children}</div>
      <SideRail
        placement="sidebar-right"
        side="right"
        collapsed={collapsed.right}
        onToggle={() => toggle("right")}
        showToggle={showAds}
      />
    </div>
  );
}
