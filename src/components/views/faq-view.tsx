// ============================================================================
// FAQ View — searchable, category-filtered accordion of frequently asked
// questions, with a "still have questions?" CTA at the bottom.
// ============================================================================

"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, ChevronLeft, Search, HelpCircle, MessageCircle,
  Mail, Phone, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion";
import {
  SectionHeading, FadeIn, GoldDivider,
} from "@/components/site/primitives";
import { useSiteData } from "@/lib/hooks/use-queries";
import { useAppStore } from "@/lib/store";
import { useLocale } from "@/lib/hooks/use-locale";
import type { FaqItemDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

export function FaqView() {
  return (
    <div className="flex flex-col">
      <PageHero />
      <FaqSection />
      <StillHaveQuestionsCTA />
    </div>
  );
}

// ============================================================================
// Page Hero — navy hero with breadcrumb + title.
// ============================================================================
function PageHero() {
  const { t, locale } = useLocale();
  const setView = useAppStore((s) => s.setView);

  return (
    <section className="relative py-16 md:py-24 bg-navy text-white overflow-hidden">
      {/* Decorative blurred shapes */}
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
          <span className="text-gold font-medium">{t.nav.faq}</span>
        </motion.div>

        <SectionHeading
          eyebrow={locale === "ar" ? "مركز المساعدة" : "Help Center"}
          title={locale === "ar" ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
          subtitle={
            locale === "ar"
              ? "إجابات سريعة على أكثر الأسئلة شيوعاً حول خدماتنا ومشاريعنا وعملياتنا."
              : "Quick answers to the most common questions about our services, projects, and operations."
          }
          light
          align="left"
        />
      </div>
    </section>
  );
}

// ============================================================================
// FAQ Section — search + category chips + accordion grouped by category.
// ============================================================================
// Bilingual labels for known seed categories; unknown categories fall back
// to the raw string in both locales.
const CATEGORY_LABELS: Record<string, { en: string; ar: string }> = {
  General:     { en: "General",     ar: "أسئلة عامة" },
  Technical:   { en: "Technical",   ar: "أسئلة فنية" },
  Compliance:  { en: "Compliance",  ar: "الامتثال" },
  Services:    { en: "Services",    ar: "الخدمات" },
  Safety:      { en: "Safety",      ar: "السلامة" },
};

function FaqSection() {
  const { t, locale, pick } = useLocale();
  const { data, isLoading } = useSiteData();
  const faqs = data?.faqs ?? [];

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Derive the distinct list of categories from the data, preserving the
  // order in which they first appear.
  const categories = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const f of faqs) {
      if (!f.category || seen.has(f.category)) continue;
      seen.add(f.category);
      ordered.push(f.category);
    }
    return ordered;
  }, [faqs]);

  // Apply category + text filters, then group by category for rendering.
  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = faqs.filter((f) => {
      const inCategory = activeCategory === "all" || f.category === activeCategory;
      if (!inCategory) return false;
      if (!q) return true;
      const haystack = [
        f.question, f.questionAr, f.answer, f.answerAr,
      ].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(q);
    });

    const map = new Map<string, FaqItemDTO[]>();
    for (const f of filtered) {
      const arr = map.get(f.category) ?? [];
      arr.push(f);
      map.set(f.category, arr);
    }
    // Preserve the canonical category order from the source data.
    return categories
      .filter((c) => map.has(c))
      .map((c) => ({ category: c, items: map.get(c)! }));
  }, [faqs, categories, activeCategory, search]);

  const totalShown = grouped.reduce((n, g) => n + g.items.length, 0);
  const hasFilters = activeCategory !== "all" || search.trim().length > 0;

  const labelFor = (cat: string) => {
    const labels = CATEGORY_LABELS[cat];
    if (!labels) return cat;
    return locale === "ar" ? labels.ar : labels.en;
  };

  return (
    <section className="section-pad bg-background">
      <div className="container mx-auto px-6">
        <SectionHeading
          eyebrow={locale === "ar" ? "تصفح حسب الفئة" : "Browse by Category"}
          title={locale === "ar" ? "كيف يمكننا مساعدتك؟" : "How Can We Help?"}
          subtitle={
            locale === "ar"
              ? "ابحث في قاعدة معرفتنا أو اختر فئة لعرض الأسئلة الأكثر صلة بمشروعك."
              : "Search our knowledge base or pick a category to see the questions most relevant to your project."
          }
        />

        {/* Search input */}
        <FadeIn className="mt-10 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={locale === "ar" ? "ابحث في الأسئلة..." : "Search questions..."}
              className="h-12 ps-11 pe-10 text-base rounded-full border-border/60 bg-muted/30 focus-visible:bg-background"
              aria-label={locale === "ar" ? "ابحث في الأسئلة" : "Search questions"}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute end-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label={locale === "ar" ? "مسح البحث" : "Clear search"}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </FadeIn>

        {/* Category chips */}
        <FadeIn className="mt-8" delay={0.05}>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <FilterChip active={activeCategory === "all"} onClick={() => setActiveCategory("all")}>
              {locale === "ar" ? "الكل" : "All"}
            </FilterChip>
            {categories.map((c) => (
              <FilterChip
                key={c}
                active={activeCategory === c}
                onClick={() => setActiveCategory(c)}
              >
                {labelFor(c)}
              </FilterChip>
            ))}
          </div>
        </FadeIn>

        {/* Results count */}
        <FadeIn className="mt-6 text-center" delay={0.1}>
          <p className="text-xs text-muted-foreground">
            {isLoading ? (
              t.common.loading
            ) : totalShown === 0 ? (
              t.common.noResults
            ) : (
              <>
                {totalShown}{" "}
                {locale === "ar"
                  ? `سؤال ${hasFilters ? "(مُصفّى)" : ""}`
                  : `question${totalShown === 1 ? "" : "s"}${hasFilters ? " (filtered)" : ""}`}
              </>
            )}
          </p>
        </FadeIn>

        {/* Accordion — grouped by category */}
        <div className="mt-10 max-w-4xl mx-auto space-y-12">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : grouped.length === 0 ? (
            <EmptyState search={search} />
          ) : (
            grouped.map((group, gi) => (
              <FadeIn key={group.category} delay={gi * 0.04}>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Badge
                      variant="secondary"
                      className="bg-primary/5 text-primary border border-primary/10 font-semibold"
                    >
                      {labelFor(group.category)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {group.items.length}{" "}
                      {locale === "ar"
                        ? "سؤال"
                        : group.items.length === 1 ? "question" : "questions"}
                    </span>
                    <div className="flex-1 h-px bg-border/60" />
                  </div>

                  <Card className="border-border/60 bg-card overflow-hidden">
                    <Accordion type="single" collapsible className="px-2">
                      {group.items.map((faq, i) => (
                        <FaqAccordionItem
                          key={faq.id}
                          faq={faq}
                          index={i}
                          question={pick(faq.question, faq.questionAr) ?? faq.question}
                          answer={pick(faq.answer, faq.answerAr) ?? faq.answer}
                        />
                      ))}
                    </Accordion>
                  </Card>
                </div>
              </FadeIn>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Single FAQ Accordion Item — gold accent on open + hover effects.
// ============================================================================
function FaqAccordionItem({
  faq, index, question, answer,
}: {
  faq: FaqItemDTO;
  index: number;
  question: string;
  answer: string;
}) {
  const { locale } = useLocale();
  return (
    <AccordionItem
      value={faq.id}
      className={cn(
        "group border-border/60 transition-colors",
        "data-[state=open]:border-gold/40",
        "hover:bg-muted/30",
        index !== 0 && "border-t"
      )}
    >
      <AccordionTrigger
        className={cn(
          "px-4 md:px-6 py-5 text-start",
          "hover:no-underline",
          "[&[data-state=open]]:text-primary"
        )}
      >
        <span className="flex items-start gap-3 flex-1">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary text-xs font-bold font-display transition-colors group-data-[state=open]:bg-gold group-data-[state=open]:text-gold-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-base font-semibold text-foreground leading-snug">
            {question}
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="ps-4 pe-6 md:ps-16 md:pe-8">
        <div className="relative">
          <span className="absolute -start-3 top-1 bottom-1 w-0.5 rounded-full bg-gold/60" />
          <p
            className={cn(
              "text-sm md:text-base leading-relaxed text-muted-foreground",
              locale === "ar" && "text-right"
            )}
          >
            {answer}
          </p>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

// ============================================================================
// Empty State — shown when no FAQs match filters.
// ============================================================================
function EmptyState({ search }: { search: string }) {
  const { locale } = useLocale();
  return (
    <div className="text-center py-16 max-w-md mx-auto">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
        <HelpCircle className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-bold text-foreground font-display">
        {locale === "ar" ? "لا توجد نتائج مطابقة" : "No matching questions found"}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {search
          ? locale === "ar"
            ? `لم نعثر على أسئلة تطابق "${search}". جرّب كلمة أخرى أو تواصل معنا مباشرة.`
            : `We couldn't find any questions matching "${search}". Try a different term or reach out to us directly.`
          : locale === "ar"
            ? "لا توجد أسئلة في هذه الفئة حالياً."
            : "There are no questions in this category yet."}
      </p>
    </div>
  );
}

// ============================================================================
// Filter Chip — pill button used for category selection.
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
      type="button"
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
// Still Have Questions CTA — contact options at the bottom.
// ============================================================================
function StillHaveQuestionsCTA() {
  const setView = useAppStore((s) => s.setView);
  const { t, locale } = useLocale();
  const { data } = useSiteData();
  const settings = data?.settings;
  const phonePrimary = settings?.phonePrimary ?? null;

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-primary via-navy to-navy">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 end-0 h-96 w-96 rounded-full bg-gold blur-3xl" />
        <div className="absolute bottom-0 start-0 h-96 w-96 rounded-full bg-gold blur-3xl" />
      </div>
      <div className="container mx-auto px-6 relative">
        <div className="mx-auto max-w-3xl text-center">
          <GoldDivider className="mb-6" />
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-display text-balance">
            {locale === "ar" ? "ما زالت لديك أسئلة؟" : "Still Have Questions?"}
          </h2>
          <p className="mt-4 text-white/70 text-base md:text-lg leading-relaxed text-balance">
            {locale === "ar"
              ? "فريقنا الهندسي جاهز للإجابة على استفساراتك وتقديم استشارة مخصصة لمشروعك."
              : "Our engineering team is ready to answer your questions and provide tailored guidance for your project."}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              onClick={() => setView("contact")}
              className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold px-8 h-12 text-base shadow-xl shadow-gold/20"
            >
              <MessageCircle className="inline h-5 w-5 me-2" />
              {t.actions.getInTouch}
              <ArrowRight className="ms-2 h-5 w-5 rtl:rotate-180" />
            </Button>
            {phonePrimary && (
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-12 px-8 text-base border-white/30 text-white bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/50"
              >
                <a href={`tel:${phonePrimary}`} dir="ltr">
                  <Phone className="inline h-5 w-5 me-2" />
                  {phonePrimary}
                </a>
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-12 px-8 text-base border-white/30 text-white bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/50"
            >
              <a href="mailto:info@mhaksa.com">
                <Mail className="inline h-5 w-5 me-2" />
                info@mhaksa.com
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
