// ============================================================================
// Quick Quote Widget — slide-out panel with a compact inquiry form,
// accessible from any view via a floating tab button.
// ============================================================================

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, CheckCircle2, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useLocale } from "@/lib/hooks/use-locale";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

export function QuickQuoteWidget() {
  const quoteOpen = useAppStore((s) => s.quoteOpen);
  const setQuoteOpen = useAppStore((s) => s.setQuoteOpen);
  const { t, locale } = useLocale();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    subject: locale === "ar" ? "طلب عرض سعر سريع" : "Quick Quote Request",
    message: "",
    projectBudget: "",
    website: "", // honeypot
  });

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.website) {
      setQuoteOpen(false);
      return; // honeypot
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setDone(true);
      toast.success(json.message ?? "Request submitted!");
      setForm({
        name: "", company: "", email: "", phone: "",
        subject: locale === "ar" ? "طلب عرض سعر سريع" : "Quick Quote Request",
        message: "", projectBudget: "", website: "",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setQuoteOpen(false);
    setTimeout(() => setDone(false), 300);
  };

  return (
    <>
      {/* Floating tab trigger — only visible when closed */}
      <AnimatePresence>
        {!quoteOpen && (
          <motion.button
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ delay: 1.5, type: "spring" }}
            onClick={() => setQuoteOpen(true)}
            className="fixed top-1/2 -translate-y-1/2 end-0 z-40 flex items-center gap-2 rounded-s-xl bg-gold py-4 ps-3 pe-2 text-gold-foreground shadow-2xl shadow-gold/30 hover:ps-4 transition-all"
            aria-label={t.actions.requestQuote}
          >
            <span className="[writing-mode:vertical-rl] rotate-180 text-xs font-bold uppercase tracking-widest whitespace-nowrap">
              {locale === "ar" ? "اطلب عرض سعر" : "Quick Quote"}
            </span>
            {locale === "ar" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Slide-out panel */}
      <AnimatePresence>
        {quoteOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />
            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed top-0 end-0 z-50 h-full w-full max-w-md bg-background shadow-2xl overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-navy text-white px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/20 text-gold">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-base">
                      {locale === "ar" ? "طلب عرض سعر سريع" : "Quick Quote Request"}
                    </div>
                    <div className="text-xs text-white/60">
                      {locale === "ar" ? "رد خلال 24 ساعة" : "Response within 24 hours"}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={close}
                  className="text-white hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-5">
                {done ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                      {locale === "ar" ? "تم إرسال طلبك!" : "Request Submitted!"}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                      {locale === "ar"
                        ? "شكراً لتواصلك مع مهاكسا. سيتواصل معك فريقنا خلال 24 ساعة."
                        : "Thank you for reaching out to MHASA. Our team will respond within 24 hours."}
                    </p>
                    <Button onClick={close} className="mt-6 bg-navy text-white hover:bg-navy-light">
                      {locale === "ar" ? "إغلاق" : "Close"}
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    {/* Honeypot */}
                    <input
                      type="text"
                      name="website"
                      value={form.website}
                      onChange={(e) => update("website", e.target.value)}
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                    />

                    <div>
                      <Label htmlFor="qq-name" className="text-sm font-medium">
                        {t.common.name} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="qq-name"
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        required
                        className="mt-1 h-10"
                      />
                    </div>

                    <div>
                      <Label htmlFor="qq-company" className="text-sm font-medium">
                        {t.common.company} <span className="text-muted-foreground text-xs">({t.common.optional})</span>
                      </Label>
                      <Input
                        id="qq-company"
                        value={form.company}
                        onChange={(e) => update("company", e.target.value)}
                        className="mt-1 h-10"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="qq-email" className="text-sm font-medium">
                          {t.common.email} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="qq-email"
                          type="email"
                          value={form.email}
                          onChange={(e) => update("email", e.target.value)}
                          required
                          className="mt-1 h-10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="qq-phone" className="text-sm font-medium">
                          {t.common.phone} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="qq-phone"
                          value={form.phone}
                          onChange={(e) => update("phone", e.target.value)}
                          required
                          className="mt-1 h-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="qq-budget" className="text-sm font-medium">
                        {t.common.budgetLabel}
                      </Label>
                      <Select value={form.projectBudget || "none"} onValueChange={(v) => update("projectBudget", v === "none" ? "" : v)}>
                        <SelectTrigger id="qq-budget" className="mt-1 h-10">
                          <SelectValue placeholder={t.common.selectBudget} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t.common.selectBudget}</SelectItem>
                          {t.budgets.map((b) => (
                            <SelectItem key={b} value={b}>{b}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="qq-message" className="text-sm font-medium">
                        {t.common.message} <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="qq-message"
                        value={form.message}
                        onChange={(e) => update("message", e.target.value)}
                        required
                        rows={3}
                        className="mt-1 resize-none"
                        placeholder={locale === "ar"
                          ? "اكتب تفاصيل مشروعك..."
                          : "Describe your project requirements..."}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gold text-gold-foreground hover:bg-gold/90 font-semibold h-11"
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          {locale === "ar" ? "إرسال الطلب" : "Submit Request"}
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center pt-1">
                      {locale === "ar"
                        ? "بالضغط على إرسال، توافق على سياسة الخصوصية."
                        : "By submitting, you agree to our Privacy Policy."}
                    </p>
                  </form>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
