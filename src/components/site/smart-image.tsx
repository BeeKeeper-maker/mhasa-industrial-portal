// ============================================================================
// SmartImage — Next/Image wrapper with blur-up placeholder + loading shimmer.
// Shows a shimmer placeholder until the image loads, then fades in smoothly.
// ============================================================================

"use client";

import { useState, type ImgProps } from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface SmartImageProps extends Omit<ImageProps, "onLoad" | "onLoadingComplete"> {
  /** Aspect ratio class for the container (e.g., "aspect-[4/3]"). */
  aspectClass?: string;
  /** Show a shimmer effect while loading (default true). */
  shimmer?: boolean;
}

export function SmartImage({
  aspectClass,
  shimmer = true,
  className,
  alt,
  ...props
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted/40",
        aspectClass,
        className as string | undefined
      )}
    >
      {/* Shimmer placeholder */}
      {!loaded && shimmer && (
        <div className="absolute inset-0 shimmer" aria-hidden="true" />
      )}
      <Image
        {...props}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={cn(
          "transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
          className as string | undefined
        )}
      />
    </div>
  );
}

// Re-export type for convenience
export type { ImgProps };
