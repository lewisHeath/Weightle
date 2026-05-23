"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ObjectImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
}

export function ObjectImage({ src, alt, className, sizes }: ObjectImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-muted text-muted-foreground",
          className,
        )}
        aria-hidden
      >
        <span className="text-4xl font-bold opacity-40">
          {alt.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={cn("object-cover", className)}
      sizes={sizes ?? "(max-width: 768px) 45vw, 280px"}
      unoptimized={src.includes("wikimedia") || src.includes("cdn.weightle")}
      onError={() => setFailed(true)}
    />
  );
}
