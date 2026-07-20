// ============================================================================
// Home View — the landing page with all key sections.
// Hero → Trust bar → About preview → Services → Why Us → Stats →
// Featured Projects → Clients → Testimonials → CTA.
// ============================================================================

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Award,
  Clock, Users, CheckCircle2, Sparkles, Phone, MapPin, TrendingUp,
  Target, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeading, AnimatedCounter, FadeIn, GoldDivider } from "@/components/site/primitives";
import { ServiceCard, ProjectCard, TestimonialCard } from "@/components/site/cards";
import { Icon } from "@/components/site/icon";
import { useSiteData, useProjects, useServices } from "@/lib/hooks/use-queries";
import { useAppStore } from "@/lib/store";
import { useLocale } from "@/lib/hooks/use-locale";
import { cn } from "@/lib/utils";

export function HomeView() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <TrustBar />
      <AboutPreview />
      <ServicesSection />
      <WhyChooseUs />
      <StatsSection />
      <FeaturedProjects />
      <ClientsMarquee />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}

// ============================================================================
// Hero — full-screen carousel with animated text and dual CTA.
// ============================================================================
function HeroSection() {
  const { data: siteData } = useSiteData();
  const setView = useAppStore((s) => s.setView);
  const { t, locale, pick } = useLocale();
  const heroes = siteData?.heroes ?? [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (heroes.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % heroes.length), 6000);
    return () => clearInterval(timer);
  }, [heroes.length]);

  if (heroes.length === 0) {
    return (
      <section className="relative flex min-h-[70vh] items-center justify-center bg-navy">
        <div className="text-center text-white p-8">
          <h1 className="text-4xl md:text-6xl font-bold font-display">{t.common.tagline}</h1>
        </div>
      </section>
    );
  }

  const current = heroes[index];

  return (
    <section className="relative h-[88vh] min-h-[600px] max-h-[860px] w-full overflow-hidden bg-navy">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          {current.imageUrl && (
            <Image
              src={current.imageUrl}
              alt={current.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 hero-overlay" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 container mx-auto flex h-full items-center px-6">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4 text-gold" />
            <span className="text-xs font-semibold uppercase tracking-widest text-gold">
              {t.common.established} · 1995
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="mt-6 text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.05] tracking-tight font-display text-balance"
          >
            {pick(current.title, current.titleAr) ?? current.title}
          </motion.h1>

          {(pick(current.subtitle, current.subtitleAr) ?? current.subtitle) && (
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.7 }}
              className="mt-5 max-w-xl text-base md:text-lg text-white/80 leading-relaxed"
            >
              {pick(current.subtitle, current.subtitleAr) ?? current.subtitle}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button
              size="lg"
              onClick={() => setView((current.ctaLink as "services" | "projects" | "contact") ?? "services")}
              className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold px-7 h-12 text-base shadow-xl shadow-gold/20"
            >
              {pick(current.ctaText, current.ctaTextAr) ?? current.ctaText ?? t.actions.exploreServices}
              <ArrowRight className="ms-2 h-5 w-5 rtl:rotate-180" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setView("contact")}
              className="border-white/30 bg-white/5 text-white backdrop-blur-sm hover:bg-white/15 hover:text-white h-12 px-7 text-base"
            >
              {t.actions.getInTouch}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Slide controls */}
      {heroes.length > 1 && (
        <>
          <div className="absolute bottom-8 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 flex items-center gap-2 z-20">
            {heroes.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Slide ${i + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === index ? "w-8 bg-gold" : "w-2 bg-white/40 hover:bg-white/70"
                )}
              />
            ))}
          </div>
          <button
            onClick={() => setIndex((i) => (i - 1 + heroes.length) % heroes.length)}
            className="absolute start-4 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
          </button>
          <button
            onClick={() => setIndex((i) => (i + 1) % heroes.length)}
            className="absolute end-4 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5 rtl:rotate-180" />
          </button>
        </>
      )}

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 end-6 z-20 hidden md:flex flex-col items-center gap-2 text-white/60"
      >
        <span className="text-xs uppercase tracking-widest [writing-mode:vertical-rl] rotate-180">
          Scroll
        </span>
        <span className="h-12 w-px bg-gradient-to-b from-white/60 to-transparent" />
      </motion.div>
    </section>
  );
}

// ============================================================================
// Trust Bar — quick credibility indicators below hero.
// ============================================================================
function TrustBar() {
  const items = [
    { icon: ShieldCheck, label: "ISO 45001", sub: "Safety Certified" },
    { icon: Award, label: "30+ Years", sub: "Industry Experience" },
    { icon: CheckCircle2, label: "450+ Projects", sub: "Successfully Delivered" },
    { icon: Users, label: "85+ Clients", sub: "Across the Kingdom" },
  ];
  return (
    <section className="border-b border-border bg-card">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border rtl:divide-x-reverse">
          {items.map((item, i) => (
            <FadeIn key={i} delay={i * 0.1} className="flex items-center gap-3 p-5 lg:p-6">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-foreground text-base lg:text-lg">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.sub}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// About Preview — company intro with image + key points + CTA.
// ============================================================================
function AboutPreview() {
  const setView = useAppStore((s) => s.setView);
  const { t, locale } = useLocale();

  return (
    <section className="section-pad bg-background">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image side */}
          <FadeIn className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=900&q=80"
                alt="MHASA pipe installation project"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/40 to-transparent" />
            </div>
            {/* Floating stat card */}
            <motion.div
              initial={{ opacity: 0, y: 20, x: 20 }}
              whileInView={{ opacity: 1, y: 0, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="absolute -bottom-6 -end-4 lg:-end-8 rounded-2xl bg-navy p-5 shadow-xl text-white"
            >
              <div className="text-3xl font-bold font-display">
                <AnimatedCounter value={1200} suffix="+" />
              </div>
              <div className="text-xs text-white/70 uppercase tracking-wider mt-1">
                {locale === "ar" ? "كم أنابيب مركبة" : "Km of Pipe Installed"}
              </div>
            </motion.div>
            {/* Decorative gold accent */}
            <div className="absolute -top-4 -start-4 h-24 w-24 rounded-tl-2xl border-t-4 border-s-4 border-gold -z-10" />
          </FadeIn>

          {/* Content side */}
          <div>
            <SectionHeading
              eyebrow={locale === "ar" ? "من نحن" : "About MHASA"}
              title={locale === "ar" ? "رواد تركيب الأنابيب الصناعية في المملكة" : "Saudi Arabia's Trusted Pipe Installation Specialists"}
              align="left"
            />
            <FadeIn delay={0.2} className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                {locale === "ar"
                  ? "تأسست مؤسسة محمد بن حمد المرحون للمقاولات عام 1995، ونمت لتصبح من أبرز المقاولين المتخصصين في تركيب أنابيب RTR وGRP وGRE وFRP في المنطقة الشرقية من المملكة العربية السعودية."
                  : "Established in 1995, Mohd H. Al Marhoon Cont. Est. (MHASA) has grown into one of the Eastern Province's most respected contractors specializing in RTR, GRP, GRE, and FRP pipe installation for the Kingdom's most demanding industrial sectors."}
              </p>
              <p>
                {locale === "ar"
                  ? "نخدم عملاء من القطاعات الحكومية والنفط والغاز والمقاولين EPC والشركات الصناعية، مع سجل حافل من التسليم في الوقت المحدد وبأعلى معايير الجودة والسلامة."
                  : "We serve government organizations, oil & gas operators, EPC contractors, and industrial companies — with a proven track record of on-time delivery and uncompromising quality and safety standards."}
              </p>
            </FadeIn>

            <FadeIn delay={0.3} className="mt-6 grid grid-cols-2 gap-3">
              {[
                { icon: Target, label: locale === "ar" ? "جودة معتمدة" : "Certified Quality" },
                { icon: ShieldCheck, label: locale === "ar" ? "سلامة أولاً" : "Safety First" },
                { icon: Clock, label: locale === "ar" ? "تسليم في الموعد" : "On-Time Delivery" },
                { icon: TrendingUp, label: locale === "ar" ? "خبرة موثقة" : "Proven Expertise" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2.5">
                  <item.icon className="h-4 w-4 text-gold flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </div>
              ))}
            </FadeIn>

            <FadeIn delay={0.4} className="mt-8">
              <Button
                onClick={() => setView("about")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              >
                {locale === "ar" ? "تعرّف علينا أكثر" : "Learn More About Us"}
                <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
              </Button>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Services Overview — grid of service cards.
// ============================================================================
function ServicesSection() {
  const { data: siteData } = useSiteData();
  const services = siteData?.services ?? [];
  const setView = useAppStore((s) => s.setView);
  const { t, locale } = useLocale();

  return (
    <section className="section-pad bg-muted/30 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 end-0 h-96 w-96 rounded-full bg-primary blur-3xl" />
        <div className="absolute bottom-0 start-0 h-96 w-96 rounded-full bg-gold blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative">
        <SectionHeading
          eyebrow={t.nav.services}
          title={locale === "ar" ? "حلول الأنابيب الشاملة" : "Comprehensive Piping Solutions"}
          subtitle={locale === "ar"
            ? "من تركيب الأنابيب كبيرة القطر إلى أعمال الألياف الزجاجية المخصصة — نقدم حلولاً هندسية متكاملة."
            : "From large-diameter pipe installation to custom fiberglass fabrication — we deliver end-to-end engineered solutions."}
        />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc, i) => (
            <ServiceCard key={svc.id} service={svc} index={i} />
          ))}
        </div>

        <FadeIn delay={0.3} className="mt-10 text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setView("services")}
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold"
          >
            {t.actions.viewAll} {t.nav.services}
            <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}

// ============================================================================
// Why Choose Us — feature highlights with icons.
// ============================================================================
function WhyChooseUs() {
  const { t, locale } = useLocale();
  const features = [
    {
      icon: ShieldCheck,
      title: locale === "ar" ? "ثقافة الحوادث الصفرية" : "Zero-Incident Culture",
      desc: locale === "ar"
        ? "نظام إدارة سلامة متكامل متوافق مع ISO 45001 ومعايير أرامكو السعودية، مع ضباط سلامة بدوام كامل في كل موقع."
        : "Integrated HSE management aligned to ISO 45001 and Saudi Aramco standards, with full-time safety officers on every site.",
    },
    {
      icon: Award,
      title: locale === "ar" ? "خبرة معتمدة" : "Approved Expertise",
      desc: locale === "ar"
        ? "مقاول معتمد لدى أرامكو السعودية وسابك وسوادا وسدرة. سجل حافل مع أكبر مشغلي المملكة."
        : "Approved contractor with Saudi Aramco, SABIC, SWCC, and Sadara. A proven record with the Kingdom's largest operators.",
    },
    {
      icon: Zap,
      title: locale === "ar" ? "قدرات هندسية" : "Engineering Capability",
      desc: locale === "ar"
        ? "فريق هندسي داخلي للتصميم، التحليل الهيدروليكي، واختيار المواد — مع قدرات تصنيع FRP في موقعنا."
        : "In-house engineering team for design, hydraulic analysis, and material selection — with on-site FRP fabrication capabilities.",
    },
    {
      icon: Clock,
      title: locale === "ar" ? "تسليم مضمون" : "Guaranteed Delivery",
      desc: locale === "ar"
        ? "سجل مثبت من تسليم المشاريع في الموعد أو قبله، مع إدارة مشاريع معتمدة PMP وجدولة دقيقة."
        : "A proven record of on-time or ahead-of-schedule delivery, with PMP-certified project management and precise scheduling.",
    },
  ];

  return (
    <section className="section-pad bg-navy text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 start-1/4 h-64 w-64 rounded-full bg-gold blur-3xl" />
      </div>
      <div className="container mx-auto px-6 relative">
        <SectionHeading
          eyebrow={t.sections.whyChooseUs}
          title={locale === "ar" ? "لماذا تختار مهاكسا" : "Why Leading Operators Choose MHASA"}
          subtitle={locale === "ar"
            ? "نجمع بين الخبرة التقنية العميقة والالتزام الراسخ بالسلامة والجودة."
            : "We combine deep technical expertise with an uncompromising commitment to safety and quality."}
          light
        />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <Card className="h-full glass-card border-white/10 p-6 hover:border-gold/40 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15 text-gold mb-4">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{f.desc}</p>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Stats Section — animated counters on gold gradient.
// ============================================================================
function StatsSection() {
  const { data: siteData } = useSiteData();
  const stats = siteData?.stats ?? [];
  const { t, locale } = useLocale();

  if (stats.length === 0) return null;

  return (
    <section className="bg-gradient-to-br from-gold via-gold to-amber-600 py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <FadeIn key={stat.id} delay={i * 0.1} className="text-center">
              <div className="flex justify-center mb-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy/10 text-navy">
                  <Icon name={stat.icon} fallback={TrendingUp} className="h-7 w-7" />
                </div>
              </div>
              <div className="text-4xl md:text-5xl font-bold text-navy font-display">
                <AnimatedCounter value={stat.value} suffix={stat.suffix ?? ""} />
              </div>
              <div className="mt-2 text-sm font-medium text-navy/80 uppercase tracking-wider">
                {locale === "ar" ? (stat.labelAr ?? stat.label) : stat.label}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Featured Projects — carousel/grid of featured project cards.
// ============================================================================
function FeaturedProjects() {
  const { data } = useProjects({ featured: true, limit: 6 });
  const setView = useAppStore((s) => s.setView);
  const { t, locale } = useLocale();
  const projects = data ?? [];

  if (projects.length === 0) return null;

  return (
    <section className="section-pad bg-background">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <SectionHeading
            eyebrow={t.sections.featuredProjects}
            title={locale === "ar" ? "مشاريع نفخر بها" : "Projects We're Proud Of"}
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
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Clients Marquee — infinite scrolling client names.
// ============================================================================
function ClientsMarquee() {
  const { data: siteData } = useSiteData();
  const clients = siteData?.clients ?? [];
  const { t, locale } = useLocale();

  if (clients.length === 0) return null;

  const doubled = [...clients, ...clients];

  return (
    <section className="py-14 bg-muted/30 border-y border-border">
      <div className="container mx-auto px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-8">
          {locale === "ar" ? "موثوق به من قبل قادة الصناعة" : "Trusted by Industry Leaders"}
        </p>
      </div>
      <div className="relative overflow-hidden">
        <div className="marquee-track flex items-center gap-12 w-max">
          {doubled.map((client, i) => (
            <div
              key={`${client.id}-${i}`}
              className="flex flex-col items-center gap-1 px-6 flex-shrink-0"
            >
              <div className="flex h-14 items-center justify-center">
                {client.logoUrl ? (
                  <Image src={client.logoUrl} alt={client.name} width={140} height={56} className="max-h-14 w-auto opacity-60 hover:opacity-100 transition-opacity" />
                ) : (
                  <span className="text-xl font-bold text-foreground/40 hover:text-foreground/70 transition-colors font-display">
                    {locale === "ar" ? (client.nameAr ?? client.name) : client.name}
                  </span>
                )}
              </div>
              {client.industry && (
                <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">{client.industry}</span>
              )}
            </div>
          ))}
        </div>
        {/* Fade edges */}
        <div className="absolute inset-y-0 start-0 w-24 bg-gradient-to-r from-muted/30 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 end-0 w-24 bg-gradient-to-l from-muted/30 to-transparent pointer-events-none" />
      </div>
    </section>
  );
}

// ============================================================================
// Testimonials — client quotes.
// ============================================================================
function TestimonialsSection() {
  const { data: siteData } = useSiteData();
  const testimonials = siteData?.testimonials ?? [];
  const { t, locale } = useLocale();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || testimonials.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, [paused, testimonials.length]);

  if (testimonials.length === 0) return null;

  return (
    <section className="section-pad bg-muted/30">
      <div className="container mx-auto px-6">
        <SectionHeading
          eyebrow={locale === "ar" ? "آراء العملاء" : "Client Testimonials"}
          title={locale === "ar" ? "ماذا يقول شركاؤنا" : "What Our Partners Say"}
          subtitle={locale === "ar"
            ? "تقييمات حقيقية من أكبر مشغلي القطاع الصناعي في المملكة."
            : "Real feedback from the Kingdom's leading industrial operators."}
        />

        {testimonials.length === 1 ? (
          <div className="mt-12 max-w-2xl mx-auto">
            <TestimonialCard testimonial={testimonials[0]} index={0} />
          </div>
        ) : (
          <div
            className="mt-12 max-w-4xl mx-auto"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Carousel viewport */}
            <div className="relative overflow-hidden">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <TestimonialCard testimonial={testimonials[index]} index={0} />
              </motion.div>
            </div>

            {/* Controls */}
            <div className="mt-6 flex items-center justify-center gap-3">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Testimonial ${i + 1}`}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === index ? "w-8 bg-gold" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  )}
                />
              ))}
            </div>

            {/* Counter */}
            <div className="mt-3 text-center text-xs text-muted-foreground">
              {index + 1} / {testimonials.length}
              {paused && <span className="ms-2 opacity-60">· {locale === "ar" ? "متوقف" : "paused"}</span>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================================
// CTA Section — final call to action.
// ============================================================================
function CTASection() {
  const setView = useAppStore((s) => s.setView);
  const { t, locale } = useLocale();
  const { data: siteData } = useSiteData();
  const settings = siteData?.settings;

  return (
    <section className="relative py-20 overflow-hidden bg-navy">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 end-0 h-96 w-96 rounded-full bg-gold blur-3xl" />
        <div className="absolute bottom-0 start-0 h-96 w-96 rounded-full bg-primary blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative">
        <div className="mx-auto max-w-3xl text-center">
          <GoldDivider className="mb-6" />
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-display text-balance">
            {t.sections.readyToStart}
          </h2>
          <p className="mt-4 text-white/70 text-base md:text-lg leading-relaxed text-balance">
            {t.sections.ctaSubtitle}
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
            {settings?.phonePrimary && (
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white h-12 px-8 text-base"
              >
                <a href={`tel:${settings.phonePrimary}`}>
                  <Phone className="me-2 h-4 w-4" />
                  {settings.phonePrimary}
                </a>
              </Button>
            )}
          </div>

          {settings?.address && (
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-white/60">
              <MapPin className="h-4 w-4 text-gold" />
              {pick(settings.address, settings.addressAr) ?? settings.address}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
