"use client";

import Script from "next/script";
import { useConsent } from "@/components/consent-provider";
import { hasAdConsentChoice } from "@/lib/consent";
import { getAdsenseClientId } from "@/lib/ads";
import { markAdsenseReady } from "@/lib/adsense-ready";

export function AdsenseLoader() {
  const { consent, adsEnabled } = useConsent();
  const clientId = getAdsenseClientId();

  if (!adsEnabled || !clientId || !hasAdConsentChoice(consent)) return null;

  return (
    <Script
      id="adsense-script"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
      onLoad={markAdsenseReady}
    />
  );
}
