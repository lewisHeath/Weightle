"use client";

import Link from "next/link";
import { useConsent } from "@/components/consent-provider";

export function SiteFooter() {
  const { reopenConsent, adsEnabled } = useConsent();

  return (
    <footer className="mt-auto shrink-0 border-t border-border/40 py-4 text-center text-sm text-muted-foreground/80">
      <p>
        Weights are estimates with stated assumptions.{" "}
        <Link
          href="/credits"
          className="underline decoration-border/60 underline-offset-2 hover:text-foreground/80"
        >
          Image credits
        </Link>
        {" · "}
        <Link
          href="/privacy"
          className="underline decoration-border/60 underline-offset-2 hover:text-foreground/80"
        >
          Privacy
        </Link>
        {adsEnabled && (
          <>
            {" · "}
            <button
              type="button"
              onClick={reopenConsent}
              className="underline decoration-border/60 underline-offset-2 hover:text-foreground/80"
            >
              Cookie settings
            </button>
          </>
        )}
      </p>
    </footer>
  );
}
