"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAdFree } from "@/components/ad-free-provider";
import { useConsent } from "@/components/consent-provider";

export function SiteFooter() {
  const { adFree } = useAdFree();
  const { reopenConsent, adsEnabled } = useConsent();
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);

  useEffect(() => {
    void fetch("/api/ad-free/status", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { paymentsEnabled?: boolean }) => {
        setPaymentsEnabled(Boolean(data.paymentsEnabled));
      })
      .catch(() => setPaymentsEnabled(false));
  }, []);

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
          href="/objects"
          className="underline decoration-border/60 underline-offset-2 hover:text-foreground/80"
        >
          Objects
        </Link>
        {" · "}
        <Link
          href="/faq"
          className="underline decoration-border/60 underline-offset-2 hover:text-foreground/80"
        >
          FAQ
        </Link>
        {" · "}
        <Link
          href="/about"
          className="underline decoration-border/60 underline-offset-2 hover:text-foreground/80"
        >
          About
        </Link>
        {" · "}
        <Link
          href="/contact"
          className="underline decoration-border/60 underline-offset-2 hover:text-foreground/80"
        >
          Contact
        </Link>
        {" · "}
        <Link
          href="/privacy"
          className="underline decoration-border/60 underline-offset-2 hover:text-foreground/80"
        >
          Privacy
        </Link>
        {paymentsEnabled && (
          <>
            {" · "}
            {adFree ? (
              <span className="text-foreground/90">✨ Ad-free</span>
            ) : (
              <Link
                href="/api/stripe/checkout"
                className="underline decoration-border/60 underline-offset-2 hover:text-foreground/80"
              >
                Remove ads (£2.99)
              </Link>
            )}
          </>
        )}
        {adsEnabled && !adFree && (
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
