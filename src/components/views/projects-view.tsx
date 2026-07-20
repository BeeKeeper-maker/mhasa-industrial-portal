// ============================================================================
// Projects View — list mode (with category filter) and detail mode
// (hero, meta grid, gallery lightbox, before/after slider, related services).
// ============================================================================

"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowRight, ChevronLeft, MapPin, Building2, Calendar, Wallet,
  Tag, CheckCircle2, Sparkles, Maximize2, X, Search, ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogTitle,
} from "@/components/ui/dialog";
import {
  SectionHeading, FadeIn, GoldDivider,
} from "@/components/site/primitives";
import { ProjectCard } from "@/components/site/cards";
import { BeforeAfterSlider } from "@/components/site/before-after-slider";
import { Icon } from "@/components/site/icon";
import { useProjects, useProject } from "@/lib/hooks/use-queries";
import { useAppStore } from "@/lib/store";
import { useLocale } from "@/lib/hooks/use-locale";
import type { ProjectDTO, ServiceDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProjectsView() {
  const selectedSlug = useAppStore((s) => s.selectedProjectSlug);
  if (selectedSlug) return <ProjectDetail slug={selectedSlug} />;
  return <ProjectsList />;
}

// ============================================================================
// List Mode — hero + category filter + grid.
// ============================================================================
function ProjectsList() {
  const { t, locale } = useLocale();
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<string>("newest");

  // Fetch all projects to derive categories
  const { data: allProjects, isLoading: allLoading } = useProjects();
  const { data: filtered } = useProjects({ category });

  const baseProjects = category === "all" ? (allProjects ?? []) : (filtered ?? []);

  // Client-side search + sort
  const projects = useMemo(() => {
    let result = baseProjects;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.location ?? "").toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    const sorted = [...result];
    switch (sort) {
      case "newest":
        sorted.sort((a, b) => new Date(b.completionDate ?? 0).getTime() - new Date(a.completionDate ?? 0).getTime());
        break;
      case "oldest":
        sorted.sort((a, b) => new Date(a.completionDate ?? 0).getTime() - new Date(b.completionDate ?? 0).getTime());
        break;
      case "value-high":
        sorted.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
        break;
      case "value-low":
        sorted.sort((a, b) => (a.value ?? 0) - (b.value ?? 0));
        break;
      case "alpha":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    return sorted;
  }, [baseProjects, search, sort]);

  const categories = useMemo(() => {
    if (!allProjects) return [];
    const uniq = Array.from(new Set(allProjects.map((p) => p.category).filter(Boolean)));
    return uniq.sort();
  }, [allProjects]);

  return (
    <div className="flex flex-col">
      <PageHero
        eyebrow={t.nav.projects}
        title={locale === "ar" ? "مشاريع نفخر بها" : "Projects We're Proud Of"}
        subtitle={
          locale === "ar"
            ? "استكشف محفظتنا من مشاريع تركيب الأنابيب الصناعية لأكبر مشغلي المملكة."
            : "Explore our portfolio of industrial pipe installation projects for the Kingdom's largest operators."
        }
        breadcrumb={t.nav.projects}
      />

      <section className="section-pad bg-background">
        <div className="container mx-auto px-6">
          {/* Search + Sort bar */}
          <FadeIn className="mb-6">
            <div className="flex flex-col md:flex-row gap-3 max-w-3xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={locale === "ar" ? "ابحث عن مشاريع، عملاء، مواقع..." : "Search projects, clients, locations..."}
                  className="ps-9 h-11"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-full md:w-[200px] h-11">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{locale === "ar" ? "الأحدث أولاً" : "Newest first"}</SelectItem>
                  <SelectItem value="oldest">{locale === "ar" ? "الأقدم أولاً" : "Oldest first"}</SelectItem>
                  <SelectItem value="value-high">{locale === "ar" ? "القيمة: الأعلى" : "Value: High to Low"}</SelectItem>
                  <SelectItem value="value-low">{locale === "ar" ? "القيمة: الأقل" : "Value: Low to High"}</SelectItem>
                  <SelectItem value="alpha">{locale === "ar" ? "أبجدي" : "Alphabetical"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FadeIn>

          {/* Category filter bar */}
          <FadeIn className="mb-8">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <FilterChip
                active={category === "all"}
                onClick={() => setCategory("all")}
              >
                {t.common.allCategories}
              </FilterChip>
              {categories.map((cat) => (
                <FilterChip
                  key={cat}
                  active={category === cat}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </FilterChip>
              ))}
            </div>
          </FadeIn>

          {/* Result count */}
          {!allLoading && (
            <div className="mb-6 text-center text-sm text-muted-foreground">
              {projects.length} {locale === "ar" ? "مشروع" : (projects.length === 1 ? "project" : "projects")}
              {search && <span className="ms-1">{locale === "ar" ? `مطابقة لـ "${search}"` : `matching "${search}"`}</span>}
              {category !== "all" && <span className="ms-1">{locale === "ar" ? `في ${category}` : `in ${category}`}</span>}
            </div>
          )}

          {/* Grid */}
          {allLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] rounded-2xl bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20">
              <Search className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">{t.common.noResults}</p>
              {(search || category !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => { setSearch(""); setCategory("all"); }}
                >
                  {locale === "ar" ? "مسح الفلاتر" : "Clear filters"}
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      <CTASection />
    </div>
  );
}

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
// Detail Mode — full project view with gallery + before/after.
// ============================================================================
function ProjectDetail({ slug }: { slug: string }) {
  const { data: project, isLoading } = useProject(slug);
  const { t, locale, pick } = useLocale();
  const resetSelection = useAppStore((s) => s.resetSelection);
  const setView = useAppStore((s) => s.setView);
  const openService = useAppStore((s) => s.openService);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">{t.common.loading}</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-background">
        <p className="text-muted-foreground">{t.common.noResults}</p>
        <Button onClick={resetSelection} variant="outline">
          <ChevronLeft className="me-2 h-4 w-4 rtl:rotate-180" />
          {locale === "ar" ? "العودة للمشاريع" : "Back to Projects"}
        </Button>
      </div>
    );
  }

  const title = pick(project.title, project.titleAr) ?? project.title;
  const description = pick(project.description, project.descriptionAr) ?? project.description;
  const gallery = project.galleryImages ?? [];
  const hasBeforeAfter = !!project.beforeImage && !!project.afterImage;
  const services = project.services ?? [];

  // Currency formatting
  const formatCurrency = (val: number | null, currency: string) => {
    if (val == null) return null;
    try {
      return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
        style: "currency",
        currency: currency || "SAR",
        maximumFractionDigits: 0,
      }).format(val);
    } catch {
      return `${currency} ${val.toLocaleString()}`;
    }
  };
  const formattedValue = formatCurrency(project.value, project.currency);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const meta = [
    { icon: Building2, label: locale === "ar" ? "العميل" : "Client", value: project.clientName },
    { icon: Tag, label: locale === "ar" ? "الفئة" : "Category", value: project.category },
    { icon: MapPin, label: locale === "ar" ? "الموقع" : "Location", value: project.location },
    { icon: Wallet, label: locale === "ar" ? "قيمة المشروع" : "Project Value", value: formattedValue },
    { icon: Calendar, label: locale === "ar" ? "تاريخ الإنجاز" : "Completion Date", value: formatDate(project.completionDate) },
    { icon: CheckCircle2, label: locale === "ar" ? "الحالة" : "Status", value: locale === "ar" ? "منجز" : "Completed" },
  ].filter((m) => m.value);

  return (
    <div className="flex flex-col">
      {/* Hero with image overlay */}
      <section className="relative h-[60vh] min-h-[440px] w-full overflow-hidden bg-navy">
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : null}
        <div className="absolute inset-0 hero-overlay" />

        <div className="relative z-10 container mx-auto h-full px-6 flex flex-col justify-end pb-12">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            onClick={resetSelection}
            className="inline-flex w-fit items-center gap-1.5 text-sm text-white/80 hover:text-gold transition-colors mb-6"
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            {locale === "ar" ? "كل المشاريع" : "All Projects"}
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-3xl"
          >
            <Badge className="bg-gold text-gold-foreground hover:bg-gold font-semibold border-0 mb-4">
              {project.category}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-white leading-[1.1] text-balance">
              {title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/80">
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-gold" />
                {project.clientName}
              </span>
              {project.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-gold" />
                  {project.location}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Meta grid */}
      <section className="py-12 bg-muted/30 border-b border-border">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {meta.map((m, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="rounded-xl bg-card border border-border/60 p-4 h-full">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-1.5">
                    <m.icon className="h-3.5 w-3.5 text-gold" />
                    {m.label}
                  </div>
                  <div className="text-sm font-bold text-foreground leading-tight">{m.value}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="section-pad bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <FadeIn className="lg:col-span-8">
              <SectionHeading
                eyebrow={locale === "ar" ? "نظرة عامة" : "Overview"}
                title={locale === "ar" ? "تفاصيل المشروع" : "Project Details"}
                align="left"
              />
              <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
                {description.split("\n").filter(Boolean).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* Inline highlights */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  locale === "ar" ? "تنفيذ كامل للسلامة" : "Full HSE compliance",
                  locale === "ar" ? "اختبار هيدروستاتيكي" : "Hydrostatic testing",
                  locale === "ar" ? "تسليم في الموعد" : "On-time delivery",
                  locale === "ar" ? "فريق متخصص معتمد" : "Certified specialist crew",
                ].map((hl, i) => (
                  <div key={i} className="flex items-center gap-2.5 rounded-lg bg-muted/40 px-3 py-2.5">
                    <CheckCircle2 className="h-4 w-4 text-gold flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground">{hl}</span>
                  </div>
                ))}
              </div>
            </FadeIn>

            {/* CTA sidebar */}
            <FadeIn delay={0.15} className="lg:col-span-4">
              <div className="sticky top-8">
                <Card className="overflow-hidden border-border/60 bg-navy text-white p-6">
                  <Sparkles className="h-8 w-8 text-gold mb-3" />
                  <h3 className="text-xl font-bold font-display">
                    {locale === "ar" ? "هل لديك مشروع مماثل؟" : "Have a Similar Project?"}
                  </h3>
                  <p className="mt-2 text-sm text-white/70 leading-relaxed">
                    {locale === "ar"
                      ? "دع فريقنا الهندسي يقدم لك حلاً مخصصاً يناسب متطلباتك."
                      : "Let our engineering team deliver a tailored solution for your requirements."}
                  </p>
                  <Button
                    onClick={() => setView("contact")}
                    className="mt-5 w-full bg-gold text-gold-foreground hover:bg-gold/90 font-semibold h-11"
                  >
                    {t.actions.requestQuote}
                    <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
                  </Button>
                </Card>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Before/After Slider */}
      {hasBeforeAfter && (
        <section className="section-pad bg-muted/30">
          <div className="container mx-auto px-6">
            <SectionHeading
              eyebrow={t.sections.beforeAfter}
              title={locale === "ar" ? "قبل وبعد" : "Before & After"}
              subtitle={
                locale === "ar"
                  ? "اسحب لرؤية التحول الذي حققناه في هذا المشروع."
                  : "Drag to see the transformation we delivered on this project."
              }
            />
            <FadeIn delay={0.15} className="mt-10 max-w-4xl mx-auto">
              <BeforeAfterSlider
                beforeImage={project.beforeImage!}
                afterImage={project.afterImage!}
                beforeLabel={locale === "ar" ? "قبل" : "Before"}
                afterLabel={locale === "ar" ? "بعد" : "After"}
                alt={title}
              />
            </FadeIn>
          </div>
        </section>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="section-pad bg-background">
          <div className="container mx-auto px-6">
            <SectionHeading
              eyebrow={locale === "ar" ? "صور المشروع" : "Project Gallery"}
              title={locale === "ar" ? "معرض الصور" : "Image Gallery"}
              subtitle={
                locale === "ar"
                  ? "شاهد المشروع من زوايا متعددة."
                  : "See the project from multiple angles."
              }
            />
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gallery.map((img, i) => (
                <FadeIn key={i} delay={i * 0.05}>
                  <button
                    onClick={() => setLightboxImage(img)}
                    className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted cursor-zoom-in"
                  >
                    <Image
                      src={img}
                      alt={`${title} — image ${i + 1}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary">
                        <Maximize2 className="h-4 w-4" />
                      </div>
                    </div>
                  </button>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Services */}
      {services.length > 0 && (
        <section className="section-pad bg-muted/30">
          <div className="container mx-auto px-6">
            <SectionHeading
              eyebrow={locale === "ar" ? "الخدمات المرتبطة" : "Related Services"}
              title={locale === "ar" ? "كيف ساعدنا" : "How We Helped"}
              subtitle={
                locale === "ar"
                  ? "الخدمات التي قدمناها في هذا المشروع."
                  : "The services we delivered on this project."
              }
            />
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((svc, i) => (
                <ServiceMiniCard key={svc.id} service={svc} index={i} onOpen={() => openService(svc.slug)} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CTASection />

      {/* Lightbox Dialog */}
      <Dialog open={!!lightboxImage} onOpenChange={(open) => !open && setLightboxImage(null)}>
        <DialogContent
          showCloseButton={false}
          className="max-w-5xl bg-black/95 border-white/10 p-0 overflow-hidden"
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          {lightboxImage && (
            <div className="relative w-full aspect-[16/10]">
              <Image
                src={lightboxImage}
                alt={title}
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-contain"
              />
            </div>
          )}
          <DialogCloseX />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DialogCloseX() {
  return (
    <button
      aria-label="Close"
      className="absolute top-3 end-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
    >
      <X className="h-5 w-5" />
    </button>
  );
}

function ServiceMiniCard({
  service,
  index,
  onOpen,
}: {
  service: ServiceDTO;
  index: number;
  onOpen: () => void;
}) {
  const { locale, pick } = useLocale();
  const title = pick(service.title, service.titleAr) ?? service.title;
  const excerpt = pick(service.excerpt, service.excerptAr);

  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onClick={onOpen}
      className="group text-start w-full"
    >
      <Card className="h-full overflow-hidden border-border/60 bg-card p-6 hover:border-gold/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-110">
          <Icon name={service.icon} className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        {excerpt && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{excerpt}</p>
        )}
        <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gold">
          {locale === "ar" ? "اعرف المزيد" : "Learn More"}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </div>
      </Card>
    </motion.button>
  );
}

// ============================================================================
// Page Hero — shared hero for the projects list page.
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
            {locale === "ar" ? "مشروعك القادم يبدأ هنا" : "Your Next Project Starts Here"}
          </h2>
          <p className="mt-4 text-white/70 text-base md:text-lg leading-relaxed text-balance">
            {locale === "ar"
              ? "انضم إلى عملائنا الراضين واحصل على حل هندسي مخصص لمشروعك."
              : "Join our satisfied clients and get an engineered solution tailored to your project."}
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
              onClick={() => setView("services")}
              className="border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white h-12 px-8 text-base"
            >
              {t.actions.exploreServices}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
