// ============================================================================
// useScrollReveal — returns animation variants + ref for scroll-triggered
// reveals. Provides staggered child animations for grids/lists.
// ============================================================================

"use client";

import { type Variants } from "framer-motion";

/** Container that staggers its children's reveal. */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

/** Child item that fades up. Use inside a motion container with staggerContainer. */
export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Child item that scales in. */
export const scaleItem: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

/** Child item that slides in from the left. */
export const slideLeftItem: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

/** Child item that slides in from the right. */
export const slideRightItem: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

/** Viewport config for whileInView — triggers once, slightly before in view. */
export const viewportOnce = { once: true, margin: "-60px" } as const;
