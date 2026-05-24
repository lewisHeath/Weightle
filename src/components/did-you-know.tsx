import type { WeightleObject } from "./types";
import { formatMass } from "./format-mass";

export function DidYouKnow({ object }: { object: WeightleObject }) {
  return (
    <div className="mt-3 border-t border-border/60 pt-3 text-sm">
      <p className="font-medium text-foreground">💡 Did you know?</p>
      <p className="mt-1 text-muted-foreground">
        {object.name} — {object.qualifier.toLowerCase()} (
        {formatMass(object.massKg)}).
      </p>
      {object.sourceUrl && (
        <a
          href={object.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-primary underline-offset-2 hover:underline"
        >
          Learn more →
        </a>
      )}
    </div>
  );
}
