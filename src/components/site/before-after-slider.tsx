// ============================================================================
// Before/After Image Slider — interactive comparison component.
// ============================================================================

"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { MoveHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  alt?: string;
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Before",
  afterLabel = "After",
  className,
  alt = "Project comparison",
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(800);

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) setContainerWidth(containerRef.current.clientWidth);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      updatePosition(clientX);
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [isDragging, updatePosition]);

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    updatePosition(clientX);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative aspect-[16/10] w-full select-none overflow-hidden rounded-2xl bg-muted cursor-ew-resize",
        className
      )}
      onMouseDown={startDrag}
      onTouchStart={startDrag}
    >
      {/* After image (full) */}
      <Image
        src={afterImage}
        alt={`${alt} — after`}
        fill
        sizes="(max-width: 768px) 100vw, 800px"
        className="object-cover"
        draggable={false}
      />
      <span className="absolute top-4 end-4 rounded-full bg-navy/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
        {afterLabel}
      </span>

      {/* Before image (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <div className="relative h-full w-full" style={{ width: `${containerWidth}px` }}>
          <Image
            src={beforeImage}
            alt={`${alt} — before`}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
            draggable={false}
          />
        </div>
        <span className="absolute top-4 start-4 rounded-full bg-gold/90 px-3 py-1 text-xs font-semibold text-gold-foreground backdrop-blur-sm">
          {beforeLabel}
        </span>
      </div>

      {/* Divider handle */}
      <div
        className="absolute inset-y-0 z-10 w-0.5 bg-white shadow-lg"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-navy shadow-xl ring-2 ring-gold">
          <MoveHorizontal className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
