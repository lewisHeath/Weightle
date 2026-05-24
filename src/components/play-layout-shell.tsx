"use client";

import { useEffect } from "react";

export function PlayLayoutShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add("play-mode");
    return () => document.documentElement.classList.remove("play-mode");
  }, []);

  return (
    <div className="play-shell flex min-h-0 flex-1 flex-col">{children}</div>
  );
}
