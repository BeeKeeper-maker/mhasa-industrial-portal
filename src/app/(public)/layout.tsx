// ============================================================================
// Public Layout — wraps all public-facing pages with Header, Footer,
// floating UI, search, and cookie consent.
// This layout is in the (public) route group, so it does NOT affect /admin.
// ============================================================================

import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { BackToTop, FloatingActions, CookieConsent } from "@/components/site/floating-ui";
import { SearchDialog } from "@/components/site/search-dialog";
import { QuickQuoteWidget } from "@/components/site/quick-quote-widget";
import { RtlRoot } from "@/components/site/rtl-root";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RtlRoot>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <BackToTop />
        <FloatingActions />
        <CookieConsent />
        <SearchDialog />
        <QuickQuoteWidget />
      </div>
    </RtlRoot>
  );
}
