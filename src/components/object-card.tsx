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
        "group flex flex-1 flex-col overflow-hidden rounded-xl border-2 bg-card text-left transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        !disabled && !reveal &&
          "cursor-pointer hover:border-primary hover:shadow-md active:scale-[0.98]",
        reveal && isHeavier && "border-success bg-success-soft",
        reveal && isWrongPick && "border-danger bg-danger-soft",
        reveal && isPicked && !isWrongPick && isHeavier && "border-success",
        disabled && !reveal && "cursor-not-allowed",
      )}
    >
      <div className="relative aspect-square w-full bg-muted">
        <ObjectImage src={src} alt={object.name} />
      </div>
      <div className="flex flex-col gap-1 p-4">
        <span className="text-lg font-semibold leading-tight">{object.name}</span>
        <span className="text-xs text-muted-foreground">
          {getCategoryEmoji(object.category)} {object.category}
        </span>
        {reveal && (
          <span className="mt-1 text-sm font-medium text-foreground">
            {formatMass(object.massKg)}
            <span className="ml-1 font-normal text-muted-foreground">
              · {object.qualifier}
            </span>
          </span>
        )}
      </div>
    </button>
  );
}
