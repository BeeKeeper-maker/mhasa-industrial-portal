// ============================================================================
// MHASA — Single-page corporate application.
// View-state router manages all "pages" within the single visible `/` route.
// ============================================================================

import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { BackToTop, FloatingActions, CookieConsent } from "@/components/site/floating-ui";
import { SearchDialog } from "@/components/site/search-dialog";
import { QuickQuoteWidget } from "@/components/site/quick-quote-widget";
import { ViewRouter } from "@/components/site/view-router";
import { AdminOverlay } from "@/components/admin/admin-overlay";
import { RtlRoot } from "@/components/site/rtl-root";

export default function Home() {
  return (
    <RtlRoot>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <ViewRouter />
        </main>
        <Footer />
        <BackToTop />
        <FloatingActions />
        <CookieConsent />
        <SearchDialog />
        <QuickQuoteWidget />
        <AdminOverlay />
      </div>
    </RtlRoot>
  );
}
