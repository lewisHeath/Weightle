"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  loadConsent,
  saveConsent,
  updateGoogleConsent,
  type ConsentStatus,
} from "@/lib/consent";
import { isAdsConfigured } from "@/lib/ads";

interface ConsentContextValue {
  consent: ConsentStatus | null;
  showBanner: boolean;
  acceptConsent: () => void;
  rejectConsent: () => void;
  reopenConsent: () => void;
  adsEnabled: boolean;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error("useConsent must be used within ConsentProvider");
  }
  return ctx;
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentStatus | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const adsEnabled = isAdsConfigured();

  useEffect(() => {
    if (!adsEnabled) {
      setConsent("rejected");
      return;
    }
    const stored = loadConsent();
    setConsent(stored);
    setShowBanner(stored === "pending");
    if (stored === "accepted" || stored === "rejected") {
      updateGoogleConsent(stored);
    }
  }, [adsEnabled]);

  const acceptConsent = useCallback(() => {
    saveConsent("accepted");
    updateGoogleConsent("accepted");
    setConsent("accepted");
    setShowBanner(false);
  }, []);

  const rejectConsent = useCallback(() => {
    saveConsent("rejected");
    updateGoogleConsent("rejected");
    setConsent("rejected");
    setShowBanner(false);
  }, []);

  const reopenConsent = useCallback(() => {
    setShowBanner(true);
  }, []);

  const value = useMemo(
    () => ({
      consent,
      showBanner,
      acceptConsent,
      rejectConsent,
      reopenConsent,
      adsEnabled,
    }),
    [
      consent,
      showBanner,
      acceptConsent,
      rejectConsent,
      reopenConsent,
      adsEnabled,
    ],
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}
