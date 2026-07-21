// ============================================================================
// Careers View — list mode (perks + department filter + job cards) and
// detail mode (job meta + description + requirements + application form).
// ============================================================================

"use client";

import { useState, useMemo, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, ChevronLeft, MapPin, Briefcase, Clock, Wallet,
  CheckCircle2, Sparkles, Building2, TrendingUp, ShieldCheck,
  Heart, FileText, Upload, Loader2, Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  SectionHeading, FadeIn, GoldDivider,
} from "@/components/site/primitives";
import { useJobs, useJob, useJobApplication } from "@/lib/hooks/use-queries";
import { useLocale } from "@/lib/hooks/use-locale";
import { navigateToView, navigateToJob, navigateBack } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CareersView() {
  return <CareersList />;
}

// ============================================================================
// List Mode — hero + perks + department filter + job cards.
// ============================================================================
function CareersList() {
  const { t, locale } = useLocale();
  const [department, setDepartment] = useState<string>("all");

  const { data: allJobs, isLoading: allLoading } = useJobs();
  const { data: filtered } = useJobs({ department });
  const jobs = department === "all" ? (allJobs ?? []) : (filtered ?? []);

  const departments = useMemo(() => {
    if (!allJobs) return [];
    const uniq = Array.from(new Set(allJobs.map((j) => j.department).filter(Boolean)));
    return uniq.sort();
  }, [allJobs]);

  return (
    <div className="flex flex-col">
      <PageHero
        eyebrow={t.nav.careers}
        title={locale === "ar" ? "ابنِ مستقبلك معنا" : "Build Your Future With Us"}
        subtitle={
          locale === "ar"
            ? "انضم إلى فريق هندسي رائد يضع السلامة أولاً ويُسلِّم أبرز مشاريع المملكة الصناعية."
            : "Join a leading engineering team that puts safety first and delivers the Kingdom's most prominent industrial projects."
        }
        breadcrumb={t.nav.careers}
      />

      {/* Why join MHASA — perks */}
      <WhyJoinSection />

      {/* Open positions */}
      <section className="section-pad bg-background">
        <div className="container mx-auto px-6">
          <SectionHeading
            eyebrow={t.sections.openPositions}
            title={locale === "ar" ? "الوظائف المتاحة حالياً" : "Current Open Positions"}
            subtitle={
              locale === "ar"
                ? "استكشف الفرص الوظيفية المتاحة وانضم إلى فريق مهاكسا."
                : "Explore our available opportunities and join the MHASA team."
            }
          />

          {/* Department filter */}
          <FadeIn className="mt-10">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <FilterChip active={department === "all"} onClick={() => setDepartment("all")}>
                {t.common.allDepartments}
              </FilterChip>
              {departments.map((d) => (
                <FilterChip
                  key={d}
                  active={department === d}
                  onClick={() => setDepartment(d)}
                >
                  {d}
                </FilterChip>
              ))}
            </div>
          </FadeIn>

          {/* Jobs grid */}
          {allLoading ? (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="mt-10 text-center py-16">
              <p className="text-muted-foreground">{t.common.noResults}</p>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job, i) => (
                <JobCard key={job.id} job={job} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      <CTASection />
    </div>
  );
}

// ============================================================================
// Why Join MHASA — perks grid.
// ============================================================================
function WhyJoinSection() {
  const { locale } = useLocale();
  const perks = [
    {
      icon: TrendingUp,
      en: "Career Growth",
      ar: "نمو مهني",
      descEn: "Structured career progression with internal promotions, mentorship, and professional certification sponsorship.",
      descAr: "مسار وظيفي منظم مع ترقيات داخلية وإرشاد ورعاية للحصول على شهادات مهنية.",
    },
    {
      icon: ShieldCheck,
      en: "Safety Culture",
      ar: "ثقافة السلامة",
      descEn: "ISO 45001-certified HSE program with zero-incident targets, daily toolbox talks, and full PPE provision.",
      descAr: "برنامج سلامة معتمد ISO 45001 بأهداف حوادث صفرية ونشرات سلامة يومية ومعدات وقاية كاملة.",
    },
    {
      icon: Heart,
      en: "Competitive Benefits",
      ar: "مزايا تنافسية",
      descEn: "Market-aligned salary, housing & transport allowances, medical insurance, and end-of-service benefits.",
      descAr: "راتب متوافق مع السوق، بدلات سكن ومواصلات، تأمين طبي، ومكافأة نهاية الخدمة.",
    },
    {
      icon: Briefcase,
      en: "Meaningful Projects",
      ar: "مشاريع هادفة",
      descEn: "Work on flagship projects for Saudi Aramco, SABIC, SWCC, and Sadara — projects that shape the Kingdom's future.",
      descAr: "اعمل على مشاريع بارزة لأرامكو وسابك وسوادا وسدرة — مشاريع تصوغ مستقبل المملكة.",
    },
  ];

  return (
    <section className="section-pad bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 end-1/4 h-72 w-72 rounded-full bg-gold blur-3xl" />
      </div>
      <div className="container mx-auto px-6 relative">
        <SectionHeading
          eyebrow={locale === "ar" ? "لماذا مهاكسا" : "Why MHASA"}
          title={locale === "ar" ? "لماذا تنضم إلينا" : "Why Join Our Team"}
          subtitle={
            locale === "ar"
              ? "بيئة عمل احترافية تجمع بين التطور المهني والسلامة والمشاريع المرموقة."
              : "A professional environment that combines career growth, safety, and prestigious projects."
          }
        />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {perks.map((p, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <Card className="group h-full border-border/60 bg-card p-6 hover:border-gold/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-110">
                  <p.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                  {locale === "ar" ? p.ar : p.en}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {locale === "ar" ? p.descAr : p.descEn}
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
// Job Card — title, dept, location, type, experience, salary + Apply button.
// ============================================================================
function JobCard({ job, index }: { job: import("@/lib/types").JobDTO; index: number }) {
  const { t, pick } = useLocale();
  const title = pick(job.title, job.titleAr) ?? job.title;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Card className="group relative flex h-full flex-col border-border/60 bg-card p-6 hover:border-gold/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/5 text-primary">
            <Briefcase className="h-5 w-5" />
          </div>
          <Badge variant="secondary" className="bg-muted/60 text-foreground">
            {job.type}
          </Badge>
        </div>

        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground font-medium">{job.department}</p>

        <div className="mt-4 space-y-2 text-sm">
          <MetaRow icon={MapPin} value={job.location} />
          {job.experience && <MetaRow icon={Clock} value={job.experience} />}
          {job.salaryRange && <MetaRow icon={Wallet} value={job.salaryRange} />}
        </div>

        <div className="mt-6 pt-4 border-t border-border/60">
          <Button
            onClick={() => navigateToJob(job.slug)}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-10"
          >
            {t.actions.applyNow}
            <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

function MetaRow({ icon: Icon, value }: { icon: import("lucide-react").LucideIcon; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="h-3.5 w-3.5 text-gold flex-shrink-0" />
      <span className="text-xs">{value}</span>
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
// Job Detail — meta grid + description + requirements + application form.
// ============================================================================
export function JobDetail({ slug }: { slug: string }) {
  const { data: job, isLoading } = useJob(slug);
  const { t, locale, pick } = useLocale();

  if (isLoading) {
    return (
      <div className="min-h-[60dvh] flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">{t.common.loading}</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-[60dvh] flex flex-col items-center justify-center gap-4 bg-background">
        <p className="text-muted-foreground">{t.common.noResults}</p>
        <Button onClick={navigateBack} variant="outline">
          <ChevronLeft className="me-2 h-4 w-4 rtl:rotate-180" />
          {locale === "ar" ? "العودة للوظائف" : "Back to Careers"}
        </Button>
      </div>
    );
  }

  const title = pick(job.title, job.titleAr) ?? job.title;
  const description = pick(job.description, job.descriptionAr) ?? job.description;

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
    { icon: Building2, label: locale === "ar" ? "القسم" : "Department", value: job.department },
    { icon: MapPin, label: locale === "ar" ? "الموقع" : "Location", value: job.location },
    { icon: Briefcase, label: locale === "ar" ? "نوع الوظيفة" : "Type", value: job.type },
    { icon: Clock, label: locale === "ar" ? "الخبرة" : "Experience", value: job.experience },
    { icon: Wallet, label: locale === "ar" ? "الراتب" : "Salary", value: job.salaryRange },
    { icon: Clock, label: locale === "ar" ? "تاريخ الإغلاق" : "Closing Date", value: formatDate(job.closingDate) },
  ].filter((m) => m.value);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative py-16 md:py-20 bg-navy text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 end-0 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
          <div className="absolute bottom-0 start-0 h-96 w-96 rounded-full bg-primary/40 blur-3xl" />
        </div>
        <div className="container mx-auto px-6 relative">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            onClick={navigateBack}
            className="inline-flex w-fit items-center gap-1.5 text-sm text-white/80 hover:text-gold transition-colors mb-6"
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            {locale === "ar" ? "كل الوظائف" : "All Positions"}
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-3xl"
          >
            <Badge className="bg-gold text-gold-foreground hover:bg-gold font-semibold border-0 mb-4">
              {job.department}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-white leading-[1.1] text-balance">
              {title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/80">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-gold" />
                {job.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-gold" />
                {job.type}
              </span>
              {job.experience && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-gold" />
                  {job.experience}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Meta grid */}
      <section className="py-10 bg-muted/30 border-b border-border">
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

      {/* Description + requirements */}
      <section className="section-pad bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <FadeIn className="lg:col-span-8">
              <SectionHeading
                eyebrow={locale === "ar" ? "نظرة عامة" : "Overview"}
                title={locale === "ar" ? "وصف الوظيفة" : "Job Description"}
                align="left"
              />
              <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
                {description.split("\n").filter(Boolean).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* Requirements */}
              {job.requirements.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-xl font-bold text-foreground font-display mb-4">
                    {locale === "ar" ? "المتطلبات" : "Requirements"}
                  </h3>
                  <ul className="space-y-3">
                    {job.requirements.map((req, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: 10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                        className="flex items-start gap-3 rounded-lg bg-muted/30 px-4 py-3"
                      >
                        <CheckCircle2 className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground/90">{req}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </FadeIn>

            {/* Apply CTA sidebar */}
            <FadeIn delay={0.15} className="lg:col-span-4">
              <div className="sticky top-8">
                <Card className="overflow-hidden border-border/60 bg-navy text-white p-6">
                  <Sparkles className="h-8 w-8 text-gold mb-3" />
                  <h3 className="text-xl font-bold font-display">
                    {locale === "ar" ? "جاهز للتقديم؟" : "Ready to Apply?"}
                  </h3>
                  <p className="mt-2 text-sm text-white/70 leading-relaxed">
                    {locale === "ar"
                      ? "املأ نموذج التقديم وسيتواصل معك فريق الموارد البشرية لدينا."
                      : "Fill out the application form below and our HR team will get in touch."}
                  </p>
                  <Button
                    onClick={() => {
                      const el = document.getElementById("application-form");
                      el?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="mt-5 w-full bg-gold text-gold-foreground hover:bg-gold/90 font-semibold h-11"
                  >
                    {t.actions.applyNow}
                    <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
                  </Button>
                </Card>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Application form */}
      <ApplicationFormSection jobId={job.id} jobTitle={title} />
    </div>
  );
}

// ============================================================================
// Application Form Section.
// ============================================================================
function ApplicationFormSection({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const { t, locale } = useLocale();
  const mutation = useJobApplication();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    coverLetter: "",
    portfolioUrl: "",
    website: "", // honeypot — must stay empty
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = locale === "ar" ? "الاسم مطلوب" : "Name is required";
    if (!form.email.trim()) {
      errs.email = locale === "ar" ? "البريد الإلكتروني مطلوب" : "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = locale === "ar" ? "صيغة بريد غير صحيحة" : "Invalid email format";
    }
    if (!form.phone.trim()) errs.phone = locale === "ar" ? "رقم الهاتف مطلوب" : "Phone is required";
    if (!resumeFile) errs.resume = locale === "ar" ? "السيرة الذاتية مطلوبة (PDF/DOC)" : "Resume is required (PDF/DOC)";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Honeypot — silently drop if filled
    if (form.website) return;
    if (!validate()) return;

    const fd = new FormData();
    fd.append("jobId", jobId);
    fd.append("jobTitle", jobTitle);
    fd.append("name", form.name);
    fd.append("email", form.email);
    fd.append("phone", form.phone);
    fd.append("coverLetter", form.coverLetter);
    fd.append("portfolioUrl", form.portfolioUrl);
    if (resumeFile) fd.append("resume", resumeFile);

    try {
      await mutation.mutateAsync(fd);
      toast.success(
        locale === "ar" ? "تم استلام طلبك بنجاح" : "Application submitted successfully!",
        {
          description:
            locale === "ar"
              ? "سنتواصل معك قريباً عبر بريدك الإلكتروني."
              : "We'll be in touch via email soon.",
        }
      );
      setForm({ name: "", email: "", phone: "", coverLetter: "", portfolioUrl: "", website: "" });
      setResumeFile(null);
      setErrors({});
    } catch (err) {
      toast.error(locale === "ar" ? "فشل الإرسال" : "Submission failed", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  return (
    <section id="application-form" className="section-pad bg-muted/30 scroll-mt-20">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            eyebrow={locale === "ar" ? "نموذج التقديم" : "Application Form"}
            title={locale === "ar" ? "قدم على هذه الوظيفة" : "Apply for This Position"}
            subtitle={
              locale === "ar"
                ? "املأ الحقول التالية. الحقول المطلوبة موضحة بعلامة *."
                : "Complete the fields below. Required fields are marked with *."
            }
          />

          <FadeIn delay={0.1}>
            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              {/* Honeypot */}
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                tabIndex={-1}
                autoComplete="off"
                className="absolute -z-50 opacity-0 pointer-events-none h-0 w-0"
                aria-hidden="true"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field
                  label={t.common.name}
                  required
                  error={errors.name}
                >
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={locale === "ar" ? "اسمك الكامل" : "Your full name"}
                    aria-invalid={!!errors.name}
                  />
                </Field>
                <Field
                  label={t.common.email}
                  required
                  error={errors.email}
                >
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="name@example.com"
                    aria-invalid={!!errors.email}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field
                  label={t.common.phone}
                  required
                  error={errors.phone}
                >
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+966 5x xxx xxxx"
                    aria-invalid={!!errors.phone}
                  />
                </Field>
                <Field
                  label={locale === "ar" ? "رابط الأعمال (اختياري)" : "Portfolio URL (optional)"}
                >
                  <Input
                    value={form.portfolioUrl}
                    onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
                    placeholder="https://"
                  />
                </Field>
              </div>

              {/* Resume upload */}
              <Field
                label={locale === "ar" ? "السيرة الذاتية (PDF/DOC)" : "Resume (PDF/DOC)"}
                required
                error={errors.resume}
              >
                <label
                  htmlFor="resume"
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-input bg-card px-4 py-3 transition-colors hover:border-gold/60 hover:bg-muted/40",
                    errors.resume && "border-destructive"
                  )}
                >
                  <Upload className="h-5 w-5 text-gold flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground truncate">
                      {resumeFile ? resumeFile.name : (locale === "ar" ? "اختر ملف السيرة الذاتية" : "Choose resume file")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {resumeFile
                        ? `${(resumeFile.size / 1024 / 1024).toFixed(2)} MB`
                        : (locale === "ar" ? "PDF أو DOC، الحد الأقصى 10 ميجابايت" : "PDF or DOC, max 10MB")}
                    </div>
                  </div>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </label>
                <input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="sr-only"
                  onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                />
              </Field>

              {/* Cover letter */}
              <Field
                label={locale === "ar" ? "رسالة التعريف" : "Cover Letter"}
              >
                <Textarea
                  value={form.coverLetter}
                  onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
                  placeholder={
                    locale === "ar"
                      ? "أخبرنا لماذا أنت المرشح المناسب لهذا الدور..."
                      : "Tell us why you're the right fit for this role..."
                  }
                  rows={5}
                />
              </Field>

              {/* Submit */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full md:w-auto bg-gold text-gold-foreground hover:bg-gold/90 font-semibold h-12 px-8 text-base shadow-xl shadow-gold/20"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="me-2 h-4 w-4 animate-spin" />
                      {locale === "ar" ? "جار الإرسال..." : "Submitting..."}
                    </>
                  ) : (
                    <>
                      {t.actions.applyNow}
                      <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {locale === "ar"
                  ? "سنحفظ خصوصية بياناتك ولن نشاركها مع أطراف ثالثة."
                  : "Your information is kept private and never shared with third parties."}
              </p>
            </form>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-destructive ms-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ============================================================================
// Page Hero — shared hero for the careers list page.
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
          <button onClick={() => navigateToView("home")} className="hover:text-gold transition-colors">
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
            {locale === "ar" ? "لا تجد ما يناسبك؟" : "Don't See the Right Fit?"}
          </h2>
          <p className="mt-4 text-white/70 text-base md:text-lg leading-relaxed text-balance">
            {locale === "ar"
              ? "أرسل سيرتك الذاتية وسنتواصل معك عند توفر فرصة مناسبة."
              : "Send us your resume and we'll reach out when a matching opportunity opens up."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              onClick={() => navigateToView("contact")}
              className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold px-8 h-12 text-base shadow-xl shadow-gold/20"
            >
              {t.actions.getInTouch}
              <ArrowRight className="ms-2 h-5 w-5 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
