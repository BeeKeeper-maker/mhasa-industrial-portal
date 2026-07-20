// ============================================================================
// Legal View — Privacy Policy + Terms & Conditions.
// Two named exports share the same <LegalLayout> shell:
//   - PrivacyView  → /api/legal/privacy content
//   - TermsView    → /api/legal/terms   content
// Each renders a navy hero, sticky table-of-contents sidebar (desktop),
// a centered readable content column, a "last updated" line, and a
// "back to home / contact" CTA at the bottom.
// ============================================================================

"use client";

import { useState, useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, ChevronLeft, FileText, Mail,
  Phone, ScrollText, Lock, Scale, ExternalLink, Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  SectionHeading, FadeIn, GoldDivider,
} from "@/components/site/primitives";
import { ReadingProgress } from "@/components/site/reading-progress";
import { useAppStore } from "@/lib/store";
import { useLocale } from "@/lib/hooks/use-locale";
import { cn } from "@/lib/utils";

// ============================================================================
// Content Model
// ============================================================================
// A single legal section — bilingual title + a list of bilingual paragraphs.
// Paragraphs may be plain strings (rendered as <p>) or pre-built ReactNodes
// (rendered as-is) so we can embed lists / bold spans where needed.
interface LegalSection {
  id: string;
  titleEn: string;
  titleAr: string;
  paragraphs: Array<{ en: ReactNode; ar: ReactNode }>;
}

interface LegalDocument {
  titleEn: string;
  titleAr: string;
  eyebrowEn: string;
  eyebrowAr: string;
  introEn: ReactNode;
  introAr: ReactNode;
  lastUpdatedEn: string; // e.g. "1 January 2025"
  lastUpdatedAr: string;
  sections: LegalSection[];
}

// ============================================================================
// Layout — shared shell used by both views.
// ============================================================================
function LegalLayout({
  doc,
  breadcrumb,
  icon: Icon,
}: {
  doc: LegalDocument;
  breadcrumb: string;
  icon: typeof FileText;
}) {
  const { t, locale } = useLocale();
  const isAr = locale === "ar";
  const title = isAr ? doc.titleAr : doc.titleEn;
  const eyebrow = isAr ? doc.eyebrowAr : doc.eyebrowEn;
  const intro = isAr ? doc.introAr : doc.introEn;
  const lastUpdated = isAr ? doc.lastUpdatedAr : doc.lastUpdatedEn;

  return (
    <div className="flex flex-col">
      <ReadingProgress />

      <LegalHero
        title={title}
        eyebrow={eyebrow}
        breadcrumb={breadcrumb}
        lastUpdated={lastUpdated}
        icon={Icon}
      />

      <section className="section-pad bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            {/* Sticky TOC sidebar (desktop only) */}
            <aside className="hidden lg:block lg:col-span-3">
              <TableOfContents doc={doc} />
            </aside>

            {/* Mobile TOC (collapsible) */}
            <div className="lg:hidden">
              <TableOfContentsMobile doc={doc} />
            </div>

            {/* Main content column */}
            <div className="lg:col-span-9">
              <FadeIn>
                <Card className="border-border/60 bg-card p-6 md:p-10 lg:p-12">
                  {/* Intro */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-primary mb-3">
                      <span className="h-px w-8 bg-gold" />
                      {eyebrow}
                    </div>
                    <p className="text-base md:text-lg leading-relaxed text-foreground/90 font-medium">
                      {intro}
                    </p>
                  </div>

                  <GoldDivider className="justify-start ms-0 mb-8 [&>span:first-child]:hidden" />

                  {/* Sections */}
                  <div className="space-y-10">
                    {doc.sections.map((section, i) => (
                      <LegalSectionBlock
                        key={section.id}
                        section={section}
                        index={i + 1}
                      />
                    ))}
                  </div>

                  {/* Bottom — back to home / contact */}
                  <div className="mt-12 pt-8 border-t border-border/60">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <p className="text-sm text-muted-foreground">
                        {isAr
                          ? "لأي استفسارات بخصوص هذه الوثيقة، تواصل معنا:"
                          : "For any questions regarding this document, contact us:"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" size="sm" className="h-9">
                          <a href="mailto:info@mhaksa.com">
                            <Mail className="h-4 w-4 me-2" />
                            info@mhaksa.com
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9"
                          onClick={() => useAppStore.getState().setView("home")}
                        >
                          <ChevronLeft className="h-4 w-4 me-1 rtl:rotate-180" />
                          {t.nav.home}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      <LegalCTA />
    </div>
  );
}

// ============================================================================
// Hero — navy hero with breadcrumb + title + last-updated stamp.
// ============================================================================
function LegalHero({
  title, eyebrow, breadcrumb, lastUpdated, icon: Icon,
}: {
  title: string;
  eyebrow: string;
  breadcrumb: string;
  lastUpdated: string;
  icon: typeof FileText;
}) {
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
          <span className="text-gold font-medium">{breadcrumb}</span>
        </motion.div>

        <div className="flex items-start gap-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden md:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold/15 text-gold border border-gold/30"
          >
            <Icon className="h-7 w-7" />
          </motion.div>

          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            light
            align="left"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 inline-flex items-center gap-2 text-xs text-white/60"
        >
          <ScrollText className="h-3.5 w-3.5" />
          <span>
            {locale === "ar" ? "آخر تحديث:" : "Last updated:"}{" "}
            <span className="text-white/80 font-medium">{lastUpdated}</span>
          </span>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// Table of Contents — sticky sidebar on desktop.
// ============================================================================
function TableOfContents({ doc }: { doc: LegalDocument }) {
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const [activeId, setActiveId] = useState<string>("");

  // Scroll-spy: highlight the section currently in view
  useEffect(() => {
    const sectionIds = ["legal-top", ...doc.sections.map((s) => s.id)];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-100px 0px -70% 0px", threshold: 0 }
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [doc.sections]);

  return (
    <div className="sticky top-24">
      <div className="rounded-xl border border-border/60 bg-muted/30 p-5">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-primary mb-4">
          <span className="h-px w-6 bg-gold" />
          {isAr ? "محتويات" : "Contents"}
        </div>
        <nav className="space-y-1">
          <a
            href="#legal-top"
            className={cn(
              "block rounded-md px-2 py-1.5 text-xs transition-colors",
              activeId === "legal-top" || activeId === ""
                ? "text-primary font-semibold bg-background"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            {isAr ? "أعلى الوثيقة" : "Top of document"}
          </a>
          {doc.sections.map((s, i) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={cn(
                "group flex items-start gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                activeId === s.id
                  ? "bg-background text-primary font-semibold"
                  : "text-muted-foreground hover:bg-background hover:text-primary"
              )}
            >
              <span className={cn(
                "mt-0.5 text-[10px] font-bold font-display transition-colors",
                activeId === s.id ? "text-gold" : "text-gold/70 group-hover:text-gold"
              )}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="leading-snug">{isAr ? s.titleAr : s.titleEn}</span>
              {activeId === s.id && (
                <span className="mt-1.5 h-1 w-1 rounded-full bg-gold flex-shrink-0" />
              )}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}

// ============================================================================
// Table of Contents — collapsible mobile variant.
// ============================================================================
function TableOfContentsMobile({ doc }: { doc: LegalDocument }) {
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <span className="h-px w-4 bg-gold" />
          {isAr ? "محتويات" : "Contents"}
        </span>
        <ChevronLeft
          className={cn("h-4 w-4 transition-transform rtl:rotate-180", open && "-rotate-90")}
        />
      </button>
      {open && (
        <div className="mt-2 rounded-xl border border-border/60 bg-muted/20 p-3">
          <nav className="space-y-1">
            {doc.sections.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setOpen(false)}
                className="group flex items-start gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-background hover:text-primary transition-colors"
              >
                <span className="mt-0.5 text-[10px] font-bold font-display text-gold/70 group-hover:text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="leading-snug">{isAr ? s.titleAr : s.titleEn}</span>
              </a>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Legal Section Block — heading + paragraphs.
// ============================================================================
function LegalSectionBlock({
  section,
  index,
}: {
  section: LegalSection;
  index: number;
}) {
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const title = isAr ? section.titleAr : section.titleEn;
  const paragraphs = section.paragraphs.map((p) => (isAr ? p.ar : p.en));

  return (
    <motion.section
      id={section.id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="scroll-mt-24"
    >
      <h2 className="flex items-baseline gap-3 text-xl md:text-2xl font-bold text-navy font-display mt-2 mb-4">
        <span className="text-sm font-bold text-gold font-display">
          {String(index).padStart(2, "0")}
        </span>
        <span>{title}</span>
      </h2>
      <div className="space-y-4 text-base leading-relaxed text-foreground/80">
        {paragraphs.map((p, i) => (
          <div key={i}>{p}</div>
        ))}
      </div>
    </motion.section>
  );
}

// ============================================================================
// Shared CTA — shown at the bottom of both legal documents.
// ============================================================================
function LegalCTA() {
  const setView = useAppStore((s) => s.setView);
  const { t, locale } = useLocale();

  return (
    <section className="relative py-16 overflow-hidden bg-muted/30">
      <div className="container mx-auto px-6 relative">
        <div className="mx-auto max-w-3xl text-center">
          <GoldDivider className="mb-6" />
          <h2 className="text-2xl md:text-3xl font-bold text-navy font-display text-balance">
            {locale === "ar" ? "هل لديك أسئلة قانونية؟" : "Have Legal Questions?"}
          </h2>
          <p className="mt-3 text-muted-foreground text-base leading-relaxed text-balance">
            {locale === "ar"
              ? "فريقنا جاهز للإجابة على أي استفسارات بخصوص سياساتنا أو شروط استخدام موقعنا."
              : "Our team is available to answer any questions about our policies or website terms of use."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              onClick={() => setView("contact")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 h-12 text-base shadow-lg shadow-primary/20"
            >
              <Mail className="h-5 w-5 me-2" />
              {t.actions.getInTouch}
              <ArrowRight className="ms-2 h-5 w-5 rtl:rotate-180" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setView("home")}
              className="h-12 px-8 text-base"
            >
              {t.nav.home}
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => window.print()}
              className="h-12 px-6 text-base no-print"
            >
              <Printer className="h-5 w-5 me-2" />
              {locale === "ar" ? "طباعة" : "Print"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Privacy Policy Content
// ============================================================================
const PRIVACY_DOC: LegalDocument = {
  titleEn: "Privacy Policy",
  titleAr: "سياسة الخصوصية",
  eyebrowEn: "Your Privacy Matters",
  eyebrowAr: "خصوصيتك تهمّنا",
  introEn:
    "Mohd H. Al Marhoon Cont. Est. (\"MHASA\", \"we\", \"us\", or \"our\") respects your privacy and is committed to protecting the personal data you share with us through this website and our business operations. This Privacy Policy explains what information we collect, how we use it, and the rights you have under the Kingdom of Saudi Arabia's Personal Data Protection Law (PDPL).",
  introAr:
    "تحترم مؤسسة محمد بن حمد المرحون للمقاولات (\"مهاكسا\" أو \"نحن\") خصوصيتك وتلتزم بحماية البيانات الشخصية التي تشاركها معنا عبر هذا الموقع وفي عملياتنا التجارية. توضّح سياسة الخصوصية هذه المعلومات التي نجمعها وكيفية استخدامها والحقوق التي تتمتّع بها بموجب نظام حماية البيانات الشخصية في المملكة العربية السعودية (PDPL).",
  lastUpdatedEn: "1 January 2025",
  lastUpdatedAr: "1 يناير 2025",
  sections: [
    {
      id: "privacy-scope",
      titleEn: "Introduction & Scope",
      titleAr: "مقدمة ونطاق التطبيق",
      paragraphs: [
        {
          en: "This Privacy Policy applies to all visitors, users, and other parties who interact with our website mhasa.com (the \"Site\") and the services offered by MHASA. By accessing or using the Site, you consent to the collection, use, and disclosure of your personal data as described in this Policy.",
          ar: "تنطبق سياسة الخصوصية هذه على جميع الزوار والمستخدمين والأطراف الأخرى الذين يتفاعلون مع موقعنا mhasa.com (\"الموقع\") والخدمات التي تقدمها مهاكسا. بدخولك إلى الموقع أو استخدامك له، فإنك توافق على جمع بياناتك الشخصية واستخدامها والكشف عنها كما هو موضّح في هذه السياسة.",
        },
        {
          en: "This Policy does not apply to third-party websites or services that may be linked from our Site. We encourage you to review the privacy policies of any third-party sites you visit.",
          ar: "لا تنطبق هذه السياسة على مواقع أو خدمات الأطراف الثالثة التي قد يتم ربطها من موقعنا. ننصحك بمراجعة سياسات الخصوصية الخاصة بأي مواقع تابعة لأطراف ثالثة تزورها.",
        },
      ],
    },
    {
      id: "privacy-collect",
      titleEn: "Information We Collect",
      titleAr: "المعلومات التي نجمعها",
      paragraphs: [
        {
          en: "We collect information that you provide directly to us when you fill out forms on our Site, including:",
          ar: "نجمع المعلومات التي تقدّمها لنا مباشرة عند ملء النماذج على موقعنا، بما في ذلك:",
        },
        {
          en: (
            <ul className="list-disc ps-6 space-y-1.5">
              <li><strong>Contact form data:</strong> full name, email address, phone number, company name, project details, budget range, and any message you submit through our contact form.</li>
              <li><strong>Job application data:</strong> full name, contact details, educational background, work experience, and any documents (resume, certifications) you upload when applying for a position.</li>
              <li><strong>Subscription data:</strong> email address if you opt in to receive our newsletter or company updates.</li>
            </ul>
          ),
          ar: (
            <ul className="list-disc ps-6 space-y-1.5">
              <li><strong>بيانات نموذج التواصل:</strong> الاسم الكامل، البريد الإلكتروني، رقم الهاتف، اسم الشركة، تفاصيل المشروع، نطاق الميزانية، وأي رسالة ترسلها عبر نموذج التواصل.</li>
              <li><strong>بيانات التقديم على الوظائف:</strong> الاسم الكامل، تفاصيل التواصل، المؤهلات العلمية، خبرات العمل، وأي مستندات (السيرة الذاتية، الشهادات) ترفعها عند التقديم على وظيفة.</li>
              <li><strong>بيانات الاشتراك:</strong> البريد الإلكتروني إذا اخترت الاشتراك في نشرتنا البريدية أو تحديثات الشركة.</li>
            </ul>
          ),
        },
        {
          en: "We also collect usage data automatically when you visit our Site, including your IP address, browser type, device information, pages visited, time spent on pages, and referring website addresses. This data is collected through cookies and similar tracking technologies described below.",
          ar: "كما نجمع بيانات الاستخدام تلقائياً عند زيارتك للموقع، بما في ذلك عنوان IP، ونوع المتصفح، ومعلومات الجهاز، والصفحات التي زرتها، والوقت الذي قضيته على كل صفحة، وعناوين المواقع المُحيلة. تُجمع هذه البيانات من خلال ملفات تعريف الارتباط وتقنيات التتبع المماثلة الموضحة أدناه.",
        },
      ],
    },
    {
      id: "privacy-use",
      titleEn: "How We Use Your Information",
      titleAr: "كيفية استخدام معلوماتك",
      paragraphs: [
        {
          en: "We use the personal data we collect for the following legitimate business purposes:",
          ar: "نستخدم البيانات الشخصية التي نجمعها للأغراض التجارية المشروعة التالية:",
        },
        {
          en: (
            <ul className="list-disc ps-6 space-y-1.5">
              <li>Responding to your inquiries, requests for quotations, and other communications submitted through the contact form.</li>
              <li>Processing and evaluating job applications and communicating with candidates regarding open positions.</li>
              <li>Providing, maintaining, and improving our services, including tailoring content to your interests.</li>
              <li>Sending administrative information such as policy updates, security alerts, and service notifications.</li>
              <li>Analyzing website usage trends to enhance user experience and optimize our Site&apos;s performance.</li>
              <li>Detecting, preventing, and addressing technical issues, fraud, security breaches, or other misuse of our Site.</li>
              <li>Complying with our legal and regulatory obligations under Saudi law, including tax, labor, and safety regulations.</li>
            </ul>
          ),
          ar: (
            <ul className="list-disc ps-6 space-y-1.5">
              <li>الرد على استفساراتك وطلبات عروض الأسعار والاتصالات الأخرى المُرسلة عبر نموذج التواصل.</li>
              <li>معالجة وتقييم طلبات التوظيف والتواصل مع المرشحين بشأن الوظائف المتاحة.</li>
              <li>تقديم وصيانة وتحسين خدماتنا، بما في ذلك تخصيص المحتوى وفق اهتماماتك.</li>
              <li>إرسال المعلومات الإدارية مثل تحديثات السياسات وتنبيهات الأمان وإشعارات الخدمة.</li>
              <li>تحليل اتجاهات استخدام الموقع لتحسين تجربة المستخدم وتحسين أداء موقعنا.</li>
              <li>اكتشاف ومنع ومعالجة المشكلات الفنية أو الاحتيال أو الخروقات الأمنية أو أي إساءة استخدام لموقعنا.</li>
              <li>الامتثال لالتزاماتنا القانونية والتنظيمية بموجب القانون السعودي، بما في ذلك اللوائح الضريبية والعمالية والسلامة.</li>
            </ul>
          ),
        },
        {
          en: "We process your personal data only with your consent, to fulfill a contract with you, to comply with a legal obligation, or for our legitimate business interests where those interests do not override your fundamental rights.",
          ar: "نُعالج بياناتك الشخصية فقط بموافقتك، أو للوفاء بعقد معك، أو للامتثال لالتزام قانوني، أو لمصالحنا التجارية المشروعة حيث لا تتجاوز هذه المصالح حقوقك الأساسية.",
        },
      ],
    },
    {
      id: "privacy-cookies",
      titleEn: "Cookies & Tracking Technologies",
      titleAr: "ملفات تعريف الارتباط وتقنيات التتبع",
      paragraphs: [
        {
          en: "Our Site uses cookies and similar tracking technologies (web beacons, pixels, and local storage) to recognize you, remember your preferences, measure traffic, and personalize content. The specific technologies we use include:",
          ar: "يستخدم موقعنا ملفات تعريف الارتباط وتقنيات التتبع المماثلة (إشارات الويب، وحدات البكسل، التخزين المحلي) للتعرف عليك وتذكر تفضيلاتك وقياس حركة المرور وتخصيص المحتوى. تشمل التقنيات المحددة التي نستخدمها:",
        },
        {
          en: (
            <ul className="list-disc ps-6 space-y-1.5">
              <li><strong>Google Analytics</strong> — to understand how visitors interact with our Site through aggregated, anonymized usage metrics.</li>
              <li><strong>Meta (Facebook) Pixel</strong> — to measure the effectiveness of our advertising and deliver more relevant content to interested audiences.</li>
              <li><strong>Essential cookies</strong> — required for core Site functionality such as language preference and cookie consent state.</li>
            </ul>
          ),
          ar: (
            <ul className="list-disc ps-6 space-y-1.5">
              <li><strong>Google Analytics</strong> — لفهم كيفية تفاعل الزوار مع موقعنا من خلال مقاييس استخدام مجمّعة ومجهولة الهوية.</li>
              <li><strong>Meta (Facebook) Pixel</strong> — لقياس فعالية إعلاناتنا وتقديم محتوى أكثر صلة للجمهور المهتم.</li>
              <li><strong>ملفات تعريف الارتباط الأساسية</strong> — مطلوبة للوظائف الأساسية للموقع مثل تفضيل اللغة وحالة الموافقة على ملفات تعريف الارتباط.</li>
            </ul>
          ),
        },
        {
          en: "When you first visit our Site, you will see a cookie consent banner. You may choose to accept all cookies, decline non-essential cookies, or manage your preferences at any time through your browser settings. Disabling cookies may limit some features of the Site.",
          ar: "عند زيارتك الأولى لموقعنا، سترى لافتة موافقة على ملفات تعريف الارتباط. يمكنك اختيار قبول جميع ملفات تعريف الارتباط، أو رفض الملفات غير الأساسية، أو إدارة تفضيلاتك في أي وقت من خلال إعدادات متصفحك. قد يؤدي تعطيل ملفات تعريف الارتباط إلى تقييد بعض ميزات الموقع.",
        },
      ],
    },
    {
      id: "privacy-sharing",
      titleEn: "Data Sharing & Third Parties",
      titleAr: "مشاركة البيانات مع الأطراف الثالثة",
      paragraphs: [
        {
          en: "We do not sell, rent, or trade your personal data to third parties. We may share your information with the following categories of recipients when necessary:",
          ar: "نحن لا نبيع أو نؤجر أو نتاجر ببياناتك الشخصية مع أطراف ثالثة. قد نشارك معلوماتك مع الفئات التالية من المستلمين عند الضرورة:",
        },
        {
          en: (
            <ul className="list-disc ps-6 space-y-1.5">
              <li><strong>Service providers</strong> — trusted vendors who host our website, deliver email, provide analytics, or support our recruitment process, under contractual obligations of confidentiality.</li>
              <li><strong>Business partners</strong> — when you explicitly request a joint proposal or referral (for example, an engineering partner on a project).</li>
              <li><strong>Government authorities</strong> — when required by Saudi law, court order, or to protect our legal rights, safety, or property.</li>
              <li><strong>Successors in business</strong> — in the event of a merger, acquisition, or asset sale, with notice to you before any transfer.</li>
            </ul>
          ),
          ar: (
            <ul className="list-disc ps-6 space-y-1.5">
              <li><strong>مزوّدو الخدمات</strong> — مزوّدون موثوقون يستضيفون موقعنا أو يقدّمون خدمة البريد الإلكتروني أو التحليلات أو يدعمون عملية التوظيف لدينا، وذلك بموجب التزامات تعاقدية بسرّية البيانات.</li>
              <li><strong>شركاء الأعمال</strong> — عندما تطلب صراحةً عرضاً مشتركاً أو إحالة (مثلاً، شريك هندسي في مشروع).</li>
              <li><strong>الجهات الحكومية</strong> — عندما يقتضي القانون السعودي أو أمر محكمة ذلك، أو لحماية حقوقنا القانونية أو سلامتنا أو ممتلكاتنا.</li>
              <li><strong>الخلفاء في الأعمال</strong> — في حالة الاندماج أو الاستحواذ أو بيع الأصول، مع إشعارك قبل أي نقل.</li>
            </ul>
          ),
        },
      ],
    },
    {
      id: "privacy-security",
      titleEn: "Data Security",
      titleAr: "أمن البيانات",
      paragraphs: [
        {
          en: "We implement industry-standard technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. These measures include TLS encryption for data in transit, encrypted storage for sensitive data, role-based access controls within our organization, and regular security reviews of our systems and processes.",
          ar: "نطبّق تدابير تقنية وتنظيمية معيارية في الصناعة لحماية بياناتك الشخصية من الوصول غير المصرّح به أو التعديل أو الإفصاح أو الإتلاف. تشمل هذه التدابير تشفير TLS للبيانات أثناء النقل، وتخزين مشفّر للبيانات الحساسة، وضوابط وصول قائمة على الأدوار داخل مؤسستنا، ومراجعات أمنية منتظمة لأنظمتنا وعملياتنا.",
        },
        {
          en: "Despite our best efforts, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security but will notify you and the relevant Saudi authorities in accordance with PDPL requirements if a data breach affecting your personal data occurs.",
          ar: "على الرغم من جهودنا، لا توجد طريقة لنقل البيانات عبر الإنترنت أو تخزينها إلكترونياً آمنة بنسبة 100%. لا يمكننا ضمان الأمن المطلق، ولكن سنُعلمك والجهات السعودية المختصة وفق متطلبات نظام حماية البيانات الشخصية في حال حدوث خرق للبيانات يؤثر على بياناتك الشخصية.",
        },
      ],
    },
    {
      id: "privacy-rights",
      titleEn: "Your Rights Under PDPL",
      titleAr: "حقوقك بموجب نظام حماية البيانات الشخصية",
      paragraphs: [
        {
          en: "Under the Kingdom of Saudi Arabia's Personal Data Protection Law (PDPL), you have the following rights regarding your personal data:",
          ar: "بموجب نظام حماية البيانات الشخصية في المملكة العربية السعودية، تتمتّع بالحقوق التالية فيما يتعلق بياناتك الشخصية:",
        },
        {
          en: (
            <ul className="list-disc ps-6 space-y-1.5">
              <li><strong>Right of access</strong> — request a copy of the personal data we hold about you.</li>
              <li><strong>Right to correction</strong> — request that we correct inaccurate or incomplete data.</li>
              <li><strong>Right to deletion</strong> — request that we erase your data when it is no longer necessary or processing is unlawful.</li>
              <li><strong>Right to withdraw consent</strong> — withdraw consent at any time for processing based on your consent.</li>
              <li><strong>Right to object</strong> — object to processing for direct marketing or other legitimate-interest purposes.</li>
              <li><strong>Right to data portability</strong> — receive your data in a structured, machine-readable format.</li>
            </ul>
          ),
          ar: (
            <ul className="list-disc ps-6 space-y-1.5">
              <li><strong>حق الوصول</strong> — طلب نسخة من البيانات الشخصية التي نحتفظ بها عنك.</li>
              <li><strong>حق التصحيح</strong> — طلب تصحيح البيانات غير الدقيقة أو غير المكتملة.</li>
              <li><strong>حق الحذف</strong> — طلب محو بياناتك عندما لا تكون ضرورية أو عندما تكون المعالجة غير مشروعة.</li>
              <li><strong>حق سحب الموافقة</strong> — سحب الموافقة في أي وقت للمعالجة المبنية على موافقتك.</li>
              <li><strong>حق الاعتراض</strong> — الاعتراض على المعالجة لأغراض التسويق المباشر أو لأغراض المصالح المشروعة الأخرى.</li>
              <li><strong>حق نقل البيانات</strong> — تلقي بياناتك بتنسيق منظم قابل للقراءة آلياً.</li>
            </ul>
          ),
        },
        {
          en: "To exercise any of these rights, please contact us at info@mhaksa.com with the subject line \"PDPL Rights Request\". We will respond within 30 days of receiving your request.",
          ar: "لممارسة أي من هذه الحقوق، يُرجى التواصل معنا على info@mhaksa.com بعنوان \"طلب حقوق PDPL\". سنردّ خلال 30 يوماً من استلام طلبك.",
        },
      ],
    },
    {
      id: "privacy-retention",
      titleEn: "Data Retention",
      titleAr: "الاحتفاظ بالبيانات",
      paragraphs: [
        {
          en: "We retain your personal data only for as long as necessary to fulfill the purposes outlined in this Policy, comply with our legal obligations under Saudi law, resolve disputes, and enforce our agreements. Specific retention periods include:",
          ar: "نحتفظ ببياناتك الشخصية فقط للمدة اللازمة لتحقيق الأغراض الموضّحة في هذه السياسة، والامتثال لالتزاماتنا القانونية بموجب القانون السعودي، وحل النزاعات، وإنفاذ اتفاقياتنا. تشمل فترات الاحتفاظ المحددة:",
        },
        {
          en: (
            <ul className="list-disc ps-6 space-y-1.5">
              <li>Contact form submissions: 3 years from the date of submission, after which they are archived or deleted.</li>
              <li>Job application data: 12 months from the date of application for unsuccessful candidates; for the duration of employment plus 7 years for hired employees (per Saudi labor record requirements).</li>
              <li>Usage data: aggregated and anonymized after 14 months; raw usage data deleted on a rolling basis.</li>
              <li>Cookies: as described in the cookie consent banner, up to a maximum of 24 months for persistent cookies.</li>
            </ul>
          ),
          ar: (
            <ul className="list-disc ps-6 space-y-1.5">
              <li>إرسالات نموذج التواصل: 3 سنوات من تاريخ الإرسال، ثم تُؤرشف أو تُحذف.</li>
              <li>بيانات طلبات التوظيف: 12 شهراً من تاريخ التقديم للمرشحين غير الناجحين؛ ولمدة التوظيف بالإضافة إلى 7 سنوات للموظفين المعيّنين (وفق متطلبات سجلات العمل في السعودية).</li>
              <li>بيانات الاستخدام: تُجمّع وتُجعل مجهولة الهوية بعد 14 شهراً؛ وتُحذف البيانات الخام على أساس دوري.</li>
              <li>ملفات تعريف الارتباط: كما هو موضّح في لافتة الموافقة، بحد أقصى 24 شهراً لملفات تعريف الارتباط الدائمة.</li>
            </ul>
          ),
        },
      ],
    },
    {
      id: "privacy-transfers",
      titleEn: "International Data Transfers",
      titleAr: "نقل البيانات الدولي",
      paragraphs: [
        {
          en: "MHASA is a Saudi-based company, and your personal data is primarily stored and processed within the Kingdom of Saudi Arabia. Where we use third-party service providers located outside the Kingdom (for example, cloud hosting or analytics providers), we ensure such transfers comply with PDPL cross-border transfer requirements and are governed by appropriate data protection agreements.",
          ar: "مهاكسا شركة سعودية، وتُخزَّن بياناتك الشخصية وتُعالَج بشكل أساسي داخل المملكة العربية السعودية. عندما نستخدم مزوّدي خدمات تابعين لجهات خارج المملكة (على سبيل المثال، مزوّدي استضافة سحابية أو تحليلات)، نضمن امتثال هذه النقلات لمتطلبات نقل البيانات عبر الحدود بموجب نظام حماية البيانات الشخصية، وأن تحكمها اتفاقيات حماية بيانات مناسبة.",
        },
        {
          en: "We will not transfer your personal data to countries that do not provide an adequate level of data protection unless appropriate safeguards are in place.",
          ar: "لن ننقل بياناتك الشخصية إلى دول لا توفّر مستوى كافياً من حماية البيانات ما لم تتوفر ضمانات مناسبة.",
        },
      ],
    },
    {
      id: "privacy-changes",
      titleEn: "Changes to This Policy",
      titleAr: "التغييرات على هذه السياسة",
      paragraphs: [
        {
          en: "We may update this Privacy Policy from time to time to reflect changes in our practices, legal requirements, or operational needs. When we do, we will revise the \"Last updated\" date at the top of this page. For material changes that affect your rights, we will provide a more prominent notice (such as a banner on our Site or a direct email to affected users).",
          ar: "قد نُحدّث سياسة الخصوصية هذه من وقت لآخر لتعكس التغييرات في ممارساتنا أو المتطلبات القانونية أو الاحتياجات التشغيلية. عند القيام بذلك، سنُحدّث تاريخ \"آخر تحديث\" أعلى هذه الصفحة. أما التغييرات الجوهرية التي تؤثر على حقوقك، فسنقدّم إشعاراً أكثر بروزاً (مثل لافتة على موقعنا أو بريداً إلكترونياً مباشراً للمستخدمين المتأثرين).",
        },
        {
          en: "We encourage you to review this Policy periodically to stay informed about how we protect your information.",
          ar: "ننصحك بمراجعة هذه السياسة دورياً للبقاء على اطلاع بكيفية حمايتنا لمعلوماتك.",
        },
      ],
    },
    {
      id: "privacy-contact",
      titleEn: "Contact Information",
      titleAr: "معلومات التواصل",
      paragraphs: [
        {
          en: "If you have any questions, concerns, or requests regarding this Privacy Policy or our handling of your personal data, please contact us using the details below:",
          ar: "إذا كان لديك أي أسئلة أو مخاوف أو طلبات بخصوص سياسة الخصوصية هذه أو معالجتنا لبياناتك الشخصية، يُرجى التواصل معنا باستخدام المعلومات التالية:",
        },
        {
          en: (
            <ul className="list-none space-y-2">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-gold mt-1 shrink-0" />
                <span><strong>Email:</strong> <a href="mailto:info@mhaksa.com" className="text-primary hover:text-gold underline-offset-2 hover:underline">info@mhaksa.com</a></span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-gold mt-1 shrink-0" />
                <span><strong>Phone:</strong> <a href="tel:+966138000000" dir="ltr" className="text-primary hover:text-gold underline-offset-2 hover:underline">+966 13 800 0000</a></span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-gold mt-1 shrink-0" />
                <span><strong>Address:</strong> Jubail Industrial City, Eastern Province, Kingdom of Saudi Arabia</span>
              </li>
              <li className="flex items-start gap-2">
                <Scale className="h-4 w-4 text-gold mt-1 shrink-0" />
                <span><strong>Data Protection Officer:</strong> For PDPL-related requests, mark your email with the subject line &quot;DPO Request&quot;.</span>
              </li>
            </ul>
          ),
          ar: (
            <ul className="list-none space-y-2">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-gold mt-1 shrink-0" />
                <span><strong>البريد الإلكتروني:</strong> <a href="mailto:info@mhaksa.com" className="text-primary hover:text-gold underline-offset-2 hover:underline">info@mhaksa.com</a></span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-gold mt-1 shrink-0" />
                <span><strong>الهاتف:</strong> <a href="tel:+966138000000" dir="ltr" className="text-primary hover:text-gold underline-offset-2 hover:underline">+966 13 800 0000</a></span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-gold mt-1 shrink-0" />
                <span><strong>العنوان:</strong> مدينة الجبيل الصناعية، المنطقة الشرقية، المملكة العربية السعودية</span>
              </li>
              <li className="flex items-start gap-2">
                <Scale className="h-4 w-4 text-gold mt-1 shrink-0" />
                <span><strong>مسؤول حماية البيانات:</strong> للطلبات المتعلقة بنظام حماية البيانات الشخصية، يُرجى وضع عنوان &quot;طلب DPO&quot; في بريدك.</span>
              </li>
            </ul>
          ),
        },
      ],
    },
  ],
};

// ============================================================================
// Terms & Conditions Content
// ============================================================================
const TERMS_DOC: LegalDocument = {
  titleEn: "Terms & Conditions",
  titleAr: "الشروط والأحكام",
  eyebrowEn: "Please Read Carefully",
  eyebrowAr: "يُرجى القراءة بعناية",
  introEn:
    "These Terms and Conditions (\"Terms\") govern your access to and use of the MHASA website at mhasa.com (the \"Site\"). By accessing or using the Site, you agree to be bound by these Terms. If you do not agree to any part of these Terms, please discontinue use of the Site immediately.",
  introAr:
    "تحكم هذه الشروط والأحكام (\"الشروط\") دخولك إلى موقع مهاكسا على mhasa.com (\"الموقع\") واستخدامك له. بدخولك إلى الموقع أو استخدامك له، فإنك توافق على الالتزام بهذه الشروط. إذا كنت لا توافق على أي جزء من هذه الشروط، يُرجى التوقف عن استخدام الموقع فوراً.",
  lastUpdatedEn: "1 January 2025",
  lastUpdatedAr: "1 يناير 2025",
  sections: [
    {
      id: "terms-acceptance",
      titleEn: "Acceptance of Terms",
      titleAr: "قبول الشروط",
      paragraphs: [
        {
          en: "By accessing, browsing, or otherwise using our Site, you acknowledge that you have read, understood, and agree to be bound by these Terms and any additional guidelines, rules, or policies referenced herein. These Terms constitute a legally binding agreement between you and Mohd H. Al Marhoon Cont. Est. (\"MHASA\", \"we\", \"us\", or \"our\").",
          ar: "بدخولك إلى موقعنا أو تصفّحك أو استخدامه بأي طريقة أخرى، فإنك تقرّ بأنك قد قرأت وفهمت ووافقت على الالتزام بهذه الشروط وبأي إرشادات أو قواعد أو سياسات إضافية مُشار إليها هنا. تشكّل هذه الشروط اتفاقية ملزمة قانوناً بينك وبين مؤسسة محمد بن حمد المرحون للمقاولات (\"مهاكسا\" أو \"نحن\").",
        },
        {
          en: "If you are accessing the Site on behalf of a company or other legal entity, you represent that you have the authority to bind that entity to these Terms.",
          ar: "إذا كنت تدخل إلى الموقع نيابةً عن شركة أو كيان قانوني آخر، فإنك تُقرّ بأنك تملك الصلاحية لإلزام ذلك الكيان بهذه الشروط.",
        },
      ],
    },
    {
      id: "terms-use",
      titleEn: "Use of the Website",
      titleAr: "استخدام الموقع",
      paragraphs: [
        {
          en: "You may use our Site for lawful purposes only, including learning about our services, contacting us for business inquiries, applying for open positions, and accessing publicly available content. In connection with your use of the Site, you agree NOT to:",
          ar: "يجوز لك استخدام موقعنا للأغراض المشروعة فقط، بما في ذلك التعرف على خدماتنا، والتواصل معنا للاستفسارات التجارية، والتقديم على الوظائف المتاحة، والوصول إلى المحتوى المتاح للعموم. وفيما يتعلق باستخدامك للموقع، توافق على ألا تقوم بـ:",
        },
        {
          en: (
            <ul className="list-disc ps-6 space-y-1.5">
              <li>Use the Site in any way that violates Saudi Arabian laws, regulations, or third-party rights.</li>
              <li>Attempt to gain unauthorized access to any portion of the Site, our systems, or any data stored on them.</li>
              <li>Introduce viruses, malware, or any other malicious code that may harm the Site or its users.</li>
              <li>Interfere with the proper functioning of the Site, including overwhelming it with automated requests (DDoS).</li>
              <li>Scrape, copy, or republish substantial portions of our content without prior written permission.</li>
              <li>Submit false, misleading, or fraudulent information through our contact or application forms.</li>
              <li>Impersonate another person or entity, or misrepresent your affiliation with us.</li>
              <li>Use the Site to send unsolicited communications, advertising, or promotional material.</li>
            </ul>
          ),
          ar: (
            <ul className="list-disc ps-6 space-y-1.5">
              <li>استخدام الموقع بأي طريقة تنتهك القوانين أو اللوائح السعودية أو حقوق الأطراف الثالثة.</li>
              <li>محاولة الوصول غير المصرّح به إلى أي جزء من الموقع أو أنظمتنا أو أي بيانات مخزّنة عليها.</li>
              <li>إدخال فيروسات أو برمجيات خبيثة أو أي رموز ضارة أخرى قد تضرّ بالموقع أو مستخدميه.</li>
              <li>التداخل في الأداء السليم للموقع، بما في ذلك إغراقه بالطلبات الآلية (DDoS).</li>
              <li>كشط أو نسخ أو إعادة نشر أجزاء جوهرية من محتوانا دون إذن كتابي مسبق.</li>
              <li>تقديم معلومات خاطئة أو مضللة أو احتيالية من خلال نماذج التواصل أو التقديم لدينا.</li>
              <li>انتحال شخصية شخص آخر أو كيان، أو إساءة تمثيل ارتباطك بنا.</li>
              <li>استخدام الموقع لإرسال اتصالات أو إعلانات أو مواد ترويجية غير مرغوب فيها.</li>
            </ul>
          ),
        },
        {
          en: "We reserve the right to suspend or terminate access to the Site, without notice, for any user who violates these Terms or whose conduct we believe harmful to us, other users, or third parties.",
          ar: "نحتفظ بالحق في تعليق أو إنهاء الوصول إلى الموقع، دون إشعار، لأي مستخدم ينتهك هذه الشروط أو سلوكه الذي نعتقد أنه ضارّ بنا أو بمستخدمين آخرين أو بأطراف ثالثة.",
        },
      ],
    },
    {
      id: "terms-ip",
      titleEn: "Intellectual Property Rights",
      titleAr: "حقوق الملكية الفكرية",
      paragraphs: [
        {
          en: "All content on this Site — including but not limited to text, graphics, logos, images, audio, video, software code, page layouts, design elements, and downloadable materials (the \"Content\") — is the exclusive property of MHASA or its licensors and is protected by Saudi and international intellectual property laws.",
          ar: "جميع المحتوى على هذا الموقع — بما في ذلك على سبيل المثال لا الحصر النصوص والرسومات والشعارات والصور والصوت والفيديو ورمز البرمجيات وتخطيطات الصفحات وعناصر التصميم والمواد القابلة للتنزيل (\"المحتوى\") — هو ملكية حصرية لمهاكسا أو مرخّصيها ومحميّ بموجب قوانين الملكية الفكرية السعودية والدولية.",
        },
        {
          en: "You may view, download, and print pages from the Site for your personal, non-commercial use only, provided that you do not modify the Content and retain all copyright and other proprietary notices. Any other use — including reproduction, distribution, public display, modification, or incorporation into other works — requires our prior written consent.",
          ar: "يجوز لك عرض وتنزيل وطباعة صفحات من الموقع لاستخدامك الشخصي غير التجاري فقط، شريطة ألا تُعدّل المحتوى وأن تحتفظ بجميع إشعارات حقوق النشر والإشعارات الملكية الأخرى. أي استخدام آخر — بما في ذلك النسخ أو التوزيع أو العرض العام أو التعديل أو الدمج في أعمال أخرى — يتطلب موافقتنا الكتابية المسبقة.",
        },
        {
          en: "The \"MHASA\" name, logo, and any related marks are trademarks of Mohd H. Al Marhoon Cont. Est. and may not be used without our express written permission.",
          ar: "اسم \"مهاكسا\" وشعارها وأي علامات ذات صلة هي علامات تجارية لمؤسسة محمد بن حمد المرحون للمقاولات ولا يجوز استخدامها دون إذن كتابي صريح منا.",
        },
      ],
    },
    {
      id: "terms-services",
      titleEn: "Service Descriptions",
      titleAr: "أوصاف الخدمات",
      paragraphs: [
        {
          en: "The information provided on this Site regarding MHASA's services, capabilities, projects, and expertise is for general informational purposes only. While we make every effort to keep the information accurate and up to date, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of the information for any particular purpose.",
          ar: "المعلومات المقدّمة على هذا الموقع بخصوص خدمات مهاكسا وقدراتها ومشاريعها وخبراتها هي لأغراض إعلامية عامة فقط. وعلى الرغم من بذلنا لكل جهد للحفاظ على دقة المعلومات وحداثتها، فإننا لا نقدّم أي إقرارات أو ضمانات من أي نوع، صريحة أو ضمنية، بشأن اكتمال أو دقة أو موثوقية أو ملاءمة المعلومات لأي غرض معين.",
        },
        {
          en: "Any reliance you place on such information is strictly at your own risk. Specific terms, pricing, scope of work, and deliverables for any service engagement will be governed by a separate written contract between you and MHASA.",
          ar: "أي اعتماد منك على هذه المعلومات يكون على مسؤوليتك الخاصة تماماً. الشروط المحددة والتسعير ونطاق العمل والمخرجات لأي ارتباط خدمة ستخضع لعقد كتابي منفصل بينك وبين مهاكسا.",
        },
        {
          en: "Nothing on this Site constitutes a formal offer, quotation, or commitment to provide any service. A binding agreement is formed only upon signature of a written contract by an authorized representative of MHASA.",
          ar: "لا يُشكّل أي شيء على هذا الموقع عرضاً رسمياً أو تسعيراً أو التزاماً بتقديم أي خدمة. لا يُعقد اتفاق ملزم إلا عند توقيع عقد كتابي من قِبل ممثل مخوّل من مهاكسا.",
        },
      ],
    },
    {
      id: "terms-submissions",
      titleEn: "User Submissions",
      titleAr: "إرسالات المستخدمين",
      paragraphs: [
        {
          en: "When you submit information through our contact form, job application portal, or any other channel on the Site, you represent and warrant that:",
          ar: "عند تقديمك معلومات عبر نموذج التواصل أو بوابة التقديم على الوظائف أو أي قناة أخرى على الموقع، فإنك تُقرّ وتضمن أن:",
        },
        {
          en: (
            <ul className="list-disc ps-6 space-y-1.5">
              <li>The information is accurate, complete, and not misleading to the best of your knowledge.</li>
              <li>You have the right to submit the information and any associated documents (such as a resume).</li>
              <li>Submitting the information does not violate any confidentiality obligation, non-compete agreement, or third-party intellectual property right.</li>
              <li>For job applications, the documents you upload (resume, certifications) are your own and accurately reflect your qualifications.</li>
            </ul>
          ),
          ar: (
            <ul className="list-disc ps-6 space-y-1.5">
              <li>المعلومات دقيقة وكاملة وغير مضلّلة على حد علمك.</li>
              <li>لديك الحق في تقديم المعلومات وأي مستندات مرتبطة بها (مثل السيرة الذاتية).</li>
              <li>تقديم المعلومات لا ينتهك أي التزام بسرّية أو اتفاقية عدم منافسة أو حقوق ملكية فكرية لأطراف ثالثة.</li>
              <li>بالنسبة لطلبات التوظيف، المستندات التي ترفعها (السيرة الذاتية، الشهادات) هي ملكك وتعكس مؤهلاتك بدقة.</li>
            </ul>
          ),
        },
        {
          en: "You grant MHASA a non-exclusive, royalty-free, worldwide license to use, store, process, and share the submitted information for the purposes of responding to your inquiry, evaluating your application, and conducting our business operations, in accordance with our Privacy Policy.",
          ar: "تمنح مهاكسا ترخيصاً غير حصريّاً وخالياً من الإتاوات وعالمياً لاستخدام وتخزين ومعالجة ومشاركة المعلومات المقدّمة لأغراض الرد على استفسارك أو تقييم طلبك أو إدارة عملياتنا التجارية، وفقاً لسياسة الخصوصية الخاصة بنا.",
        },
      ],
    },
    {
      id: "terms-liability",
      titleEn: "Limitation of Liability",
      titleAr: "تحديد المسؤولية",
      paragraphs: [
        {
          en: "To the maximum extent permitted by Saudi law, MHASA, its officers, directors, employees, agents, and affiliates shall not be liable for any direct, indirect, incidental, consequential, special, or punitive damages — including but not limited to loss of profits, data, business opportunities, or goodwill — arising out of or in connection with your access to, use of, or inability to use the Site, even if we have been advised of the possibility of such damages.",
          ar: "إلى أقصى حد يسمح به القانون السعودي، لا تتحمّل مهاكسا ومسؤولوها ومديروها وموظفوها ووكلاؤها والشركات التابعة لها أي مسؤولية عن أي أضرار مباشرة أو غير مباشرة أو عرضية أو تبعية أو خاصة أو عقابية — بما في ذلك على سبيل المثال لا الحصر فقدان الأرباح أو البيانات أو فرص الأعمال أو السمعة — الناشئة عن أو المرتبطة بدخولك إلى الموقع أو استخدامه أو عدم قدرتك على استخدامه، حتى لو تم إبلاغنا بإمكانية حدوث مثل هذه الأضرار.",
        },
        {
          en: "If, notwithstanding the foregoing, MHASA is found liable for any damages, our total aggregate liability for any claim arising out of or relating to the Site shall not exceed the greater of (a) the amount you paid us for access to the Site in the twelve months preceding the claim, or (b) 100 SAR. Since access to the Site is provided free of charge, this limitation is reasonable and reflects the allocation of risk between the parties.",
          ar: "إذا، على الرغم مما سبق، تمّ الحكم بمسؤولية مهاكسا عن أي أضرار، فإن إجمالي مسؤوليتنا عن أي مطالبة ناشئة عن أو متعلقة بالموقع لن يتجاوز مبلغ (أ) المبلغ الذي دفعته لنا مقابل الوصول إلى الموقع في الأشهر الاثني عشر السابقة للمطالبة، أو (ب) 100 ريال سعودي، أيهما أكبر. وبما أن الوصول إلى الموقع مجاني، فإن هذا التحديد معقول ويعكس توزيع المخاطر بين الطرفين.",
        },
      ],
    },
    {
      id: "terms-indemnification",
      titleEn: "Indemnification",
      titleAr: "التعويض",
      paragraphs: [
        {
          en: "You agree to indemnify, defend, and hold harmless MHASA, its officers, directors, employees, agents, and affiliates from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or in connection with:",
          ar: "توافق على تعويض مهاكسا ومسؤوليها ومديريها وموظفيها ووكلائها والشركات التابعة لها والدفاع عنهم وعدم إلحاق الضرر بهم من أي مطالبات أو مسؤوليات أو أضرار أو خسائر أو تكاليف أو نفقات (بما في ذلك أتعاب المحاماة المعقولة) الناشئة عن أو المرتبطة بـ:",
        },
        {
          en: (
            <ul className="list-disc ps-6 space-y-1.5">
              <li>Your breach of these Terms or any representation or warranty made herein.</li>
              <li>Your violation of any law or the rights of any third party.</li>
              <li>Information or materials you submit through the Site, including their inaccuracy or infringing nature.</li>
              <li>Your misuse of the Site or any content available on it.</li>
            </ul>
          ),
          ar: (
            <ul className="list-disc ps-6 space-y-1.5">
              <li>إخلالك بهذه الشروط أو أي تمثيل أو ضمان قُدّم هنا.</li>
              <li>انتهاكك لأي قانون أو لحقوق أي طرف ثالث.</li>
              <li>المعلومات أو المواد التي تقدّمها عبر الموقع، بما في ذلك عدم دقتها أو طبيعتها المخالفة.</li>
              <li>إساءة استخدامك للموقع أو أي محتوى متاح عليه.</li>
            </ul>
          ),
        },
      ],
    },
    {
      id: "terms-third-party",
      titleEn: "Third-Party Links",
      titleAr: "روابط الأطراف الثالثة",
      paragraphs: [
        {
          en: "Our Site may contain links to third-party websites, social media pages, or resources that are not owned or controlled by MHASA. These links are provided for your convenience only and do not signify any endorsement, sponsorship, or affiliation with the third-party sites.",
          ar: "قد يحتوي موقعنا على روابط لمواقع أو صفحات وسائل تواصل اجتماعي أو موارد تابعة لأطراف ثالثة ليست مملوكة أو خاضعة لسيطرة مهاكسا. هذه الروابط مقدّمة لراحتك فقط ولا تُظهر أي تأييد أو رعاية أو ارتباط بمواقع الطرف الثالث.",
        },
        {
          en: "We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites. You acknowledge that MHASA shall not be liable for any damage or loss caused by your use of such third-party sites, and we encourage you to review their terms and policies before using them.",
          ar: "ليس لدينا سيطرة على محتوى أو سياسات الخصوصية أو ممارسات أي مواقع تابعة لأطراف ثالثة ولا نتحمل أي مسؤولية عنها. أنت تقرّ بأن مهاكسا لن تكون مسؤولة عن أي ضرر أو خسارة ناتجة عن استخدامك لمواقع الأطراف الثالثة هذه، وننصحك بمراجعة شروطها وسياساتها قبل استخدامها.",
        },
      ],
    },
    {
      id: "terms-governing-law",
      titleEn: "Governing Law & Dispute Resolution",
      titleAr: "القانون الحاكم وحل النزاعات",
      paragraphs: [
        {
          en: "These Terms and any dispute arising out of or in connection with them shall be governed by and construed in accordance with the laws of the Kingdom of Saudi Arabia, without regard to its conflict of law principles.",
          ar: "تخضع هذه الشروط وأي نزاع ناشئ عنها أو متعلق بها لقوانين المملكة العربية السعودية وتُفسَّر وفقاً لها، دون اعتبار لمبادئ تنازع القوانين.",
        },
        {
          en: "Any legal action or proceeding arising under these Terms will be brought exclusively in the courts of the Eastern Province of the Kingdom of Saudi Arabia, and you hereby irrevocably consent to the personal jurisdiction and venue therein.",
          ar: "أي إجراء قانوني أو دعوى ناشئة بموجب هذه الشروط ستُرفع حصراً في محاكم المنطقة الشرقية في المملكة العربية السعودية، وتوافق بموجب هذا بشكل غير قابل للنقض على الولاية الشخصية والمحكمة المختصة فيها.",
        },
        {
          en: "Before initiating litigation, the parties agree to attempt in good faith to resolve any dispute through amicable negotiation for a period of 30 days. If the dispute cannot be resolved through negotiation, either party may submit the matter to the appropriate Saudi court.",
          ar: "قبل البدء في التقاضي، يوافق الطرفان على محاولة حل أي نزاع بحسن نية من خلال التفاوض الودّي لمدة 30 يوماً. إذا تعذّر حل النزاع من خلال التفاوض، يجوز لأي طرف رفع الأمر إلى المحكمة السعودية المختصة.",
        },
      ],
    },
    {
      id: "terms-changes",
      titleEn: "Changes to These Terms",
      titleAr: "التغييرات على هذه الشروط",
      paragraphs: [
        {
          en: "We reserve the right to modify these Terms at any time at our sole discretion. When we do, we will revise the \"Last updated\" date at the top of this page. Your continued use of the Site after any changes take effect constitutes your acceptance of the revised Terms.",
          ar: "نحتفظ بالحق في تعديل هذه الشروط في أي وقت وفق تقديرنا وحده. عند القيام بذلك، سنُحدّث تاريخ \"آخر تحديث\" أعلى هذه الصفحة. استمرارك في استخدام الموقع بعد سريان أي تغييرات يُشكّل قبولك للشروط المُعدّلة.",
        },
        {
          en: "We encourage you to review these Terms periodically to stay informed of any updates. If you do not agree to the revised Terms, please discontinue use of the Site.",
          ar: "ننصحك بمراجعة هذه الشروط دورياً للبقاء على اطلاع بأي تحديثات. إذا كنت لا توافق على الشروط المُعدّلة، يُرجى التوقف عن استخدام الموقع.",
        },
      ],
    },
    {
      id: "terms-severability",
      titleEn: "Severability",
      titleAr: "قابلية الفصل",
      paragraphs: [
        {
          en: "If any provision of these Terms is found by a court of competent jurisdiction to be invalid, illegal, or unenforceable, that provision shall be modified to the minimum extent necessary to make it valid and enforceable, or, if modification is not possible, severed from these Terms. The remaining provisions shall continue in full force and effect.",
          ar: "إذا وجدت محكمة مختصة أن أي حكم في هذه الشروط غير صالح أو غير قانوني أو غير قابل للإنفاذ، سيتم تعديل ذلك الحكم بالحد الأدنى اللازم لجعله صالحاً وقابلاً للإنفاذ، أو، إذا تعذّر التعديل، سيتم فصله من هذه الشروط. وستظل الأحكام المتبقية سارية المفعول بالكامل.",
        },
        {
          en: "The failure of MHASA to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision.",
          ar: "عدم قيام مهاكسا بإنفاذ أي حق أو حكم من هذه الشروط لا يُشكّل تنازلاً عن ذلك الحق أو الحكم.",
        },
      ],
    },
    {
      id: "terms-contact",
      titleEn: "Contact Information",
      titleAr: "معلومات التواصل",
      paragraphs: [
        {
          en: "If you have any questions or concerns about these Terms or your use of the Site, please contact us at:",
          ar: "إذا كان لديك أي أسئلة أو مخاوف بخصوص هذه الشروط أو استخدامك للموقع، يُرجى التواصل معنا على:",
        },
        {
          en: (
            <ul className="list-none space-y-2">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-gold mt-1 shrink-0" />
                <span><strong>Email:</strong> <a href="mailto:info@mhaksa.com" className="text-primary hover:text-gold underline-offset-2 hover:underline">info@mhaksa.com</a></span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-gold mt-1 shrink-0" />
                <span><strong>Phone:</strong> <a href="tel:+966138000000" dir="ltr" className="text-primary hover:text-gold underline-offset-2 hover:underline">+966 13 800 0000</a></span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-gold mt-1 shrink-0" />
                <span><strong>Address:</strong> Jubail Industrial City, Eastern Province, Kingdom of Saudi Arabia</span>
              </li>
              <li className="flex items-start gap-2">
                <ExternalLink className="h-4 w-4 text-gold mt-1 shrink-0" />
                <span><strong>Registered Entity:</strong> Mohd H. Al Marhoon Cont. Est. — Commercial Registration available upon request.</span>
              </li>
            </ul>
          ),
          ar: (
            <ul className="list-none space-y-2">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-gold mt-1 shrink-0" />
                <span><strong>البريد الإلكتروني:</strong> <a href="mailto:info@mhaksa.com" className="text-primary hover:text-gold underline-offset-2 hover:underline">info@mhaksa.com</a></span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-gold mt-1 shrink-0" />
                <span><strong>الهاتف:</strong> <a href="tel:+966138000000" dir="ltr" className="text-primary hover:text-gold underline-offset-2 hover:underline">+966 13 800 0000</a></span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-gold mt-1 shrink-0" />
                <span><strong>العنوان:</strong> مدينة الجبيل الصناعية، المنطقة الشرقية، المملكة العربية السعودية</span>
              </li>
              <li className="flex items-start gap-2">
                <ExternalLink className="h-4 w-4 text-gold mt-1 shrink-0" />
                <span><strong>الكيان المسجّل:</strong> مؤسسة محمد بن حمد المرحون للمقاولات — السجل التجاري متاح عند الطلب.</span>
              </li>
            </ul>
          ),
        },
      ],
    },
  ],
};

// ============================================================================
// Exports — PrivacyView + TermsView wrap the shared LegalLayout.
// ============================================================================
export function PrivacyView() {
  const { t } = useLocale();
  return (
    <div id="legal-top">
      <LegalLayout
        doc={PRIVACY_DOC}
        breadcrumb={t.common.privacyPolicy}
        icon={Lock}
      />
    </div>
  );
}

export function TermsView() {
  const { t } = useLocale();
  return (
    <div id="legal-top">
      <LegalLayout
        doc={TERMS_DOC}
        breadcrumb={t.common.terms}
        icon={Scale}
      />
    </div>
  );
}
