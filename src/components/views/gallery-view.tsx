// ============================================================================
// Gallery View — masonry-style image grid with category filter and lightbox.
// ============================================================================

"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  ChevronLeft, X, Maximize2, ArrowRight, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogTitle,
} from "@/components/ui/dialog";
import {
  SectionHeading, FadeIn, GoldDivider,
} from "@/components/site/primitives";
import { useGallery } from "@/lib/hooks/use-queries";
import { useAppStore } from "@/lib/store";
import { useLocale } from "@/lib/hooks/use-locale";
import type { GalleryItemDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

export function GalleryView() {
  const { t, locale } = useLocale();
  const setView = useAppStore((s) => s.setView);
  const [category, setCategory] = useState<string>("all");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { data: items, isLoading } = useGallery();
  const list = items ?? [];

  // Derive categories from the data
  const categories = useMemo(() => {
    const uniq = Array.from(new Set(list.map((g) => g.category).filter(Boolean)));
    return uniq.sort();
  }, [list]);

  const filtered = useMemo(
    () => (category === "all" ? list : list.filter((g) => g.category === category)),
    [list, category]
  );

  const goNext = useCallback(() => {
    setActiveIndex((i) =>
      i === null ? 0 : (i + 1) % filtered.length
    );
  }, [filtered.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((i) =>
      i === null ? 0 : (i - 1 + filtered.length) % filtered.length
    );
  }, [filtered.length]);

  return (
    <div className="flex flex-col">
      {/* Page Hero */}
      <section className="relative py-16 md:py-24 bg-navy text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 end-0 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
          <div className="absolute bottom-0 start-0 h-96 w-96 rounded-full bg-primary/40 blur-3xl" />
        </div>
        <div className="container mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 text-xs text-white/60 mb-6"
          >
            <button onClick={() => setView("home")} className="hover:text-gold transition-colors">
              {t.nav.home}
            </button>
            <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            <span className="text-gold font-medium">{t.nav.gallery}</span>
          </motion.div>

          <SectionHeading
            eyebrow={t.sections.galleryTitle}
            title={locale === "ar" ? "معرض أعمالنا" : "Our Work in Pictures"}
            subtitle={
              locale === "ar"
                ? "استكشف مجموعتنا من صور المشاريع والمعدات والفريق والمكاتب."
                : "Explore our collection of project, equipment, team, and office photography."
            }
            light
            align="left"
          />
        </div>
      </section>

      {/* Filter bar */}
      <section className="py-10 bg-background border-b border-border">
        <div className="container mx-auto px-6">
          <FadeIn className="flex flex-wrap items-center justify-center gap-2">
            <FilterChip
              active={category === "all"}
              onClick={() => setCategory("all")}
            >
              {locale === "ar" ? "الكل" : "All"}
            </FilterChip>
            {categories.map((cat) => (
              <FilterChip
                key={cat}
                active={category === cat}
                onClick={() => setCategory(cat)}
              >
                {translateCategory(cat, locale)}
              </FilterChip>
            ))}
          </FadeIn>
        </div>
      </section>

      {/* Masonry grid */}
      <section className="section-pad bg-muted/30">
        <div className="container mx-auto px-6">
          {isLoading ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="break-inside-avoid rounded-xl bg-muted/60 animate-pulse"
                  style={{ height: 240 + (i % 3) * 80 }}
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">{t.common.noResults}</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {filtered.map((item, i) => (
                <GalleryTile
                  key={item.id}
                  item={item}
                  index={i}
                  onOpen={() => setActiveIndex(i)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-primary via-navy to-navy">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 end-0 h-96 w-96 rounded-full bg-gold blur-3xl" />
          <div className="absolute bottom-0 start-0 h-96 w-96 rounded-full bg-gold blur-3xl" />
        </div>
        <div className="container mx-auto px-6 relative">
          <div className="mx-auto max-w-3xl text-center">
            <GoldDivider className="mb-6" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-display text-balance">
              {locale === "ar" ? "أعجبك ما رأيت؟" : "Like What You See?"}
            </h2>
            <p className="mt-4 text-white/70 text-base md:text-lg leading-relaxed text-balance">
              {locale === "ar"
                ? "دعنا نبني مشروعك القادم بالجودة نفسها والالتزام بالتميز."
                : "Let's build your next project with the same quality and commitment to excellence."}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                onClick={() => setView("contact")}
                className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold px-8 h-12 text-base shadow-xl shadow-gold/20"
              >
                {t.actions.requestQuote}
                <ArrowRight className="ms-2 h-5 w-5 rtl:rotate-180" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setView("projects")}
                className="border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white h-12 px-8 text-base"
              >
                <Sparkles className="me-2 h-4 w-4 text-gold" />
                {t.actions.viewProjects}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <Dialog open={activeIndex !== null} onOpenChange={(open) => !open && setActiveIndex(null)}>
        <DialogContent
          showCloseButton={false}
          className="max-w-5xl bg-black/95 border-white/10 p-0 overflow-hidden"
        >
          <DialogTitle className="sr-only">
            {activeIndex !== null ? (pickTitle(filtered[activeIndex], locale)) : "Gallery image"}
          </DialogTitle>
          {activeIndex !== null && filtered[activeIndex] && (
            <div className="relative w-full">
              <div className="relative aspect-[16/10] w-full">
                {filtered[activeIndex].imageUrl ? (
                  <Image
                    src={filtered[activeIndex].imageUrl}
                    alt={pickTitle(filtered[activeIndex], locale)}
                    fill
                    sizes="(max-width: 1024px) 100vw, 1024px"
                    className="object-contain"
                  />
                ) : null}
              </div>
              {/* Caption */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <Badge className="bg-gold text-gold-foreground hover:bg-gold border-0 mb-2">
                      {translateCategory(filtered[activeIndex].category, locale)}
                    </Badge>
                    <h3 className="text-white font-bold text-lg">
                      {pickTitle(filtered[activeIndex], locale)}
                    </h3>
                  </div>
                  <span className="text-xs text-white/60">
                    {activeIndex + 1} / {filtered.length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Close */}
          <button
            aria-label="Close"
            onClick={() => setActiveIndex(null)}
            className="absolute top-3 end-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Prev / Next */}
          {filtered.length > 1 && (
            <>
              <button
                aria-label="Previous"
                onClick={goPrev}
                className="absolute start-3 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
              </button>
              <button
                aria-label="Next"
                onClick={goNext}
                className="absolute end-3 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 rotate-180 rtl:rotate-0" />
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// Gallery Tile — single image with hover overlay.
// ============================================================================
function GalleryTile({
  item,
  index,
  onOpen,
}: {
  item: GalleryItemDTO;
  index: number;
  onOpen: () => void;
}) {
  const { locale, pick } = useLocale();
  const title = pick(item.title, item.titleAr) ?? item.title;

  return (
    <motion.button
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.4) }}
      onClick={onOpen}
      className="group relative block w-full mb-4 break-inside-avoid overflow-hidden rounded-xl bg-muted cursor-zoom-in"
    >
      <div className="relative aspect-[4/3]">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : null}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category badge — top start */}
        <div className="absolute top-3 start-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Badge className="bg-gold text-gold-foreground hover:bg-gold border-0 font-semibold">
            {translateCategory(item.category, locale)}
          </Badge>
        </div>

        {/* Zoom icon — top end */}
        <div className="absolute top-3 end-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:-translate-y-1">
          <Maximize2 className="h-4 w-4" />
        </div>

        {/* Title — bottom */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">{title}</h3>
        </div>
      </div>
    </motion.button>
  );
}

// ============================================================================
// Filter Chip.
// ============================================================================
function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all",
        active
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
          : "bg-muted/60 text-foreground hover:bg-muted hover:text-primary"
      )}
    >
      {children}
    </button>
  );
}

// ============================================================================
// Helpers.
// ============================================================================
function pickTitle(item: GalleryItemDTO | undefined, locale: "en" | "ar"): string {
  if (!item) return "";
  return (locale === "ar" ? (item.titleAr ?? item.title) : item.title) ?? item.title;
}

function translateCategory(category: string, locale: "en" | "ar"): string {
  if (locale !== "ar") return category;
  const map: Record<string, string> = {
    Projects: "مشاريع",
    Equipment: "معدات",
    Team: "الفريق",
    Office: "المكتب",
  };
  return map[category] ?? category;
}
