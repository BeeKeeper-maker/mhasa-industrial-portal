// ============================================================================
// Services View — list mode (grid of services + "why our services") and
// detail mode (single service with features + related projects + CTA).
// ============================================================================

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowRight, ChevronLeft, CheckCircle2, ShieldCheck,
  Award, Clock, Zap, MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  SectionHeading, FadeIn, GoldDivider,
} from "@/components/site/primitives";
import { ServiceCard, ProjectCard } from "@/components/site/cards";
import { ServiceComparisonTable } from "@/components/site/service-comparison-table";
import { ServiceGridSkeleton } from "@/components/site/skeletons";
import { LastUpdatedBadge } from "@/components/site/last-updated-badge";
import { Icon } from "@/components/site/icon";
import { useServices, useService } from "@/lib/hooks/use-queries";
import { useAppStore } from "@/lib/store";
import { useLocale } from "@/lib/hooks/use-locale";
import { useWhatsApp } from "@/lib/hooks/use-whatsapp";
import type { ServiceDTO } from "@/lib/types";

export function ServicesView() {
  const selectedSlug = useAppStore((s) => s.selectedServiceSlug);
  if (selectedSlug) return <ServiceDetail slug={selectedSlug} />;
  return <ServicesList />;
}

// ============================================================================
// List Mode — hero + grid of services + "why our services".
// ============================================================================
function ServicesList() {
  const { data: services, isLoading } = useServices();
  const { t, locale } = useLocale();
  const list = services ?? [];

  return (
    <div className="flex flex-col">
      <PageHero
        eyebrow={t.nav.services}
        title={locale === "ar" ? "حلول الأنابيب الصناعية المتكاملة" : "Comprehensive Industrial Piping Solutions"}
        subtitle={
          locale === "ar"
            ? "من تركيب أنابيب RTR وGRP وGRE إلى تصنيع FRP المخصص وأعمال الصرف — نقدم حلولاً هندسية متكاملة لأكثر القطاعات تطلباً."
            : "From RTR, GRP, and GRE pipe installation to custom FRP fabrication and sewer works — we deliver end-to-end engineered solutions for the most demanding sectors."
        }
        breadcrumb={t.nav.services}
      />

      {/* Services grid */}
      <section className="section-pad bg-background">
        <div className="container mx-auto px-6">
          {isLoading ? (
            <ServiceGridSkeleton count={6} />
          ) : list.length === 0 ? null : (
            <div className="fade-in-content grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((svc, i) => (
                <ServiceCard key={svc.id} service={svc} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      <ServiceComparisonTable />

      <WhyOurServices />

      <CTASection />
    </div>
  );
}

// ============================================================================
// Detail Mode — single service with description, features, related projects.
// ============================================================================
function ServiceDetail({ slug }: { slug: string }) {
  const { data: service, isLoading } = useService(slug);
  const { t, locale, pick } = useLocale();
  const resetSelection = useAppStore((s) => s.resetSelection);
  const setView = useAppStore((s) => s.setView);
  const { shareService: waShareService } = useWhatsApp();

  if (isLoading) {
    return (
      <div className="min-h-[60dvh] flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">{t.common.loading}</div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-[60dvh] flex flex-col items-center justify-center gap-4 bg-background">
        <p className="text-muted-foreground">{t.common.noResults}</p>
        <Button onClick={resetSelection} variant="outline">
          <ChevronLeft className="me-2 h-4 w-4 rtl:rotate-180" />
          {locale === "ar" ? "العودة للخدمات" : "Back to Services"}
        </Button>
      </div>
    );
  }

  const title = pick(service.title, service.titleAr) ?? service.title;
  const excerpt = pick(service.excerpt, service.excerptAr);
  const description = pick(service.description, service.descriptionAr) ?? service.description;
  const waService = waShareService(title);
  const relatedProjects = (service as ServiceDTO & { projects?: Array<{ id: string; slug: string; title: string; titleAr: string | null; clientName: string; category: string; location: string | null; imageUrl: string | null }> }).projects ?? [];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative py-16 md:py-20 bg-navy text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 end-0 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
          <div className="absolute bottom-0 start-0 h-96 w-96 rounded-full bg-primary/40 blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative">
          {/* Back button */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            onClick={resetSelection}
            className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-gold transition-colors mb-8"
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            {locale === "ar" ? "كل الخدمات" : "All Services"}
          </motion.button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/15 text-gold mb-6"
              >
                <Icon name={service.icon} className="h-8 w-8" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-balance leading-tight"
              >
                {title}
              </motion.h1>
              {excerpt && (
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-5 text-base md:text-lg text-white/80 leading-relaxed max-w-2xl"
                >
                  {excerpt}
                </motion.p>
              )}
              {service.updatedAt && (
                <div className="mt-4">
                  <LastUpdatedBadge date={service.updatedAt} locale={locale} className="text-white/50" />
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <Button
                  size="lg"
                  onClick={() => setView("contact")}
                  className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold px-7 h-12 text-base shadow-xl shadow-gold/20"
                >
                  {t.actions.requestQuote}
                  <ArrowRight className="ms-2 h-5 w-5 rtl:rotate-180" />
                </Button>
                {waService.url && (
                  <a
                    href={waService.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-6 h-12 text-base font-semibold text-white hover:bg-[#1da851] transition-colors"
                  >
                    <MessageCircle className="h-5 w-5" />
                    {waService.label}
                  </a>
                )}
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setView("projects")}
                  className="border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white h-12 px-7 text-base"
                >
                  {t.actions.viewProjects}
                </Button>
              </motion.div>
            </div>

            {service.imageUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:col-span-5"
              >
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={service.imageUrl}
                    alt={title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Description + Features */}
      <section className="section-pad bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Description */}
            <FadeIn className="lg:col-span-7">
              <SectionHeading
                eyebrow={locale === "ar" ? "نظرة عامة" : "Overview"}
                title={locale === "ar" ? "تفاصيل الخدمة" : "Service Overview"}
                align="left"
              />
              <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
                {description.split("\n").filter(Boolean).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </FadeIn>

            {/* Features sidebar */}
            <FadeIn delay={0.15} className="lg:col-span-5">
              <div className="sticky top-8">
                <Card className="overflow-hidden border-border/60 bg-card p-0">
                  <div className="bg-navy text-white p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/15 text-gold">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <h3 className="font-bold font-display">
                        {locale === "ar" ? "المميزات الرئيسية" : "Key Features"}
                      </h3>
                    </div>
                  </div>
                  <ul className="divide-y divide-border/50">
                    {service.features.length === 0 ? (
                      <li className="p-5 text-sm text-muted-foreground">
                        {locale === "ar" ? "لا توجد مميزات محددة." : "No specific features listed."}
                      </li>
                    ) : (
                      service.features.map((feature, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: 10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: i * 0.05 }}
                          className="flex items-start gap-3 p-4"
                        >
                          <CheckCircle2 className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground/90">{feature}</span>
                        </motion.li>
                      ))
                    )}
                  </ul>
                </Card>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="section-pad bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <div className="absolute top-0 end-1/4 h-72 w-72 rounded-full bg-primary blur-3xl" />
          </div>
          <div className="container mx-auto px-6 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <SectionHeading
                eyebrow={locale === "ar" ? "أعمالنا" : "Our Work"}
                title={locale === "ar" ? "مشاريع ذات صلة" : "Related Projects"}
                align="left"
              />
              <Button
                variant="outline"
                onClick={() => setView("projects")}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground self-start md:self-auto font-semibold"
              >
                {t.actions.viewAll}
                <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProjects.map((p, i) => {
                // Wrap into a ProjectDTO shape and reuse ProjectCard
                const projectDTO = {
                  id: p.id,
                  slug: p.slug,
                  title: p.title,
                  titleAr: p.titleAr,
                  clientName: p.clientName,
                  category: p.category,
                  location: p.location ?? null,
                  value: null,
                  currency: "SAR",
                  startDate: null,
                  completionDate: null,
                  description: "",
                  descriptionAr: null,
                  imageUrl: p.imageUrl,
                  galleryImages: [],
                  beforeImage: null,
                  afterImage: null,
                  isFeatured: false,
                };
                return (
                  <ProjectCard
                    key={p.id}
                    project={projectDTO}
                    index={i}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}

      <CTASection />
    </div>
  );
}

// ============================================================================
// Why Our Services — feature highlights.
// ============================================================================
function WhyOurServices() {
  const { locale } = useLocale();

  const features = [
    {
      icon: ShieldCheck,
      titleEn: "Safety-First Execution",
      titleAr: "تنفيذ بأمان أولاً",
      descEn:
        "ISO 45001-certified HSE management on every project, with full-time safety officers and a zero-incident target.",
      descAr:
        "إدارة HSE معتمدة بـ ISO 45001 في كل مشروع، مع ضباط سلامة بدوام كامل وهدف الحوادث الصفرية.",
    },
    {
      icon: Award,
      titleEn: "Approved Contractor Status",
      titleAr: "صفة المقاول المعتمد",
      descEn:
        "Approved with Saudi Aramco, SABIC, SWCC, Sadara, and SATORP — meeting the most stringent vendor standards.",
      descAr:
        "معتمدون لدى أرامكو وسابك وسوادا وسدرة وساتورب — نلبي أصرم معايير الموردين.",
    },
    {
      icon: Zap,
      titleEn: "Certified Specialist Crews",
      titleAr: "فرق متخصصة معتمدة",
      descEn:
        "ASME B31.3 and API 15HR trained technicians with decades of combined experience in GRE/GRP/RTR systems.",
      descAr:
        "فنيون مدربون على ASME B31.3 وAPI 15HR بعقود من الخبرة المشتركة في أنظمة GRE/GRP/RTR.",
    },
    {
      icon: Clock,
      titleEn: "On-Time Delivery Promise",
      titleAr: "وعد التسليم في الموعد",
      descEn:
        "PMP-certified project management with precise scheduling — a proven record of on-time or ahead-of-schedule delivery.",
      descAr:
        "إدارة مشاريع معتمدة PMP مع جدولة دقيقة — سجل مثبت على التسليم في الوقت أو قبله.",
    },
  ];

  return (
    <section className="section-pad bg-navy text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
        <div className="absolute top-1/4 start-1/4 h-72 w-72 rounded-full bg-gold blur-3xl" />
      </div>
      <div className="container mx-auto px-6 relative">
        <SectionHeading
          eyebrow={locale === "ar" ? "لماذا خدماتنا" : "Why Our Services"}
          title={locale === "ar" ? "التميز في كل تفصيلة" : "Excellence in Every Detail"}
          subtitle={
            locale === "ar"
              ? "نجمع بين الخبرة التقنية والمعرفة المحلية والثقافة الراسخة للسلامة."
              : "We combine technical expertise, local knowledge, and a deep-rooted safety culture."
          }
          light
        />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <Card className="h-full glass-card border-white/10 p-6 hover:border-gold/40 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15 text-gold mb-4">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">
                  {locale === "ar" ? f.titleAr : f.titleEn}
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  {locale === "ar" ? f.descAr : f.descEn}
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
// Page Hero — shared hero for the services list page.
// ============================================================================
function PageHero({
  eyebrow,
  title,
  subtitle,
  breadcrumb,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  breadcrumb: string;
}) {
  const { t } = useLocale();
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
          <span className="text-gold font-medium">{breadcrumb}</span>
        </motion.div>

        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          light
          align="left"
        />
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
            {locale === "ar" ? "لنبدأ مشروعك القادم" : "Let's Build Your Next Project"}
          </h2>
          <p className="mt-4 text-white/70 text-base md:text-lg leading-relaxed text-balance">
            {locale === "ar"
              ? "تحدث إلى فريقنا الهندسي اليوم واحصل على عرض سعر مخصص خلال 24 ساعة."
              : "Talk to our engineering team today and get a tailored quotation within 24 hours."}
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
              {t.actions.viewProjects}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
