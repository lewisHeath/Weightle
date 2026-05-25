"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAdFree } from "@/components/ad-free-provider";
import { Button } from "@/components/ui/button";

function RemoveAdsSuccessContent() {
  const searchParams = useSearchParams();
  const { refreshAdFree } = useAdFree();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setStatus("error");
      return;
    }

    void (async () => {
      try {
        const res = await fetch("/api/stripe/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        if (!res.ok) {
          setStatus("error");
          return;
        }
        await refreshAdFree();
        setStatus("ok");
      } catch {
        setStatus("error");
      }
    })();
  }, [searchParams, refreshAdFree]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 text-center">
      {status === "loading" && (
        <>
          <p className="text-4xl" aria-hidden>
            ⏳
          </p>
          <h1 className="text-2xl font-bold">Confirming payment…</h1>
          <p className="text-muted-foreground">Setting up your ad-free Weightle.</p>
        </>
      )}
      {status === "ok" && (
        <>
          <p className="text-4xl" aria-hidden>
            ✨
          </p>
          <h1 className="text-2xl font-bold">You&apos;re ad-free!</h1>
          <p className="text-muted-foreground">
            Thanks for supporting Weightle. Ads are hidden on this device.
          </p>
          <Button asChild size="lg">
            <Link href="/">Play Weightle</Link>
          </Button>
        </>
      )}
      {status === "error" && (
        <>
          <p className="text-4xl" aria-hidden>
            😕
          </p>
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground">
            We couldn&apos;t confirm your payment. If you were charged, contact
            us with your receipt.
          </p>
          <Button asChild variant="secondary">
            <Link href="/">Back home</Link>
          </Button>
        </>
      )}
    </div>
  );
}

export default function RemoveAdsSuccessPage() {
  return (
    <Suspense
      fallback={
        <p className="text-center text-muted-foreground">Loading…</p>
      }
    >
      <RemoveAdsSuccessContent />
    </Suspense>
  );
}
