"use client";

import { useEffect, useState } from "react";
import { formatCountdown, getMsUntilNextUtcMidnight } from "@/lib/utc-date";

export function DailyCountdown() {
  const [remaining, setRemaining] = useState(getMsUntilNextUtcMidnight());

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(getMsUntilNextUtcMidnight());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="rounded-full border border-border/70 bg-muted/55 px-3 py-1 text-sm text-muted-foreground">
      ⏰ Next daily in{" "}
      <span className="font-semibold text-foreground">
        {formatCountdown(remaining)}
      </span>
    </p>
  );
}
