// ============================================================================
// View Router — renders the active view based on Zustand state.
// Uses AnimatePresence for smooth view transitions.
// ============================================================================

"use client";

import { lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { HomeView } from "@/components/views/home-view";
import { LoadingView } from "@/components/site/loading-view";

// Lazy-load secondary views for better initial load performance
const AboutView = lazy(() => import("@/components/views/about-view").then((m) => ({ default: m.AboutView })));
const ServicesView = lazy(() => import("@/components/views/services-view").then((m) => ({ default: m.ServicesView })));
const ProjectsView = lazy(() => import("@/components/views/projects-view").then((m) => ({ default: m.ProjectsView })));
const GalleryView = lazy(() => import("@/components/views/gallery-view").then((m) => ({ default: m.GalleryView })));
const ClientsView = lazy(() => import("@/components/views/clients-view").then((m) => ({ default: m.ClientsView })));
const CareersView = lazy(() => import("@/components/views/careers-view").then((m) => ({ default: m.CareersView })));
const ContactView = lazy(() => import("@/components/views/contact-view").then((m) => ({ default: m.ContactView })));
const NewsView = lazy(() => import("@/components/views/news-view").then((m) => ({ default: m.NewsView })));
const FaqView = lazy(() => import("@/components/views/faq-view").then((m) => ({ default: m.FaqView })));
const PrivacyView = lazy(() => import("@/components/views/legal-view").then((m) => ({ default: m.PrivacyView })));
const TermsView = lazy(() => import("@/components/views/legal-view").then((m) => ({ default: m.TermsView })));

export function ViewRouter() {
  const view = useAppStore((s) => s.view);

  const renderView = () => {
    switch (view) {
      case "home":
        return <HomeView />;
      case "about":
        return <AboutView />;
      case "services":
        return <ServicesView />;
      case "projects":
        return <ProjectsView />;
      case "gallery":
        return <GalleryView />;
      case "clients":
        return <ClientsView />;
      case "careers":
        return <CareersView />;
      case "contact":
        return <ContactView />;
      case "news":
        return <NewsView />;
      case "faq":
        return <FaqView />;
      case "privacy":
        return <PrivacyView />;
      case "terms":
        return <TermsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={view}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <Suspense fallback={<LoadingView />}>{renderView()}</Suspense>
      </motion.div>
    </AnimatePresence>
  );
}
