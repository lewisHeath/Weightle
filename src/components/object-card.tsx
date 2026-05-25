"use client";

import { ObjectImage } from "@/components/object-image";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/lib/data";
import type { WeightleObject } from "@/lib/types";
import { getCategoryEmoji } from "@/lib/category-emoji";
import { formatMass } from "@/lib/format-mass";

interface ObjectCardProps {
  object: WeightleObject;
  onPick: () => void;
  disabled?: boolean;
  reveal?: boolean;
  isHeavier?: boolean;
  isPicked?: boolean;
  isWrongPick?: boolean;
}

export function ObjectCard({
  object,
  onPick,
  disabled,
  reveal,
  isHeavier,
  isPicked,
  isWrongPick,
}: ObjectCardProps) {
  const src = getImageUrl(object);

  return (
    <button
      type="button"
      onClick={onPick}
      disabled={disabled}
      className={cn(
        "group flex min-h-0 flex-1 flex-row overflow-hidden rounded-2xl border-2 bg-card/90 text-left shadow-sm shadow-black/20 transition-all sm:flex-col",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        !disabled && !reveal &&
          "cursor-pointer hover:-translate-y-0.5 hover:border-primary hover:shadow-lg hover:shadow-primary/10 active:translate-y-0 active:scale-[0.99]",
        reveal && isHeavier && "border-success bg-success-soft/80",
        reveal && isWrongPick && "border-danger bg-danger-soft/80",
        reveal && isPicked && !isWrongPick && isHeavier && "border-success",
        reveal && isWrongPick && "animate-card-shake",
        disabled && !reveal && "cursor-not-allowed",
      )}
    >
      <div
        className="relative aspect-square w-36 shrink-0 overflow-hidden bg-muted sm:h-auto sm:w-full"
      >
        <ObjectImage src={src} alt={object.name} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 border-l border-border/60 p-3 sm:justify-start sm:border-l-0 sm:border-t sm:p-4">
        <span className="text-base font-semibold leading-tight sm:text-lg">
          {object.name}
        </span>
        <span className="hidden w-fit rounded-full border border-border/70 bg-muted/70 px-2 py-0.5 text-[11px] text-muted-foreground sm:inline-flex">
          {getCategoryEmoji(object.category)} {object.category}
        </span>
        {reveal && (
          <span className="animate-mass-reveal mt-0.5 w-fit rounded-full border border-border/70 bg-background/45 px-2 py-0.5 text-xs font-semibold text-foreground sm:mt-1 sm:text-sm">
            {formatMass(object.massKg)}
            <span className="ml-1 hidden font-normal text-muted-foreground sm:inline">
              · {object.qualifier}
            </span>
          </span>
        )}
      </div>
    </button>
  );
}
