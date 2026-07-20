// ============================================================================
// About View — Company overview with history, mission/vision/values,
// certifications, leadership team, and CTA.
// ============================================================================

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowRight, Target, Eye, ShieldCheck, Award, CheckCircle2,
  Linkedin, Mail, Phone, Sparkles, ChevronLeft, Building2,
  Factory, HardHat, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  SectionHeading, AnimatedCounter, FadeIn, GoldDivider,
} from "@/components/site/primitives";
import { useTeam, useSiteData } from "@/lib/hooks/use-queries";
import { useAppStore } from "@/lib/store";
import { useLocale } from "@/lib/hooks/use-locale";
import type { TeamMemberDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AboutView() {
  return (
    <div className="flex flex-col">
      <PageHero />
      <CompanyHistory />
      <MissionVisionValues />
      <CompanyStrength />
      <LeadershipTeam />
      <CTASection />
    </div>
  );
}

// ============================================================================
// Page Hero — navy hero with breadcrumb + tagline.
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
          <span className="text-gold font-medium">{t.nav.about}</span>
        </motion.div>

        <SectionHeading
          eyebrow={locale === "ar" ? "تأسست عام 1995" : "Established 1995"}
          title={locale === "ar" ? "من نحن — مهاكسا" : "About MHASA"}
          subtitle={
            locale === "ar"
              ? "ثلاثة عقود من التميز الهندسي في تركيب الأنابيب الصناعية والحلول المتخصصة لخدمة أكبر مشاريع المملكة."
              : "Three decades of engineering excellence in industrial pipe installation and specialized solutions for the Kingdom's largest projects."
          }
          light
          align="left"
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <Button
            onClick={() => setView("contact")}
            className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold"
          >
            {t.actions.requestQuote}
            <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setView("projects")}
            className="border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white"
          >
            {t.actions.viewProjects}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// Company History — vertical timeline with milestones.
// ============================================================================
const milestones = [
  {
    year: "1995",
    titleEn: "Company Founded",
    titleAr: "تأسيس الشركة",
    descEn:
      "Mohd H. Al Marhoon establishes the firm in the Eastern Province, focusing on pipe installation for industrial clients.",
    descAr:
      "أسس محمد حمد المرحون الشركة في المنطقة الشرقية، متخصصةً في تركيب الأنابيب للعملاء الصناعيين.",
  },
  {
    year: "2003",
    titleEn: "Major Expansion",
    titleAr: "توسع كبير",
    descEn:
      "Expanded operations to serve Jubail and Yanbu industrial cities, growing the workforce to over 150 skilled technicians.",
    descAr:
      "توسعت العمليات لخدمة مدينتي الجبيل وينبع الصناعيتين، ونمت القوة العاملة إلى أكثر من 150 فنياً ماهراً.",
  },
  {
    year: "2012",
    titleEn: "ISO 45001 Certification",
    titleAr: "شهادة ISO 45001",
    descEn:
      "Achieved ISO 45001 Occupational Health & Safety certification — formalizing our zero-incident culture across all sites.",
    descAr:
      "حصلنا على شهادة ISO 45001 للصحة والسلامة المهنية — لتعزيز ثقافة الحوادث الصفرية في جميع المواقع.",
  },
  {
    year: "2017",
    titleEn: "Saudi Aramco Approved Vendor",
    titleAr: "مقاول معتمد لدى أرامكو",
    descEn:
      "Earned approved-contractor status with Saudi Aramco, SABIC, SWCC, and Sadara — opening doors to flagship projects.",
    descAr:
      "حصلنا على صفة المقاول المعتمد لدى أرامكو السعودية وسابك وسوادا وسدرة — لفتح أبواب المشاريع الرئيسية.",
  },
  {
    year: "Today",
    titleEn: "450+ Projects Delivered",
    titleAr: "أكثر من 450 مشروعاً منجزاً",
    descEn:
      "A trusted partner for the Kingdom's largest industrial operators, with a proven record of on-time delivery and uncompromising quality.",
    descAr:
      "شريك موثوق لأكبر مشغلي المملكة الصناعيين، بسجل مثبت من التسليم في الوقت المحدد وجودة لا تقبل المساومة.",
  },
];

function CompanyHistory() {
  const { locale } = useLocale();
  const { data: siteData } = useSiteData();
  const settings = siteData?.settings;

  return (
    <section className="section-pad bg-background">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Image column */}
          <FadeIn className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl sticky top-8">
              <Image
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&q=80"
                alt="MHASA company history"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 start-6 end-6 text-white">
                <div className="text-4xl font-bold font-display">
                  <AnimatedCounter value={30} suffix="+" />
                </div>
                <div className="text-sm text-white/80 uppercase tracking-wider mt-1">
                  {locale === "ar" ? "عاماً من الخبرة" : "Years of Excellence"}
                </div>
              </div>
            </div>
            {/* Gold accent */}
            <div className="absolute -top-4 -end-4 h-24 w-24 rounded-tr-2xl border-t-4 border-e-4 border-gold -z-10" />
          </FadeIn>

          {/* Timeline column */}
          <div className="lg:col-span-7">
            <SectionHeading
              eyebrow={locale === "ar" ? "تاريخنا" : "Our Journey"}
              title={locale === "ar" ? "من البداية حتى الريادة" : "From Founding to Leadership"}
              align="left"
              gradient
            />
            <FadeIn delay={0.15} className="mt-4 text-muted-foreground leading-relaxed">
              {locale === "ar"
                ? "منذ تأسيسنا عام 1995، نمت مهاكسا من مقاول محلي إلى شركة رائدة في تركيب الأنابيب الصناعية في المملكة العربية السعودية."
                : "Since our founding in 1995, MHASA has grown from a local contractor into a leading industrial pipe installation company in the Kingdom of Saudi Arabia."}
            </FadeIn>

            <div className="mt-10 relative">
              {/* Vertical line */}
              <div className="absolute top-2 bottom-2 start-4 md:start-5 w-px bg-gradient-to-b from-gold via-primary/40 to-transparent" />

              {milestones.map((m, i) => (
                <FadeIn key={m.year} delay={i * 0.08} className="relative ps-12 md:ps-16 pb-8 last:pb-0">
                  {/* Dot */}
                  <div className="absolute start-0 top-1.5 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-gold text-gold-foreground font-bold text-xs shadow-lg shadow-gold/30 ring-4 ring-background">
                    {i + 1}
                  </div>
                  <Card className="p-5 border-border/60 bg-card hover:border-gold/40 hover:shadow-md transition-all">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="text-2xl font-bold font-display text-primary">{m.year}</span>
                      <h3 className="text-lg font-bold text-foreground">
                        {locale === "ar" ? m.titleAr : m.titleEn}
                      </h3>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {locale === "ar" ? m.descAr : m.descEn}
                    </p>
                  </Card>
                </FadeIn>
              ))}
            </div>

            {settings?.tagline && (
              <FadeIn delay={0.3} className="mt-8 rounded-xl bg-muted/40 p-5 border-s-4 border-gold">
                <p className="text-sm italic text-foreground/80">
                  &ldquo;{locale === "ar" ? (settings.taglineAr ?? settings.tagline) : settings.tagline}&rdquo;
                </p>
              </FadeIn>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Mission, Vision, Values — 3-column card layout.
// ============================================================================
function MissionVisionValues() {
  const { t, locale } = useLocale();

  const items = [
    {
      icon: Target,
      eyebrow: t.sections.mission,
      titleEn: "Deliver Engineered Excellence",
      titleAr: "نقدم التميز الهندسي",
      descEn:
        "To deliver pipe installation and fiberglass engineering solutions of the highest quality — on schedule, on budget, and with uncompromising safety for every client across the Kingdom.",
      descAr:
        "تقديم حلول تركيب الأنابيب والهندسة فيبرجلاس بأعلى جودة — في الموعد والميزانية، مع سلامة لا تقبل المساومة لكل عميل في المملكة.",
    },
    {
      icon: Eye,
      eyebrow: t.sections.vision,
      titleEn: "The Kingdom's Preferred Contractor",
      titleAr: "المقاول المفضل للمملكة",
      descEn:
        "To be Saudi Arabia's most trusted contractor for industrial piping — recognized for technical leadership, safety culture, and lasting partnerships with the Kingdom's leading operators.",
      descAr:
        "أن نكون المقاول السعودي الأكثر ثقة في مجال الأنابيب الصناعية — معروفين بالقيادة التقنية وثقافة السلامة والشراكات الدائمة مع كبرى شركات المملكة.",
    },
    {
      icon: ShieldCheck,
      eyebrow: t.sections.values,
      titleEn: "Integrity · Safety · Quality",
      titleAr: "النزاهة · السلامة · الجودة",
      descEn:
        "We operate with absolute integrity, place safety above all else, and pursue quality in every weld, every joint, and every meter of pipe we install — without exception.",
      descAr:
        "نعمل بنزاهة مطلقة، ونضع السلامة فوق كل اعتبار، ونسعى للجودة في كل لحام وكل وصلة وكل متر من الأنابيب التي نركبها — دون استثناء.",
    },
  ];

  return (
    <section className="section-pad bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-1/3 end-0 h-80 w-80 rounded-full bg-gold blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative">
        <SectionHeading
          eyebrow={locale === "ar" ? "مبادئنا" : "What Drives Us"}
          title={locale === "ar" ? "المهمة والرؤية والقيم" : "Mission, Vision & Values"}
          subtitle={
            locale === "ar"
              ? "أساس راسخ يوجه كل قرار نتخذه وكل مشروع ننفذه."
              : "The foundation that guides every decision we make and every project we deliver."
          }
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <Card className="group relative h-full overflow-hidden border-border/60 bg-card p-7 hover:border-gold/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
                {/* Top accent */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-gold to-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-110">
                  <item.icon className="h-7 w-7" />
                </div>

                <div className="mt-5 text-xs font-semibold uppercase tracking-widest text-gold">
                  {item.eyebrow}
                </div>
                <h3 className="mt-2 text-xl font-bold text-foreground">
                  {locale === "ar" ? item.titleAr : item.titleEn}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {locale === "ar" ? item.descAr : item.descEn}
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
// Company Strength — certifications and approvals.
// ============================================================================
function CompanyStrength() {
  const { t, locale } = useLocale();

  const certifications = [
    {
      icon: ShieldCheck,
      titleEn: "ISO 45001:2018",
      titleAr: "ISO 45001:2018",
      descEn: "Occupational Health & Safety Management",
      descAr: "إدارة الصحة والسلامة المهنية",
    },
    {
      icon: Award,
      titleEn: "Saudi Aramco Approved",
      titleAr: "معتمد لدى أرامكو",
      descEn: "SAMD registered vendor",
      descAr: "موريد مسجل في SAMD",
    },
    {
      icon: Factory,
      titleEn: "SABIC Approved",
      titleAr: "معتمد لدى سابك",
      descEn: "Approved contractor for petrochemicals",
      descAr: "مقاول معتمد للبتروكيماويات",
    },
    {
      icon: Building2,
      titleEn: "SWCC & Sadara",
      titleAr: "سوادا وسدرة",
      descEn: "Desalination & chemicals specialists",
      descAr: "متخصصون في التحلية والكيماويات",
    },
    {
      icon: HardHat,
      titleEn: "ASME B31.3",
      titleAr: "ASME B31.3",
      descEn: "Process piping code compliance",
      descAr: "الامتثال لكود أنابيب العمليات",
    },
    {
      icon: Zap,
      titleEn: "API 15HR",
      titleAr: "API 15HR",
      descEn: "High-pressure GRE pipe specification",
      descAr: "مواصفات أنابيب GRE عالية الضغط",
    },
  ];

  return (
    <section className="section-pad bg-navy text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
        <div className="absolute top-1/4 start-1/4 h-72 w-72 rounded-full bg-gold blur-3xl" />
        <div className="absolute bottom-0 end-1/4 h-72 w-72 rounded-full bg-primary blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative">
        <SectionHeading
          eyebrow={t.sections.companyStrength}
          title={locale === "ar" ? "اعتمادات وشهادات معترف بها" : "Certified, Approved & Recognized"}
          subtitle={
            locale === "ar"
              ? "حصلنا على ثقة أكبر مشغلي المملكة من خلال الاعتمادات والشهادات الصارمة."
              : "We've earned the trust of the Kingdom's largest operators through rigorous certifications and approvals."
          }
          light
        />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {certifications.map((c, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div className="group flex items-start gap-4 rounded-xl glass-card border-white/10 p-5 hover:border-gold/40 transition-all">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold group-hover:bg-gold group-hover:text-gold-foreground transition-colors">
                  <c.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {locale === "ar" ? c.titleAr : c.titleEn}
                  </h3>
                  <p className="mt-1 text-xs text-white/70 leading-relaxed">
                    {locale === "ar" ? c.descAr : c.descEn}
                  </p>
                </div>
                <CheckCircle2 className="ms-auto h-4 w-4 text-gold/60 flex-shrink-0" />
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Leadership Team — grid of team member cards.
// ============================================================================
function LeadershipTeam() {
  const { t, locale, pick } = useLocale();
  const { data: team, isLoading } = useTeam();
  const members = team ?? [];

  return (
    <section className="section-pad bg-background">
      <div className="container mx-auto px-6">
        <SectionHeading
          eyebrow={t.sections.meetTeam}
          title={locale === "ar" ? "القيادة التي تقود الطريق" : "The Leadership Behind MHASA"}
          subtitle={
            locale === "ar"
              ? "فريق من القادة ذوي الخبرة الذين يوجّهون رؤيتنا ويعملون على تحقيقها."
              : "A team of seasoned leaders who steer our vision and bring it to life."
          }
        />

        {isLoading ? (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-muted/40 animate-pulse aspect-[3/4]" />
            ))}
          </div>
        ) : members.length === 0 ? null : (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {members.map((member, i) => (
              <TeamMemberCard key={member.id} member={member} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function TeamMemberCard({ member, index }: { member: TeamMemberDTO; index: number }) {
  const { locale, pick } = useLocale();
  const name = pick(member.name, member.nameAr) ?? member.name;
  const designation = pick(member.designation, member.designationAr) ?? member.designation;
  const bio = pick(member.bio, member.bioAr);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Card className="group relative h-full overflow-hidden border-border/60 bg-card p-0 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1">
        {/* Photo */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          {member.imageUrl ? (
            <Image
              src={member.imageUrl}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-primary/10 text-primary/40">
              <Building2 className="h-12 w-12" />
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent opacity-70 group-hover:opacity-95 transition-opacity" />

          {/* Social icons — appear on hover */}
          <div className="absolute bottom-3 end-3 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            {member.linkedinUrl && (
              <a
                href={member.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${name} LinkedIn`}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary hover:bg-gold hover:text-gold-foreground transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                aria-label={`${name} email`}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary hover:bg-gold hover:text-gold-foreground transition-colors"
              >
                <Mail className="h-4 w-4" />
              </a>
            )}
            {member.phone && (
              <a
                href={`tel:${member.phone}`}
                aria-label={`${name} phone`}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary hover:bg-gold hover:text-gold-foreground transition-colors"
              >
                <Phone className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-foreground">{name}</h3>
          <div className="mt-1 text-sm font-medium text-gold">{designation}</div>
          {bio && (
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-3">{bio}</p>
          )}
        </div>

        {/* Top accent */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold via-primary to-gold opacity-0 group-hover:opacity-100 transition-opacity" />
      </Card>
    </motion.div>
  );
}

// ============================================================================
// CTA Section — final call to action.
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
            {locale === "ar" ? "هل أنت مستعد للعمل معنا؟" : "Ready to Work With Us?"}
          </h2>
          <p className="mt-4 text-white/70 text-base md:text-lg leading-relaxed text-balance">
            {locale === "ar"
              ? "شراكة مع فريق هندسي ملتزم بالجودة والسلامة والتسليم في الموعد. احصل على عرض سعر مخصص خلال 24 ساعة."
              : "Partner with an engineering team committed to quality, safety, and on-time delivery. Get a tailored quotation within 24 hours."}
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
              <Sparkles className="me-2 h-4 w-4 text-gold" />
              {t.actions.exploreServices}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
