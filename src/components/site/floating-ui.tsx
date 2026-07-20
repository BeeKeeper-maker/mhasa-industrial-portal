// ============================================================================
// Floating Actions + Back To Top + Cookie Consent — persistent UI overlays.
// ============================================================================

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Phone, MessageCircle, X, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteData } from "@/lib/hooks/use-queries";
import { useAppStore } from "@/lib/store";
import { useLocale } from "@/lib/hooks/use-locale";

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
          className="fixed bottom-24 end-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-navy text-white shadow-xl hover:bg-navy-light transition-colors"
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
    <div className="fixed bottom-4 end-4 z-40 flex flex-col gap-3">
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
  const { t } = useLocale();
  const setView = useAppStore((s) => s.setView);

  useEffect(() => {
    const consent = localStorage.getItem("mhasa-cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handle = (accepted: boolean) => {
    localStorage.setItem("mhasa-cookie-consent", accepted ? "accepted" : "declined");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-4 start-4 z-50 max-w-md"
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
                    onClick={() => { setView("privacy"); setShow(false); }}
                    className="font-medium text-primary underline hover:text-gold"
                  >
                    {t.cookie.privacy}
                  </button>
                </p>
                <div className="mt-4 flex gap-2">
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
                    onClick={() => handle(false)}
                    className="h-8 text-xs"
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
  );
}
