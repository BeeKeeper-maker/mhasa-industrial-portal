// ============================================================================
// Contact View — two-column form + info/map, "what happens next" process.
// ============================================================================

"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, ChevronLeft, MapPin, Phone, Mail, Globe,
  Linkedin, Facebook, Instagram, Youtube, Loader2,
  Send, FileText, ClipboardCheck, Clock, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  SectionHeading, FadeIn, GoldDivider,
} from "@/components/site/primitives";
import { useSiteData, useContactForm } from "@/lib/hooks/use-queries";
import { useLocale } from "@/lib/hooks/use-locale";
import { navigateToView } from "@/lib/store";
import type { SiteSettingDTO } from "@/lib/types";
import { toast } from "sonner";

export function ContactView() {
  return (
    <div className="flex flex-col">
      <PageHero />
      <ContactSection />
      <WhatHappensNext />
      <CTASection />
    </div>
  );
}

// ============================================================================
// Page Hero.
// ============================================================================
function PageHero() {
  const { t, locale } = useLocale();

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
          <span className="text-gold font-medium">{t.nav.contact}</span>
        </motion.div>

        <SectionHeading
          eyebrow={t.sections.sendUsMessage}
          title={locale === "ar" ? "دعنا نتحدث عن مشروعك" : "Let's Talk About Your Project"}
          subtitle={
            locale === "ar"
              ? "فريقنا الهندسي جاهز للرد على استفسارك خلال 24 ساعة عمل. املأ النموذج وسنتواصل معك."
              : "Our engineering team is ready to respond within 24 business hours. Fill out the form and we'll be in touch."
          }
          light
          align="left"
        />
      </div>
    </section>
  );
}

// ============================================================================
// Contact Section — two-column form + info/map.
// ============================================================================
function ContactSection() {
  const { data: siteData } = useSiteData();
  const settings = siteData?.settings;
  const { t, locale, pick } = useLocale();

  return (
    <section className="section-pad bg-background">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: contact form */}
          <FadeIn className="lg:col-span-7">
            <ContactForm />
          </FadeIn>

          {/* Right: contact info + map */}
          <FadeIn delay={0.15} className="lg:col-span-5">
            <div className="space-y-6">
              <ContactInfoCard settings={settings} t={t} locale={locale} pick={pick} />
              <MapCard mapEmbedUrl={settings?.mapEmbedUrl ?? null} locale={locale} />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Contact Form.
// ============================================================================
function ContactForm() {
  const { t, locale } = useLocale();
  const mutation = useContactForm();
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    projectBudget: "",
    attachmentUrl: "",
    website: "", // honeypot
  });
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
    if (!form.subject.trim()) errs.subject = locale === "ar" ? "الموضوع مطلوب" : "Subject is required";
    if (!form.message.trim()) errs.message = locale === "ar" ? "الرسالة مطلوبة" : "Message is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.website) return; // honeypot
    if (!validate()) return;

    try {
      await mutation.mutateAsync({
        name: form.name,
        company: form.company || null,
        email: form.email,
        phone: form.phone,
        subject: form.subject,
        message: form.message,
        projectBudget: form.projectBudget || null,
        attachmentUrl: form.attachmentUrl || null,
      });
      toast.success(
        locale === "ar" ? "تم إرسال رسالتك بنجاح" : "Message sent successfully!",
        {
          description:
            locale === "ar"
              ? "سيتواصل معك فريقنا خلال 24 ساعة عمل."
              : "Our team will respond within 24 business hours.",
        }
      );
      setForm({
        name: "", company: "", email: "", phone: "", subject: "",
        message: "", projectBudget: "", attachmentUrl: "", website: "",
      });
      setErrors({});
    } catch (err) {
      toast.error(locale === "ar" ? "فشل الإرسال" : "Submission failed", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  return (
    <Card className="border-border/60 bg-card p-6 md:p-8">
      <SectionHeading
        eyebrow={locale === "ar" ? "نموذج التواصل" : "Contact Form"}
        title={locale === "ar" ? "أرسل لنا رسالة" : "Send Us a Message"}
        subtitle={
          locale === "ar"
            ? "الحقول المطلوبة موضحة بعلامة *."
            : "Required fields are marked with *."
        }
        align="left"
      />

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
          <Field label={t.common.name} required error={errors.name}>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={locale === "ar" ? "اسمك الكامل" : "Your full name"}
              autoComplete="name"
              inputMode="text"
              enterKeyHint="next"
              aria-invalid={!!errors.name}
            />
          </Field>
          <Field label={`${t.common.company} (${t.common.optional})`}>
            <Input
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder={locale === "ar" ? "اسم شركتك" : "Your company name"}
              autoComplete="organization"
              enterKeyHint="next"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label={t.common.email} required error={errors.email}>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="name@example.com"
              autoComplete="email"
              inputMode="email"
              enterKeyHint="next"
              aria-invalid={!!errors.email}
            />
          </Field>
          <Field label={t.common.phone} required error={errors.phone}>
            <Input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+966 5x xxx xxxx"
              autoComplete="tel"
              inputMode="tel"
              enterKeyHint="next"
              aria-invalid={!!errors.phone}
            />
          </Field>
        </div>

        <Field label={t.common.subject} required error={errors.subject}>
          <Input
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder={locale === "ar" ? "موضوع رسالتك" : "Subject of your message"}
            autoComplete="off"
            enterKeyHint="next"
            aria-invalid={!!errors.subject}
          />
        </Field>

        {/* Budget + Attachment URL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label={t.common.budgetLabel}>
            <Select
              value={form.projectBudget}
              onValueChange={(val) => setForm({ ...form, projectBudget: val })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t.common.selectBudget} />
              </SelectTrigger>
              <SelectContent>
                {t.budgets.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={`${t.common.attachment} (${t.common.optional})`}>
            <Input
              value={form.attachmentUrl}
              onChange={(e) => setForm({ ...form, attachmentUrl: e.target.value })}
              placeholder="https://..."
            />
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {locale === "ar" ? "رابط PDF/DWG لمواصفات المشروع" : "PDF/DWG link to project specs"}
            </p>
          </Field>
        </div>

        <Field label={t.common.message} required error={errors.message}>
          <Textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder={
              locale === "ar"
                ? "اشرح لنا متطلبات مشروعك، الموقع، النطاق، والجدول الزمني..."
                : "Tell us about your project requirements, location, scope, and timeline..."
            }
            rows={6}
            aria-invalid={!!errors.message}
          />
        </Field>

        {/* Submit */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold h-12 px-8 text-base shadow-xl shadow-gold/20"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                {locale === "ar" ? "جار الإرسال..." : "Sending..."}
              </>
            ) : (
              <>
                <Send className="me-2 h-4 w-4" />
                {t.actions.send}
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
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
// Contact Info Card.
// ============================================================================
type SettingsLike = SiteSettingDTO | null | undefined;

function ContactInfoCard({
  settings,
  t,
  locale,
  pick,
}: {
  settings: SettingsLike;
  t: ReturnType<typeof useLocale>["t"];
  locale: "en" | "ar";
  pick: ReturnType<typeof useLocale>["pick"];
}) {
  const address = settings ? pick(settings.address, settings.addressAr) ?? settings.address : null;

  const socials = settings
    ? [
        { icon: Linkedin, url: settings.linkedinUrl, label: "LinkedIn" },
        { icon: Facebook, url: settings.facebookUrl, label: "Facebook" },
        { icon: Instagram, url: settings.instagramUrl, label: "Instagram" },
        { icon: Youtube, url: settings.youtubeUrl, label: "YouTube" },
      ].filter((s) => s.url)
    : [];

  return (
    <Card className="border-border/60 bg-navy text-white p-6 md:p-8 relative overflow-hidden">
      <div className="absolute top-0 end-0 h-48 w-48 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-gold" />
          <h3 className="text-lg font-bold font-display">
            {t.common.contactInfo}
          </h3>
        </div>

        <ul className="space-y-5">
          {address && (
            <InfoRow icon={MapPin} label={locale === "ar" ? "العنوان" : "Address"}>
              <p className="text-sm text-white/80 leading-relaxed">{address}</p>
            </InfoRow>
          )}
          {settings?.phonePrimary && (
            <InfoRow icon={Phone} label={locale === "ar" ? "الهاتف" : "Phone"}>
              <div className="flex flex-col gap-1">
                <a
                  href={`tel:${settings.phonePrimary}`}
                  className="text-sm text-white/80 hover:text-gold transition-colors"
                  dir="ltr"
                >
                  {settings.phonePrimary}
                </a>
                {settings.phoneSecondary && (
                  <a
                    href={`tel:${settings.phoneSecondary}`}
                    className="text-sm text-white/60 hover:text-gold transition-colors"
                    dir="ltr"
                  >
                    {settings.phoneSecondary}
                  </a>
                )}
              </div>
            </InfoRow>
          )}
          {settings?.email && (
            <InfoRow icon={Mail} label={locale === "ar" ? "البريد الإلكتروني" : "Email"}>
              <a
                href={`mailto:${settings.email}`}
                className="text-sm text-white/80 hover:text-gold transition-colors break-all"
              >
                {settings.email}
              </a>
            </InfoRow>
          )}
          {settings?.whatsappNumber && (
            <InfoRow icon={Globe} label="WhatsApp">
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/80 hover:text-gold transition-colors"
                dir="ltr"
              >
                {settings.whatsappNumber}
              </a>
            </InfoRow>
          )}
        </ul>

        {socials.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-white/60 uppercase tracking-wider mb-3">{t.common.followUs}</p>
            <div className="flex flex-wrap gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-gold hover:text-gold-foreground transition-colors"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: import("lucide-react").LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-white/50 uppercase tracking-wider mb-1">{label}</p>
        {children}
      </div>
    </li>
  );
}

// ============================================================================
// Map Card — Google Map embed in iframe with rounded corners.
// ============================================================================
function MapCard({ mapEmbedUrl, locale }: { mapEmbedUrl: string | null; locale: "en" | "ar" }) {
  return (
    <Card className="overflow-hidden border-border/60 bg-card p-0">
      <div className="bg-navy text-white px-5 py-3 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-gold" />
        <span className="text-sm font-semibold">
          {locale === "ar" ? "موقعنا على الخريطة" : "Find Us on the Map"}
        </span>
      </div>
      {mapEmbedUrl ? (
        <iframe
          src={mapEmbedUrl}
          title={locale === "ar" ? "خريطة الموقع" : "Location Map"}
          className="w-full h-72 border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className="w-full h-72 flex items-center justify-center bg-muted/40 text-muted-foreground">
          <div className="text-center">
            <MapPin className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">{locale === "ar" ? "الخريطة غير متوفرة" : "Map unavailable"}</p>
          </div>
        </div>
      )}
    </Card>
  );
}

// ============================================================================
// What Happens Next — 3-step process.
// ============================================================================
function WhatHappensNext() {
  const { locale } = useLocale();
  const steps = [
    {
      icon: Send,
      en: "Submit Your Inquiry",
      ar: "أرسل استفسارك",
      descEn: "Fill out the form above with your project details and requirements.",
      descAr: "املأ النموذج أعلاه بتفاصيل ومتطلبات مشروعك.",
    },
    {
      icon: ClipboardCheck,
      en: "We Review Within 24h",
      ar: "نراجع خلال 24 ساعة",
      descEn: "Our engineering team reviews your request and prepares a tailored response.",
      descAr: "يراجع فريقنا الهندسي طلبك ويجهز رداً مخصصاً.",
    },
    {
      icon: FileText,
      en: "Get Your Quotation",
      ar: "احصل على عرض السعر",
      descEn: "You receive a detailed, no-obligation quotation within 24 business hours.",
      descAr: "تستلم عرض سعر مفصل غير ملزم خلال 24 ساعة عمل.",
    },
  ];

  return (
    <section className="section-pad bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-1/2 start-1/4 h-72 w-72 rounded-full bg-gold blur-3xl" />
      </div>
      <div className="container mx-auto px-6 relative">
        <SectionHeading
          eyebrow={locale === "ar" ? "الخطوات التالية" : "What Happens Next"}
          title={locale === "ar" ? "كيف تعمل العملية" : "How the Process Works"}
          subtitle={
            locale === "ar"
              ? "من الاستفسار الأول إلى عرض السعر — عملية واضحة وسريعة."
              : "From first inquiry to quotation — a clear, fast process."
          }
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-7 start-[16.66%] end-[16.66%] h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

          {steps.map((step, i) => (
            <FadeIn key={i} delay={i * 0.12}>
              <div className="relative flex flex-col items-center text-center">
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white border-2 border-gold/40 text-gold shadow-lg shadow-gold/10">
                  <step.icon className="h-6 w-6" />
                  <span className="absolute -top-2 -end-2 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-gold-foreground text-xs font-bold font-display">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-foreground">
                  {locale === "ar" ? step.ar : step.en}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs">
                  {locale === "ar" ? step.descAr : step.descEn}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3} className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 text-gold" />
          {locale === "ar"
            ? "متوسط زمن الاستجابة: أقل من 24 ساعة عمل"
            : "Average response time: under 24 business hours"}
        </FadeIn>
      </div>
    </section>
  );
}

// ============================================================================
// CTA Section.
// ============================================================================
function CTASection() {
  const { t, locale } = useLocale();
  const { data: siteData } = useSiteData();
  const settings = siteData?.settings;

  return (
    <section className="relative py-20 overflow-hidden bg-navy">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 end-0 h-96 w-96 rounded-full bg-gold blur-3xl" />
        <div className="absolute bottom-0 start-0 h-96 w-96 rounded-full bg-primary blur-3xl" />
      </div>
      <div className="container mx-auto px-6 relative">
        <div className="mx-auto max-w-3xl text-center">
          <GoldDivider className="mb-6" />
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-display text-balance">
            {locale === "ar" ? "تفضل المكالمة المباشرة؟" : "Prefer to Call Directly?"}
          </h2>
          <p className="mt-4 text-white/70 text-base md:text-lg leading-relaxed text-balance">
            {locale === "ar"
              ? "فريقنا متاح من السبت إلى الخميس، 8 صباحاً حتى 6 مساءً."
              : "Our team is available Saturday through Thursday, 8 AM to 6 PM."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {settings?.phonePrimary && (
              <Button
                size="lg"
                asChild
                className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold px-8 h-12 text-base shadow-xl shadow-gold/20"
              >
                <a href={`tel:${settings.phonePrimary}`}>
                  <Phone className="me-2 h-4 w-4" />
                  {settings.phonePrimary}
                </a>
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigateToView("services")}
              className="border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white h-12 px-8 text-base"
            >
              {t.actions.exploreServices}
              <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
