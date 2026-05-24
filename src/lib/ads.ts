export type AdPlacement = "sidebar-left" | "sidebar-right";

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() ?? "";
const AD_SLOTS: Record<AdPlacement, string> = {
  "sidebar-left": process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR_LEFT?.trim() ?? "",
  "sidebar-right":
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR_RIGHT?.trim() ?? "",
};

export function getAdsenseClientId(): string | null {
  return ADSENSE_CLIENT_ID || null;
}

export function getAdSlot(placement: AdPlacement): string | null {
  const slot = AD_SLOTS[placement];
  return slot || null;
}

export function isAdsConfigured(): boolean {
  return ADSENSE_CLIENT_ID.length > 0;
}

export function isAdsDemoMode(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    ADSENSE_CLIENT_ID === "ca-pub-0000000000000000"
  );
}
