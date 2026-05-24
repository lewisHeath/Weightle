export type ConsentStatus = "pending" | "accepted" | "rejected";

const CONSENT_KEY = "weightle-cookie-consent-v1";

export function loadConsent(): ConsentStatus {
  if (typeof window === "undefined") return "pending";
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (raw === "accepted" || raw === "rejected") return raw;
  } catch {
    // ignore
  }
  return "pending";
}

export function saveConsent(status: Exclude<ConsentStatus, "pending">): void {
  localStorage.setItem(CONSENT_KEY, status);
}

export function updateGoogleConsent(status: Exclude<ConsentStatus, "pending">): void {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag =
    window.gtag ??
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };

  if (status === "accepted") {
    window.gtag("consent", "update", {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    });
    return;
  }

  window.gtag("consent", "update", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

export function hasAdConsentChoice(
  consent: ConsentStatus | null,
): consent is Exclude<ConsentStatus, "pending"> {
  return consent === "accepted" || consent === "rejected";
}

export function wantsPersonalizedAds(consent: ConsentStatus | null): boolean {
  return consent === "accepted";
}
