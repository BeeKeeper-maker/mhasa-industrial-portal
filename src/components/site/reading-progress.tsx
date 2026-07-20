// ============================================================================
// Reading Progress Bar — fixed top progress indicator that tracks scroll
// position within the main content area. Used on blog posts + legal pages.
// ============================================================================

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function ReadingProgress({ color = "var(--gold)" }: { color?: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress(Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)));
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-0 inset-x-0 z-[60] h-1 bg-transparent pointer-events-none">
      <motion.div
        className="h-full origin-left"
        style={{
          scaleX: progress / 100,
          backgroundColor: color,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
      />
    </div>
  );
}
