// ============================================================================
// Floating Actions + Back To Top + Cookie Consent — persistent UI overlays.
// ============================================================================

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Phone, MessageCircle, X, Cookie, ShieldCheck, BarChart3, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useSiteData } from "@/lib/hooks/use-queries";
import { useLocale } from "@/lib/hooks/use-locale";
import { navigateToView } from "@/lib/store";

// -------- Back To Top --------
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-24 end-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-navy text-white shadow-xl hover:bg-navy-light transition-colors mb-[env(safe-area-inset-bottom)]"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// -------- Floating WhatsApp + Call --------
export function FloatingActions() {
  const { data: siteData } = useSiteData();
  const settings = siteData?.settings;
  const { t } = useLocale();

  const whatsappUrl = settings?.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent("Hello MHASA, I would like to inquire about your services.")}`
    : null;

  return (
    <div className="fixed bottom-safe end-4 z-40 flex flex-col gap-3">
      {whatsappUrl && (
        <motion.a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring" }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/30"
          aria-label={t.actions.whatsapp}
        >
          <MessageCircle className="h-7 w-7" />
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
          <span className="pointer-events-none absolute end-full me-3 whitespace-nowrap rounded-lg bg-navy px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
            {t.actions.whatsapp}
          </span>
        </motion.a>
      )}
      {settings?.phonePrimary && (
        <motion.a
          href={`tel:${settings.phonePrimary}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.2, type: "spring" }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gold text-gold-foreground shadow-xl shadow-gold/30"
          aria-label={t.actions.callNow}
        >
          <Phone className="h-6 w-6" />
          <span className="pointer-events-none absolute end-full me-3 whitespace-nowrap rounded-lg bg-navy px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
            {t.actions.callNow}
          </span>
        </motion.a>
      )}
    </div>
  );
}

// -------- Cookie Consent --------
export function CookieConsent() {
  const [show, setShow] = useState(false);
  const [prefOpen, setPrefOpen] = useState(false);
  const [prefs, setPrefs] = useState(() => {
    // Lazy init from localStorage — avoids setState-in-effect lint issue
    if (typeof window === "undefined") {
      return { necessary: true, analytics: true, marketing: false };
    }
    try {
      const saved = localStorage.getItem("mhasa-cookie-prefs");
      if (saved) return { necessary: true, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return { necessary: true, analytics: true, marketing: false };
  });
  const { t } = useLocale();

  useEffect(() => {
    const consent = localStorage.getItem("mhasa-cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  const handle = (accepted: boolean) => {
    localStorage.setItem("mhasa-cookie-consent", accepted ? "accepted" : "declined");
    if (accepted) {
      localStorage.setItem("mhasa-cookie-prefs", JSON.stringify(prefs));
    } else {
      localStorage.setItem("mhasa-cookie-prefs", JSON.stringify({ necessary: true, analytics: false, marketing: false }));
    }
    setShow(false);
  };

  const savePrefs = () => {
    localStorage.setItem("mhasa-cookie-consent", "accepted");
    localStorage.setItem("mhasa-cookie-prefs", JSON.stringify(prefs));
    setPrefOpen(false);
    setShow(false);
  };

  return (
    <>
      <AnimatePresence>
        {show && !prefOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed bottom-safe start-4 z-50 max-w-md"
          >
            <div className="rounded-2xl border border-border bg-card p-5 shadow-2xl">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                  <Cookie className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground text-sm">{t.cookie.title}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {t.cookie.message}{" "}
                    <button
                      onClick={() => { navigateToView("privacy"); setShow(false); }}
                      className="font-medium text-primary underline hover:text-gold"
                    >
                      {t.cookie.privacy}
                    </button>
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => handle(true)}
                      className="bg-gold text-gold-foreground hover:bg-gold/90 h-8 text-xs"
                    >
                      {t.cookie.accept}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPrefOpen(true)}
                      className="h-8 text-xs"
                    >
                      {t.cookie.preferences}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handle(false)}
                      className="h-8 text-xs text-muted-foreground"
                    >
                      {t.cookie.decline}
                    </Button>
                  </div>
                </div>
                <button
                  onClick={() => handle(false)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preferences Modal */}
      <AnimatePresence>
        {prefOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setPrefOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full max-w-lg rounded-2xl bg-card shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border bg-navy px-5 py-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/20 text-gold">
                    <Cookie className="h-5 w-5" />
                  </div>
                  <h3 className="font-display font-bold">
                    {t.cookie.preferencesTitle}
                  </h3>
                </div>
                <button
                  onClick={() => setPrefOpen(false)}
                  className="text-white/70 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[60dvh] overflow-y-auto">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t.cookie.preferencesDesc}
                </p>

                {/* Necessary */}
                <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-foreground">{t.cookie.necessary}</span>
                      <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700">{t.cookie.alwaysOn}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{t.cookie.necessaryDesc}</p>
                  </div>
                  <Switch checked disabled className="opacity-60" />
                </div>

                {/* Analytics */}
                <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-semibold text-foreground">{t.cookie.analytics}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{t.cookie.analyticsDesc}</p>
                  </div>
                  <Switch
                    checked={prefs.analytics}
                    onCheckedChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))}
                  />
                </div>

                {/* Marketing */}
                <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Megaphone className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-semibold text-foreground">{t.cookie.marketing}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{t.cookie.marketingDesc}</p>
                  </div>
                  <Switch
                    checked={prefs.marketing}
                    onCheckedChange={(v) => setPrefs((p) => ({ ...p, marketing: v }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-border p-4 bg-muted/30">
                <Button variant="outline" size="sm" onClick={() => setPrefOpen(false)}>
                  {t.cookie.cancel}
                </Button>
                <Button size="sm" onClick={savePrefs} className="bg-gold text-gold-foreground hover:bg-gold/90">
                  {t.cookie.savePrefs}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
