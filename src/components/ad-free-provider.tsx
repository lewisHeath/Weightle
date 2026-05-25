"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface AdFreeContextValue {
  adFree: boolean;
  loaded: boolean;
  refreshAdFree: () => Promise<void>;
}

const AdFreeContext = createContext<AdFreeContextValue | null>(null);

export function useAdFree(): AdFreeContextValue {
  const ctx = useContext(AdFreeContext);
  if (!ctx) {
    throw new Error("useAdFree must be used within AdFreeProvider");
  }
  return ctx;
}

export function AdFreeProvider({ children }: { children: React.ReactNode }) {
  const [adFree, setAdFree] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const refreshAdFree = useCallback(async () => {
    try {
      const res = await fetch("/api/ad-free/status", { cache: "no-store" });
      const data = (await res.json()) as { adFree?: boolean };
      setAdFree(Boolean(data.adFree));
    } catch {
      setAdFree(false);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void refreshAdFree();
  }, [refreshAdFree]);

  const value = useMemo(
    () => ({ adFree, loaded, refreshAdFree }),
    [adFree, loaded, refreshAdFree],
  );

  return (
    <AdFreeContext.Provider value={value}>{children}</AdFreeContext.Provider>
  );
}
