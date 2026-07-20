// ============================================================================
// Project Comparison — select 2-3 projects and compare side-by-side.
// Floating compare bar appears when projects are selected, opens a modal
// with a comparison table.
// ============================================================================

"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, GitCompare, Plus, Check, ArrowRight, Building2, MapPin, Wallet, Calendar, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/lib/hooks/use-queries";
import { useLocale } from "@/lib/hooks/use-locale";
import { useAppStore } from "@/lib/store";
import type { ProjectDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

const MAX_COMPARE = 3;

export function ProjectComparison() {
  const { data: allProjects } = useProjects();
  const { locale, pick } = useLocale();
  const openProject = useAppStore((s) => s.openProject);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const selectedProjects = useMemo(
    () => (allProjects ?? []).filter((p) => selectedIds.includes(p.id)),
    [allProjects, selectedIds]
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  };

  const removeSelected = (id: string) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  const clearAll = () => {
    setSelectedIds([]);
    setModalOpen(false);
  };

  const formatCurrency = (val: number | null, currency: string) => {
    if (val == null) return "—";
    try {
      return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(val);
    } catch {
      return `${val} ${currency}`;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
        year: "numeric",
        month: "short",
      });
    } catch {
      return dateStr;
    }
  };

  const comparisonRows = [
    { icon: Building2, label: locale === "ar" ? "العميل" : "Client", get: (p: ProjectDTO) => p.clientName },
    { icon: Tag, label: locale === "ar" ? "الفئة" : "Category", get: (p: ProjectDTO) => p.category },
    { icon: MapPin, label: locale === "ar" ? "الموقع" : "Location", get: (p: ProjectDTO) => p.location ?? "—" },
    { icon: Wallet, label: locale === "ar" ? "القيمة" : "Value", get: (p: ProjectDTO) => formatCurrency(p.value, p.currency) },
    { icon: Calendar, label: locale === "ar" ? "الإنجاز" : "Completed", get: (p: ProjectDTO) => formatDate(p.completionDate) },
    { icon: Building2, label: locale === "ar" ? "مميز" : "Featured", get: (p: ProjectDTO) => p.isFeatured ? "✓" : "—" },
  ];

  return (
    <>
      {/* Floating compare bar — shows when 1+ selected */}
      <AnimatePresence>
        {selectedIds.length > 0 && !modalOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed bottom-4 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 z-40 w-[95%] max-w-2xl"
          >
            <div className="rounded-2xl border border-gold/30 bg-card shadow-2xl p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <GitCompare className="h-5 w-5 text-gold flex-shrink-0" />
                  <span className="text-sm font-semibold text-foreground flex-shrink-0">
                    {selectedIds.length}/{MAX_COMPARE}
                  </span>
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                    {selectedProjects.map((p) => (
                      <Badge key={p.id} variant="secondary" className="flex-shrink-0 gap-1 bg-muted/60">
                        <span className="max-w-[100px] truncate">{pick(p.title, p.titleAr) ?? p.title}</span>
                        <button onClick={() => removeSelected(p.id)} className="hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" variant="ghost" onClick={clearAll} className="h-8 text-xs">
                    {locale === "ar" ? "مسح" : "Clear"}
                  </Button>
                  <Button
                    size="sm"
                    disabled={selectedIds.length < 2}
                    onClick={() => setModalOpen(true)}
                    className="bg-gold text-gold-foreground hover:bg-gold/90 h-8 text-xs font-semibold"
                  >
                    <GitCompare className="h-3.5 w-3.5" />
                    {locale === "ar" ? "قارن" : "Compare"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project picker — quick add more projects */}
      <AnimatePresence>
        {pickerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setPickerOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg max-h-[70vh] overflow-y-auto rounded-2xl bg-card shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-navy text-white px-5 py-4 flex items-center justify-between">
                <h3 className="font-display font-bold">
                  {locale === "ar" ? "إضافة مشروع للمقارنة" : "Add Project to Compare"}
                </h3>
                <button onClick={() => setPickerOpen(false)} className="text-white/70 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-3 space-y-1">
                {(allProjects ?? [])
                  .filter((p) => !selectedIds.includes(p.id))
                  .map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        toggleSelect(p.id);
                        setPickerOpen(false);
                      }}
                      disabled={selectedIds.length >= MAX_COMPARE}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="h-4 w-4 text-gold" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{pick(p.title, p.titleAr) ?? p.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{p.clientName} · {p.category}</div>
                      </div>
                    </button>
                  ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison modal */}
      <AnimatePresence>
        {modalOpen && selectedProjects.length >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 28 }}
              className="w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl bg-card shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border bg-navy px-5 py-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/20 text-gold">
                    <GitCompare className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold">
                      {locale === "ar" ? "مقارنة المشاريع" : "Project Comparison"}
                    </h3>
                    <p className="text-xs text-white/60">{selectedProjects.length} {locale === "ar" ? "مشاريع" : "projects"}</p>
                  </div>
                </div>
                <button onClick={() => setModalOpen(false)} className="text-white/70 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Comparison table */}
              <div className="overflow-x-auto flex-1">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="sticky start-0 z-10 bg-card p-4 text-start text-xs font-bold uppercase tracking-wider text-muted-foreground min-w-[120px]">
                        {locale === "ar" ? "الخاصية" : "Attribute"}
                      </th>
                      {selectedProjects.map((p) => (
                        <th key={p.id} className="p-4 text-center min-w-[180px]">
                          <button
                            onClick={() => { setModalOpen(false); openProject(p.slug); }}
                            className="group"
                          >
                            <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                              {pick(p.title, p.titleAr) ?? p.title}
                            </div>
                            <div className="mt-1 inline-flex items-center gap-0.5 text-[10px] text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                              {locale === "ar" ? "عرض" : "View"}
                              <ArrowRight className="h-2.5 w-2.5 rtl:rotate-180" />
                            </div>
                          </button>
                          <button
                            onClick={() => removeSelected(p.id)}
                            className="mt-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-3 w-3 inline" />
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row, idx) => (
                      <tr key={idx} className={cn("border-b border-border/60", idx % 2 === 1 && "bg-muted/10")}>
                        <td className="sticky start-0 z-10 bg-inherit p-4 text-sm font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            <row.icon className="h-3.5 w-3.5 text-gold" />
                            {row.label}
                          </div>
                        </td>
                        {selectedProjects.map((p) => (
                          <td key={p.id} className="p-4 text-center text-sm text-foreground/80">
                            {row.get(p)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {/* Description row */}
                    <tr>
                      <td className="sticky start-0 z-10 bg-card p-4 text-sm font-medium text-foreground align-top">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-gold" />
                          {locale === "ar" ? "الوصف" : "Description"}
                        </div>
                      </td>
                      {selectedProjects.map((p) => (
                        <td key={p.id} className="p-4 text-xs text-muted-foreground align-top">
                          <p className="line-clamp-4">{pick(p.description, p.descriptionAr) ?? p.description}</p>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-border p-4 bg-muted/30">
                <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)} disabled={selectedIds.length >= MAX_COMPARE}>
                  <Plus className="h-4 w-4" />
                  {locale === "ar" ? "إضافة مشروع" : "Add Project"}
                </Button>
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  {locale === "ar" ? "مسح الكل" : "Clear All"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
