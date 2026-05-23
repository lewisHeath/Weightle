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
    <p className="text-sm text-muted-foreground">
      ⏰ Next daily in{" "}
      <span className="font-medium text-foreground">
        {formatCountdown(remaining)}
      </span>
    </p>
  );
}
