export {};

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
