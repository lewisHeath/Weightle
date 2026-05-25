"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAdFree } from "@/components/ad-free-provider";
import { useConsent } from "@/components/consent-provider";

export function CookieConsentBanner() {
  const { adFree } = useAdFree();
  const { showBanner, acceptConsent, rejectConsent, adsEnabled } = useConsent();

  if (adFree || !adsEnabled || !showBanner) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-border bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lg"
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 text-sm">
          <p id="cookie-consent-title" className="font-medium">
            Cookies on Weightle
          </p>
          <p
            id="cookie-consent-desc"
            className="mt-1 text-muted-foreground"
          >
            We use cookies for personalized ads from Google. Accept for
            personalized ads, or reject for non-personalized ads without
            tracking cookies.{" "}
            <Link
              href="/privacy"
              className="underline decoration-border underline-offset-2 hover:text-foreground"
            >
              Privacy policy
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={rejectConsent}>
            Reject
          </Button>
          <Button size="sm" onClick={acceptConsent}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
