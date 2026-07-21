import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { BackToTop, FloatingActions, CookieConsent } from "@/components/site/floating-ui";
import { SearchDialog } from "@/components/site/search-dialog";
import { QuickQuoteWidget } from "@/components/site/quick-quote-widget";
import { AdminOverlay } from "@/components/admin/admin-overlay";
import { RtlRoot } from "@/components/site/rtl-root";
import { HomeView } from "@/components/views/home-view";

export default function Home() {
  return (
    <RtlRoot>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <HomeView />
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
