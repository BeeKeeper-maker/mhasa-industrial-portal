// ============================================================================
// Clients View — Client logos grid, testimonials, industries served, CTA.
// ============================================================================

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowRight, ArrowUpRight, ChevronLeft, Quote, Star,
  Landmark, Flame, Building2, Factory, HardHat, Compass,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  SectionHeading, FadeIn, GoldDivider,
} from "@/components/site/primitives";
import { TestimonialCard } from "@/components/site/cards";
import { useSiteData } from "@/lib/hooks/use-queries";
import { useAppStore } from "@/lib/store";
import { useLocale } from "@/lib/hooks/use-locale";
import type { LucideIcon } from "lucide-react";

export function ClientsView() {
  return (
    <div className="flex flex-col">
      <PageHero />
      <ClientsGrid />
      <IndustriesSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}

// ============================================================================
// Page Hero — navy hero with breadcrumb.
// ============================================================================
function PageHero() {
  const { t, locale } = useLocale();
  const setView = useAppStore((s) => s.setView);

  return (
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
          <span className="text-gold font-medium">{t.nav.clients}</span>
        </motion.div>

        <SectionHeading
          eyebrow={t.sections.ourClients}
          title={locale === "ar" ? "شركاء النجاح" : "Partners in Success"}
          subtitle={
            locale === "ar"
              ? "نفتخر بثقة أكبر مشغلي المملكة الصناعيين — نتيجة عقود من التسليم الموثوق والحلول الهندسية الموثقة."
              : "We're proud to earn the trust of the Kingdom's leading industrial operators — the result of decades of reliable delivery and engineered solutions."
          }
          light
          align="left"
        />
      </div>
    </section>
  );
}

// ============================================================================
// Clients Grid — refined 4-col grid of logos + industry + website link.
// ============================================================================
function ClientsGrid() {
  const { data: siteData, isLoading } = useSiteData();
  const clients = siteData?.clients ?? [];
  const { t, locale, pick } = useLocale();

  return (
    <section className="section-pad bg-background">
      <div className="container mx-auto px-6">
        <SectionHeading
          eyebrow={locale === "ar" ? "من نعمل معهم" : "Who We Work With"}
          title={locale === "ar" ? "محفظة عملائنا" : "Our Client Portfolio"}
          subtitle={
            locale === "ar"
              ? "مقاول معتمد لدى أكبر مشغلي المملكة في قطاعات النفط والغاز والبتروكيماويات والطاقة والمياه."
              : "An approved contractor with the Kingdom's largest operators across oil & gas, petrochemicals, power, and water."
          }
        />

        {isLoading ? (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[5/4] rounded-2xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : clients.length === 0 ? (
          <div className="mt-12 text-center py-16">
            <p className="text-muted-foreground">{t.common.noResults}</p>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {clients.map((client, i) => (
              <FadeIn key={client.id} delay={i * 0.05}>
                <ClientTile
                  name={pick(client.name, client.nameAr) ?? client.name}
                  logoUrl={client.logoUrl}
                  industry={client.industry}
                  websiteUrl={client.websiteUrl}
                />
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ClientTile({
  name,
  logoUrl,
  industry,
  websiteUrl,
}: {
  name: string;
  logoUrl: string | null;
  industry: string | null;
  websiteUrl: string | null;
}) {
  return (
    <motion.a
      href={websiteUrl ?? undefined}
      target={websiteUrl ? "_blank" : undefined}
      rel={websiteUrl ? "noopener noreferrer" : undefined}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="group relative block h-full overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-colors hover:border-gold/50 hover:shadow-xl hover:shadow-primary/5"
    >
      {/* Logo / name */}
      <div className="flex h-20 items-center justify-center rounded-xl bg-muted/40 p-4 transition-colors group-hover:bg-muted/60">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={name}
            width={160}
            height={64}
            className="max-h-16 w-auto object-contain opacity-80 transition-opacity group-hover:opacity-100"
          />
        ) : (
          <span className="text-lg font-bold text-foreground/70 font-display text-center line-clamp-2">
            {name}
          </span>
        )}
      </div>

      {/* Industry badge + name */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
            {name}
          </h3>
          {industry && (
            <p className="mt-0.5 text-xs text-muted-foreground truncate uppercase tracking-wider">
              {industry}
            </p>
          )}
        </div>
        {websiteUrl && (
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary transition-all duration-300 group-hover:bg-gold group-hover:text-gold-foreground">
            <ArrowUpRight className="h-4 w-4 rtl:rotate-90" />
          </span>
        )}
      </div>
    </motion.a>
  );
}

// ============================================================================
// Industries We Serve — icon grid of target audiences.
// ============================================================================
const industries: { icon: LucideIcon; en: string; ar: string; descEn: string; descAr: string }[] = [
  {
    icon: Landmark,
    en: "Government",
    ar: "القطاع الحكومي",
    descEn: "Municipal & public infrastructure projects across the Kingdom.",
    descAr: "مشاريع البنية التحتية البلدية والعامة في جميع أنحاء المملكة.",
  },
  {
    icon: Flame,
    en: "Oil & Gas",
    ar: "النفط والغاز",
    descEn: "Upstream, midstream, and downstream hydrocarbon facilities.",
    descAr: "المنشآت الهيدروكربونية لأعلى ومنتصف وأسفل القطاع.",
  },
  {
    icon: Building2,
    en: "EPC",
    ar: "EPC",
    descEn: "Engineering, procurement & construction prime contractors.",
    descAr: "مقاولي الهندسة والمشتريات والبناء الرئيسيين.",
  },
  {
    icon: Factory,
    en: "Industrial",
    ar: "الصناعي",
    descEn: "Process plants, refineries, and heavy industrial complexes.",
    descAr: "مصانع العمليات والمصفيات والمجمعات الصناعية الثقيلة.",
  },
  {
    icon: HardHat,
    en: "Construction",
    ar: "المقاولات",
    descEn: "General construction, civil works, and infrastructure development.",
    descAr: "المقاولات العامة والأعمال المدنية وتطوير البنية التحتية.",
  },
  {
    icon: Compass,
    en: "Engineering",
    ar: "الهندسة",
    descEn: "Consulting firms and engineering design houses.",
    descAr: "الشركات الاستشارية ومكاتب التصميم الهندسي.",
  },
];

function IndustriesSection() {
  const { locale } = useLocale();

  return (
    <section className="section-pad bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 end-1/4 h-72 w-72 rounded-full bg-gold blur-3xl" />
      </div>
      <div className="container mx-auto px-6 relative">
        <SectionHeading
          eyebrow={locale === "ar" ? "قطاعات نخدمها" : "Sectors We Serve"}
          title={locale === "ar" ? "الصناعات التي ندعمها" : "Industries We Serve"}
          subtitle={
            locale === "ar"
              ? "خبرة عميقة عبر القطاعات الصناعية الأكثر تطلباً في المملكة العربية السعودية."
              : "Deep expertise across the most demanding industrial sectors in the Kingdom of Saudi Arabia."
          }
        />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {industries.map((ind, i) => (
            <FadeIn key={i} delay={i * 0.06}>
              <Card className="group h-full border-border/60 bg-card p-6 hover:border-gold/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/5 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-110">
                  <ind.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {locale === "ar" ? ind.ar : ind.en}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {locale === "ar" ? ind.descAr : ind.descEn}
                </p>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Testimonials Section — reuses TestimonialCard.
// ============================================================================
function TestimonialsSection() {
  const { data: siteData } = useSiteData();
  const testimonials = siteData?.testimonials ?? [];
  const { locale } = useLocale();

  if (testimonials.length === 0) return null;

  return (
    <section className="section-pad bg-background relative overflow-hidden">
      <Quote className="absolute top-10 start-10 h-32 w-32 text-gold/[0.04] pointer-events-none" />
      <div className="container mx-auto px-6 relative">
        <SectionHeading
          eyebrow={locale === "ar" ? "آراء العملاء" : "Client Testimonials"}
          title={locale === "ar" ? "ماذا يقول شركاؤنا" : "What Our Partners Say"}
          subtitle={
            locale === "ar"
              ? "تقييمات حقيقية من أكبر مشغلي القطاع الصناعي في المملكة."
              : "Real feedback from the Kingdom's leading industrial operators."
          }
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((tm, i) => (
            <TestimonialCard key={tm.id} testimonial={tm} index={i} />
          ))}
        </div>

        {/* Average rating callout */}
        {testimonials.length > 0 && (
          <FadeIn delay={0.2} className="mt-12">
            <div className="mx-auto flex max-w-md flex-col items-center gap-2 rounded-2xl border border-gold/30 bg-gold/5 p-6 text-center">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-gold text-gold" />
                ))}
              </div>
              <p className="text-2xl font-bold text-foreground font-display">
                {(testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length).toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {locale === "ar"
                  ? `متوسط التقييم من ${testimonials.length} عميل`
                  : `Average rating from ${testimonials.length} clients`}
              </p>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
}

// ============================================================================
// CTA Section.
// ============================================================================
function CTASection() {
  const setView = useAppStore((s) => s.setView);
  const { t, locale } = useLocale();

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
            {locale === "ar" ? "انضم إلى شبكة عملائنا" : "Join Our Client Network"}
          </h2>
          <p className="mt-4 text-white/70 text-base md:text-lg leading-relaxed text-balance">
            {locale === "ar"
              ? "تصبح الشريكة الهندسي الموثوق لمشروعك القادم — مع التزام موثق بالسلامة والجودة والتسليم في الموعد."
              : "Become our next trusted engineering partner — with a proven commitment to safety, quality, and on-time delivery."}
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
              <Sparkles className="me-2 h-4 w-4" />
              {t.actions.viewProjects}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
