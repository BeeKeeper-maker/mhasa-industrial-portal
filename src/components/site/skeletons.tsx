// ============================================================================
// Skeleton Loaders — shimmer placeholders for async content.
// Used while data is loading to prevent layout shift.
// ============================================================================

"use client";

import { cn } from "@/lib/utils";

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "shimmer rounded-lg",
        className
      )}
    />
  );
}

// -------- Project Card Skeleton --------
export function ProjectCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/40 bg-card">
      <Shimmer className="aspect-[4/3] rounded-none" />
      <div className="p-4 space-y-3">
        <Shimmer className="h-4 w-3/4" />
        <Shimmer className="h-3 w-1/2" />
        <div className="flex gap-2">
          <Shimmer className="h-5 w-16 rounded-full" />
          <Shimmer className="h-5 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// -------- Project Grid Skeleton --------
export function ProjectGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}

// -------- Blog Card Skeleton --------
export function BlogCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/40 bg-card">
      <Shimmer className="aspect-[16/9] rounded-none" />
      <div className="p-5 space-y-3">
        <Shimmer className="h-3 w-20 rounded-full" />
        <Shimmer className="h-5 w-full" />
        <Shimmer className="h-4 w-3/4" />
        <div className="flex items-center gap-2 pt-2">
          <Shimmer className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

// -------- Blog Grid Skeleton --------
export function BlogGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  );
}

// -------- Service Card Skeleton --------
export function ServiceCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/40 bg-card p-6 space-y-4">
      <Shimmer className="h-14 w-14 rounded-xl" />
      <Shimmer className="h-5 w-3/4" />
      <div className="space-y-2">
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-5/6" />
      </div>
    </div>
  );
}

// -------- Service Grid Skeleton --------
export function ServiceGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ServiceCardSkeleton key={i} />
      ))}
    </div>
  );
}

// -------- Team Member Skeleton --------
export function TeamCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
      <Shimmer className="aspect-square rounded-none" />
      <div className="p-5 space-y-3">
        <Shimmer className="h-5 w-2/3" />
        <Shimmer className="h-3 w-1/2" />
        <div className="space-y-2 pt-1">
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-4/5" />
        </div>
      </div>
    </div>
  );
}

// -------- Gallery Skeleton --------
export function GallerySkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Shimmer key={i} className="aspect-square" />
      ))}
    </div>
  );
}

// -------- Generic List Skeleton --------
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border border-border/40 bg-card p-4">
          <Shimmer className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Shimmer className="h-4 w-1/3" />
            <Shimmer className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// -------- Section Skeleton (heading + grid) --------
export function SectionSkeleton() {
  return (
    <div className="section-pad">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-3xl text-center space-y-4 mb-12">
          <Shimmer className="h-4 w-32 mx-auto rounded-full" />
          <Shimmer className="h-10 w-2/3 mx-auto" />
          <Shimmer className="h-4 w-full mx-auto" />
          <Shimmer className="h-4 w-4/5 mx-auto" />
        </div>
        <ServiceGridSkeleton />
      </div>
    </div>
  );
}
