// ============================================================================
// useParallax — returns a motion value that shifts based on scroll position.
// Used for subtle parallax effects on hero images and decorative elements.
// ============================================================================

"use client";

import { useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef, type RefObject } from "react";

interface ParallaxResult {
  ref: RefObject<HTMLDivElement | null>;
  y: MotionValue<number>;
}

/**
 * Returns a ref + motion value for parallax scrolling.
 * The element will move vertically as the user scrolls.
 * @param offset - max pixels to shift (default 80)
 */
export function useParallax(offset = 80): ParallaxResult {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-offset / 2, offset / 2]);

  return { ref, y };
}
