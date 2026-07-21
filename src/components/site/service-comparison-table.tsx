// ============================================================================
// Service Comparison Table — features matrix across all services.
// Shows a horizontal-scrollable table with services as columns and
// their capabilities as rows. Sticky first column for readability.
// ============================================================================

"use client";

import { motion } from "framer-motion";
import { CheckCircle2, X, ArrowRight, Table2 } from "lucide-react";
import { SectionHeading, FadeIn } from "@/components/site/primitives";
import { useServices } from "@/lib/hooks/use-queries";
import { useLocale } from "@/lib/hooks/use-locale";
import { navigateToService } from "@/lib/store";
import type { ServiceDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

// Capability rows — each maps a label to a function that checks if a service
// has that capability based on its features/description text.
interface CapabilityRow {
  labelEn: string;
  labelAr: string;
  check: (svc: ServiceDTO) => boolean;
}

const capabilities: CapabilityRow[] = [
  {
    labelEn: "Large Diameter (≥ DN600)",
    labelAr: "قطر كبير (≥ DN600)",
    check: (s) => /DN600|DN900|DN1200|DN1600|DN3000|DN4000|large.?diameter/i.test(s.description + " " + s.features.join(" ")),
  },
  {
    labelEn: "High Pressure Service",
    labelAr: "خدمة الضغط العالي",
    check: (s) => /pressure|1500\s*PSI|high.?pressure/i.test(s.description + " " + s.features.join(" ")),
  },
  {
    labelEn: "Corrosion Resistant",
    labelAr: "مقاوم للتآكل",
    check: (s) => /corros|H2S|CO2|acid|chemical|vinylester/i.test(s.description + " " + s.features.join(" ")),
  },
  {
    labelEn: "Sewer / Drainage",
    labelAr: "الصرف والتصريف",
    check: (s) => /sewer|drainage|forcemain|gravity/i.test(s.description + " " + s.features.join(" ")),
  },
  {
    labelEn: "Custom Fabrication",
    labelAr: "تصنيع مخصص",
    check: (s) => /fabric|custom|filament|hand.?lay|bespoke/i.test(s.description + " " + s.features.join(" ")),
  },
  {
    labelEn: "Storage Tanks / Vessels",
    labelAr: "خزانات وأوعية",
    check: (s) => /tank|vessel|storage|scrubber/i.test(s.description + " " + s.features.join(" ")),
  },
  {
    labelEn: "Engineering Design",
    labelAr: "تصميم هندسي",
    check: (s) => /engineering|design|hydraulic|stress.?analy|consultan/i.test(s.description + " " + s.features.join(" ")),
  },
  {
    labelEn: "Project Management",
    labelAr: "إدارة المشاريع",
    check: (s) => /project.?manage|PMP|supervision/i.test(s.description + " " + s.features.join(" ")),
  },
  {
    labelEn: "Aramco / SABIC Approved",
    labelAr: "معتمد من أرامكو/سابك",
    check: (s) => /aramco|sabic|SATORP|sadara|SWCC|marafiq|royal.?commission|API\s*15|ASME|AWWA|ISO\s*45001/i.test(s.description + " " + s.features.join(" ")),
  },
];

export function ServiceComparisonTable() {
  const { data: services } = useServices();
  const { locale } = useLocale();
  const list = services ?? [];

  if (list.length < 2) return null;

  return (
    <section className="section-pad bg-muted/30">
      <div className="container mx-auto px-6">
        <SectionHeading
          eyebrow={locale === "ar" ? "مقارنة الخدمات" : "Service Comparison"}
          title={locale === "ar" ? "قارن قدراتنا" : "Compare Our Capabilities"}
          subtitle={
            locale === "ar"
              ? "جدول مقارنة شامل لمساعدتك في اختيار الحل المناسب لمشروعك."
              : "A comprehensive comparison matrix to help you choose the right solution for your project."
          }
        />

        <FadeIn delay={0.2} className="mt-12">
          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
            <table className="w-full border-collapse min-w-[700px]">
              {/* Header row — service names */}
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="sticky start-0 z-10 bg-muted/40 p-4 text-start text-xs font-bold uppercase tracking-wider text-muted-foreground min-w-[180px]">
                    <div className="flex items-center gap-1.5">
                      <Table2 className="h-3.5 w-3.5 text-gold" />
                      {locale === "ar" ? "القدرة" : "Capability"}
                    </div>
                  </th>
                  {list.map((svc) => (
                    <th
                      key={svc.id}
                      className="p-4 text-center min-w-[120px] group cursor-pointer"
                      onClick={() => navigateToService(svc.slug)}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {locale === "ar" ? (svc.titleAr ?? svc.title) : svc.title}
                        </span>
                        <span className="text-[10px] text-gold opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-0.5">
                          {locale === "ar" ? "التفاصيل" : "Details"}
                          <ArrowRight className="h-2.5 w-2.5 rtl:rotate-180" />
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {capabilities.map((cap, rowIdx) => (
                  <motion.tr
                    key={cap.labelEn}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: rowIdx * 0.04 }}
                    className={cn(
                      "border-b border-border/60 transition-colors hover:bg-muted/30",
                      rowIdx % 2 === 1 && "bg-muted/10"
                    )}
                  >
                    <td className="sticky start-0 z-10 bg-inherit p-4 text-sm font-medium text-foreground">
                      {locale === "ar" ? cap.labelAr : cap.labelEn}
                    </td>
                    {list.map((svc) => {
                      const has = cap.check(svc);
                      return (
                        <td key={svc.id} className="p-4 text-center">
                          {has ? (
                              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                <CheckCircle2 className="h-4 w-4" />
                              </span>
                          ) : (
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted/50 text-muted-foreground/40">
                              <X className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle2 className="h-3 w-3" />
              </span>
              {locale === "ar" ? "متوفر" : "Available"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted/50 text-muted-foreground/40">
                <X className="h-2.5 w-2.5" />
              </span>
              {locale === "ar" ? "غير متوفر" : "Not applicable"}
            </span>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
