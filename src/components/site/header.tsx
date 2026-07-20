// ============================================================================
// Site Header — sticky navigation with logo, menu, language toggle, search,
// admin button, and primary CTA. Mobile drawer included.
// ============================================================================

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, Phone, ChevronDown, Shield, Globe, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { useAppStore, type ViewKey } from "@/lib/store";
import { useLocale } from "@/lib/hooks/use-locale";
import { useSiteData } from "@/lib/hooks/use-queries";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const setAdminOpen = useAppStore((s) => s.setAdminOpen);
  const setSearchOpen = useAppStore((s) => s.setSearchOpen);
  const { t, locale, toggleLocale } = useLocale();
  const { data: siteData } = useSiteData();
  const settings = siteData?.settings;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems: { key: ViewKey; label: string }[] = [
    { key: "home", label: t.nav.home },
    { key: "about", label: t.nav.about },
    { key: "services", label: t.nav.services },
    { key: "projects", label: t.nav.projects },
    { key: "gallery", label: t.nav.gallery },
    { key: "careers", label: t.nav.careers },
    { key: "news", label: t.nav.news },
    { key: "faq", label: t.nav.faq },
    { key: "contact", label: t.nav.contact },
  ];

  const handleNav = (key: ViewKey) => {
    setView(key);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Top bar */}
      <div className="hidden lg:block bg-navy text-white/90 text-xs">
        <div className="container mx-auto flex items-center justify-between px-6 py-2">
          <div className="flex items-center gap-6">
            {settings?.phonePrimary && (
              <a href={`tel:${settings.phonePrimary}`} className="flex items-center gap-1.5 hover:text-gold transition-colors">
                <Phone className="h-3.5 w-3.5" />
                {settings.phonePrimary}
              </a>
            )}
            {settings?.email && (
              <span className="flex items-center gap-1.5">
                <span className="opacity-70">{settings.email}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="opacity-70">{settings?.address}</span>
            <button
              onClick={toggleLocale}
              className="flex items-center gap-1.5 hover:text-gold transition-colors font-medium"
            >
              <Globe className="h-3.5 w-3.5" />
              {locale === "en" ? "العربية" : "English"}
            </button>
          </div>
        </div>
      </div>

      {/* Main header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-background/95 backdrop-blur-md shadow-lg shadow-primary/5 border-b border-border/60"
            : "bg-background/80 backdrop-blur-sm"
        )}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-16 md:h-20 items-center justify-between gap-4">
            {/* Logo */}
            <button
              onClick={() => handleNav("home")}
              className="flex items-center gap-3 group flex-shrink-0"
            >
              <div className="relative flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-lg bg-gradient-to-br from-navy to-navy-light text-white font-bold text-lg shadow-lg group-hover:shadow-gold/30 transition-shadow">
                <span className="font-display">M</span>
                <span className="absolute -bottom-1 -end-1 h-3 w-3 rounded-full bg-gold ring-2 ring-background" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display text-lg md:text-xl font-bold text-navy tracking-tight">
                  {t.common.siteName}
                </span>
                <span className="text-[10px] md:text-xs text-muted-foreground font-medium tracking-wide uppercase">
                  {locale === "ar" ? "مؤسسة محمد المرحون" : "Al Marhoon Cont. Est."}
                </span>
              </div>
            </button>

            {/* Desktop nav */}
            <nav className="hidden xl:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNav(item.key)}
                  className={cn(
                    "nav-underline px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors",
                    view === item.key && "active text-primary"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                className="hidden md:inline-flex"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Button>

              <ThemeToggle className="hidden md:inline-flex" />

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLocale}
                className="hidden md:inline-flex font-semibold"
              >
                <Globe className="h-4 w-4" />
                {locale === "en" ? "عربي" : "EN"}
              </Button>

              <Button
                onClick={() => handleNav("contact")}
                className="hidden md:inline-flex bg-gold text-gold-foreground hover:bg-gold/90 font-semibold shadow-md shadow-gold/20"
                size="sm"
              >
                {t.actions.requestQuote}
              </Button>

              {/* Mobile menu */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="xl:hidden" aria-label="Menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side={locale === "ar" ? "right" : "left"} className="w-[300px] sm:w-[360px] p-0">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between p-5 border-b border-border">
                      <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy text-white font-bold">
                          M
                        </div>
                        <span className="font-display font-bold text-navy">{t.common.siteName}</span>
                      </div>
                      <SheetClose asChild>
                        <Button variant="ghost" size="icon">
                          <X className="h-5 w-5" />
                        </Button>
                      </SheetClose>
                    </div>
                    <nav className="flex-1 overflow-y-auto p-3">
                      {navItems.map((item) => (
                        <button
                          key={item.key}
                          onClick={() => handleNav(item.key)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                            view === item.key
                              ? "bg-primary/5 text-primary"
                              : "text-foreground hover:bg-muted"
                          )}
                        >
                          {item.label}
                          <ChevronDown className="h-4 w-4 -rotate-90 opacity-50 rtl:rotate-90" />
                        </button>
                      ))}
                    </nav>
                    <div className="border-t border-border p-4 space-y-2">
                      <Button
                        onClick={() => { handleNav("contact"); }}
                        className="w-full bg-gold text-gold-foreground hover:bg-gold/90 font-semibold"
                      >
                        {t.actions.requestQuote}
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={toggleLocale}
                          className="flex-1"
                        >
                          <Globe className="h-4 w-4" />
                          {locale === "en" ? "العربية" : "English"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setAdminOpen(true); setMobileOpen(false); }}
                          className="flex-1"
                        >
                          <Shield className="h-4 w-4" />
                          Admin
                        </Button>
                      </div>
                      <div className="flex justify-center pt-1">
                        <ThemeToggle />
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.header>
    </>
  );
}
