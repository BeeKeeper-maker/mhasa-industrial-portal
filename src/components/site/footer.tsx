// ============================================================================
// Site Footer — sticky to bottom, with company info, quick links, services,
// contact info, social, and legal links.
// ============================================================================

"use client";

import { Phone, Mail, MapPin, Linkedin, Facebook, Instagram, Youtube, Download, Shield } from "lucide-react";
import { useAppStore, type ViewKey } from "@/lib/store";
import { useLocale } from "@/lib/hooks/use-locale";
import { useSiteData } from "@/lib/hooks/use-queries";
import { useServices } from "@/lib/hooks/use-queries";
import { NewsletterWidget } from "@/components/site/newsletter-widget";

export function Footer() {
  const setView = useAppStore((s) => s.setView);
  const setAdminOpen = useAppStore((s) => s.setAdminOpen);
  const { t, locale, pick } = useLocale();
  const { data: siteData } = useSiteData();
  const { data: services } = useServices();
  const settings = siteData?.settings;

  const quickLinks: { key: ViewKey; label: string }[] = [
    { key: "about", label: t.nav.about },
    { key: "projects", label: t.nav.projects },
    { key: "careers", label: t.nav.careers },
    { key: "news", label: t.nav.news },
    { key: "gallery", label: t.nav.gallery },
    { key: "faq", label: t.nav.faq },
  ];

  const socials = [
    { icon: Linkedin, url: settings?.linkedinUrl, label: "LinkedIn" },
    { icon: Facebook, url: settings?.facebookUrl, label: "Facebook" },
    { icon: Instagram, url: settings?.instagramUrl, label: "Instagram" },
    { icon: Youtube, url: settings?.youtubeUrl, label: "YouTube" },
  ].filter((s) => s.url);

  return (
    <footer className="mt-auto bg-navy text-white/70">
      {/* CTA strip */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white font-display">
                {t.sections.readyToStart}
              </h3>
              <p className="mt-2 text-sm md:text-base text-white/60 max-w-2xl">
                {t.sections.ctaSubtitle}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 flex-shrink-0">
              <button
                onClick={() => setView("contact")}
                className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-gold-foreground hover:bg-gold/90 transition-colors shadow-lg shadow-gold/20"
              >
                {t.actions.requestQuote}
              </button>
              {settings?.phonePrimary && (
                <a
                  href={`tel:${settings.phonePrimary}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  {t.actions.callNow}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Company */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 text-white font-bold text-lg">
                M
              </div>
              <div>
                <div className="font-display font-bold text-white text-lg">{t.common.siteName}</div>
                <div className="text-[10px] text-white/50 uppercase tracking-wider">
                  {locale === "ar" ? "مؤسسة محمد المرحون" : "Al Marhoon Cont. Est."}
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/60">
              {t.footer.about}
            </p>
            {socials.length > 0 && (
              <div className="mt-5 flex gap-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-white/60 hover:bg-gold hover:text-gold-foreground transition-colors"
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              {t.common.quickLinks}
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.key}>
                  <button
                    onClick={() => setView(link.key)}
                    className="text-sm text-white/60 hover:text-gold transition-colors text-start"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              {t.common.ourServices}
            </h4>
            <ul className="space-y-2.5">
              {(services ?? []).slice(0, 6).map((svc) => (
                <li key={svc.id}>
                  <button
                    onClick={() => useAppStore.getState().openService(svc.slug)}
                    className="text-sm text-white/60 hover:text-gold transition-colors text-start line-clamp-1"
                  >
                    {pick(svc.title, svc.titleAr) ?? svc.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              {t.common.contactInfo}
            </h4>
            <ul className="space-y-3 text-sm">
              {settings?.address && (
                <li className="flex gap-3">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-gold mt-0.5" />
                  <span className="text-white/60">{pick(settings.address, settings.addressAr) ?? settings.address}</span>
                </li>
              )}
              {settings?.phonePrimary && (
                <li>
                  <a href={`tel:${settings.phonePrimary}`} className="flex gap-3 text-white/60 hover:text-gold transition-colors">
                    <Phone className="h-4 w-4 flex-shrink-0 text-gold mt-0.5" />
                    <span>{settings.phonePrimary}</span>
                  </a>
                </li>
              )}
              {settings?.phoneSecondary && (
                <li>
                  <a href={`tel:${settings.phoneSecondary}`} className="flex gap-3 text-white/60 hover:text-gold transition-colors">
                    <Phone className="h-4 w-4 flex-shrink-0 text-gold mt-0.5" />
                    <span>{settings.phoneSecondary}</span>
                  </a>
                </li>
              )}
              {settings?.email && (
                <li>
                  <a href={`mailto:${settings.email}`} className="flex gap-3 text-white/60 hover:text-gold transition-colors">
                    <Mail className="h-4 w-4 flex-shrink-0 text-gold mt-0.5" />
                    <span>{settings.email}</span>
                  </a>
                </li>
              )}
            </ul>
            {settings?.companyProfileUrl && (
              <a
                href={settings.companyProfileUrl}
                download
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                {t.actions.downloadProfile}
              </a>
            )}
          </div>

          {/* Newsletter */}
          <div>
            <NewsletterWidget />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <div className="flex items-center gap-1.5">
            <span>© {new Date().getFullYear()} {t.common.siteFullName}.</span>
            <span>{t.common.rights}.</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setView("privacy")} className="hover:text-gold transition-colors">
              {t.common.privacyPolicy}
            </button>
            <button onClick={() => setView("terms")} className="hover:text-gold transition-colors">
              {t.common.terms}
            </button>
            <button
              onClick={() => setAdminOpen(true)}
              className="inline-flex items-center gap-1 hover:text-gold transition-colors"
              title="Admin access"
            >
              <Shield className="h-3 w-3" />
              Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
