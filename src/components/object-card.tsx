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
        "group flex min-h-0 flex-1 flex-row overflow-hidden rounded-xl border-2 bg-card text-left transition-all sm:flex-col",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        !disabled && !reveal &&
          "cursor-pointer hover:border-primary hover:shadow-md active:scale-[0.98]",
        reveal && isHeavier && "border-success bg-success-soft",
        reveal && isWrongPick && "border-danger bg-danger-soft",
        reveal && isPicked && !isWrongPick && isHeavier && "border-success",
        reveal && isWrongPick && "animate-card-shake",
        disabled && !reveal && "cursor-not-allowed",
      )}
    >
      <div
        className="relative aspect-square w-36 shrink-0 bg-muted sm:h-auto sm:w-full"
      >
        <ObjectImage src={src} alt={object.name} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 p-3 sm:justify-start sm:gap-1 sm:p-4">
        <span className="text-base font-semibold leading-tight sm:text-lg">
          {object.name}
        </span>
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {getCategoryEmoji(object.category)} {object.category}
        </span>
        {reveal && (
          <span className="animate-mass-reveal mt-0.5 text-xs font-medium text-foreground sm:mt-1 sm:text-sm">
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
