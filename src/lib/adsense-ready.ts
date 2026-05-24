export const ADSENSE_READY_EVENT = "weightle-adsense-ready";

export function markAdsenseReady(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ADSENSE_READY_EVENT));
}

export function onAdsenseReady(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(ADSENSE_READY_EVENT, callback);
  return () => window.removeEventListener(ADSENSE_READY_EVENT, callback);
}
