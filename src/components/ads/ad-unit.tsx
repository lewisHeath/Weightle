"use client";

import { useEffect, useRef } from "react";
import { useConsent } from "@/components/consent-provider";
import { useAdFree } from "@/components/ad-free-provider";
import { hasAdConsentChoice, wantsPersonalizedAds } from "@/lib/consent";
import {
  getAdsenseClientId,
  getAdSlot,
  isAdsDemoMode,
  type AdPlacement,
} from "@/lib/ads";
import { onAdsenseReady } from "@/lib/adsense-ready";
import { cn } from "@/lib/utils";

interface AdUnitProps {
  placement: AdPlacement;
  variant?: "inline" | "sidebar";
  className?: string;
}

export function AdUnit({
  placement,
  variant = "inline",
  className,
}: AdUnitProps) {
  const { consent, adsEnabled } = useConsent();
  const { adFree } = useAdFree();
  const pushed = useRef(false);
  const clientId = getAdsenseClientId();
  const slotId = getAdSlot(placement);
  const demoMode = isAdsDemoMode();
  const sidebar = variant === "sidebar";
  const personalized = wantsPersonalizedAds(consent);
  const showAds =
    !adFree && adsEnabled && hasAdConsentChoice(consent) && clientId && slotId;

  useEffect(() => {
    pushed.current = false;
  }, [showAds, personalized, placement]);

  useEffect(() => {
    if (!showAds || demoMode) return;

    const pushAd = () => {
      if (pushed.current) return;
      try {
        window.adsbygoogle = window.adsbygoogle ?? [];
        window.adsbygoogle.push(
          personalized ? {} : { requestNonPersonalizedAds: true },
        );
        pushed.current = true;
      } catch {
        // Script not ready yet
      }
    };

    pushAd();
    const unsubscribe = onAdsenseReady(pushAd);
    const retry = window.setInterval(() => {
      pushAd();
      if (pushed.current) window.clearInterval(retry);
    }, 500);

    return () => {
      unsubscribe();
      window.clearInterval(retry);
    };
  }, [showAds, demoMode, personalized, placement]);

  if (!showAds) {
    return null;
  }

  if (demoMode) {
    return (
      <div
        className={cn(
          "ad-unit flex w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-2 text-center text-xs text-muted-foreground",
          sidebar ? "min-h-[600px]" : "min-h-[90px]",
          className,
        )}
        aria-label="Advertisement preview"
      >
        Ad · {placement.replace("sidebar-", "")} (
        {personalized ? "personalized" : "non-personalized"})
      </div>
    );
  }

  return (
    <div
      className={cn(
        "ad-unit w-full overflow-hidden",
        sidebar && "min-h-[600px]",
        className,
      )}
      aria-label="Advertisement"
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block", textAlign: "center" }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
        {...(!personalized ? { "data-npa": "1" } : {})}
      />
    </div>
  );
}
