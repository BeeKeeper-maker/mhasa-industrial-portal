// ============================================================================
// Blog Table of Contents — sticky sidebar TOC for long blog posts.
// Parses markdown headings (## and ###) and provides anchor links.
// Uses scroll-spy to highlight the active section.
// ============================================================================

"use client";

import { useState, useEffect, useMemo } from "react";
import { List, ChevronRight } from "lucide-react";
import { useLocale } from "@/lib/hooks/use-locale";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: number; // 2 for ##, 3 for ###
}

interface BlogTocProps {
  content: string;
}

/** Extracts ## and ### headings from markdown, generates URL-safe IDs. */
function parseHeadings(markdown: string): TocItem[] {
  const lines = markdown.split("\n");
  const items: TocItem[] = [];
  const usedIds = new Set<string>();

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)/);
    if (!match) continue;
    const level = match[1].length;
    const text = match[2].replace(/[*_`~\[\]]/g, "").trim();
    if (!text) continue;

    // Generate unique slug
    let id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    if (!id) id = `heading-${items.length}`;
    let uniqueId = id;
    let counter = 2;
    while (usedIds.has(uniqueId)) {
      uniqueId = `${id}-${counter}`;
      counter++;
    }
    usedIds.add(uniqueId);
    items.push({ id: uniqueId, text, level });
  }
  return items;
}

export function BlogToc({ content }: BlogTocProps) {
  const { locale } = useLocale();
  const [activeId, setActiveId] = useState<string>("");
  const headings = useMemo(() => parseHeadings(content), [content]);

  // Scroll-spy
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-100px 0px -70% 0px", threshold: 0 }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null; // Only show TOC for posts with 3+ headings

  return (
    <div className="sticky top-24">
      <div className="rounded-xl border border-border/60 bg-muted/30 p-5">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-primary mb-4">
          <List className="h-3.5 w-3.5 text-gold" />
          {locale === "ar" ? "محتويات المقال" : "In This Article"}
        </div>
        <nav className="space-y-0.5 max-h-[50vh] overflow-y-auto pe-1">
          {headings.map((h, i) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(h.id);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                  // Update URL hash without jump
                  window.history.replaceState(null, "", `#${h.id}`);
                }
              }}
              className={cn(
                "group flex items-start gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors",
                h.level === 3 && "ps-5",
                activeId === h.id
                  ? "bg-background text-primary font-semibold"
                  : "text-muted-foreground hover:bg-background hover:text-primary"
              )}
            >
              {activeId === h.id ? (
                <ChevronRight className="mt-0.5 h-3 w-3 flex-shrink-0 text-gold rtl:rotate-180" />
              ) : (
                <span className="mt-0.5 text-[10px] font-bold font-display text-gold/50 group-hover:text-gold/70 flex-shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
              )}
              <span className={cn("leading-snug line-clamp-2", h.level === 3 && "text-xs")}>
                {h.text}
              </span>
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}

/**
 * Wraps ReactMarkdown to inject IDs into h2/h3 elements for TOC anchoring.
 * Usage: <ReactMarkdown components={markdownComponents} />
 */
export const markdownHeadingComponents = {
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const text = String(children ?? "");
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    return (
      <h2 id={id} className="scroll-mt-24" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const text = String(children ?? "");
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    return (
      <h3 id={id} className="scroll-mt-24" {...props}>
        {children}
      </h3>
    );
  },
};
