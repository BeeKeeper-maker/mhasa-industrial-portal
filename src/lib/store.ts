// ============================================================================
// Global UI Store — locale, admin modal, search, quote.
// Navigation now uses Next.js App Router (proper URL-based routing).
// ============================================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "@/lib/types";

export type ViewKey =
  | "home"
  | "about"
  | "services"
  | "projects"
  | "clients"
  | "careers"
  | "contact"
  | "news"
  | "gallery"
  | "faq"
  | "privacy"
  | "terms";

interface AppState {
  locale: Locale;
  adminOpen: boolean;
  searchOpen: boolean;
  quoteOpen: boolean;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  setAdminOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setQuoteOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      locale: "en",
      adminOpen: false,
      searchOpen: false,
      quoteOpen: false,
      setLocale: (locale) => set({ locale }),
      toggleLocale: () =>
        set((s) => ({ locale: s.locale === "en" ? "ar" : "en" })),
      setAdminOpen: (adminOpen) => set({ adminOpen }),
      setSearchOpen: (searchOpen) => set({ searchOpen }),
      setQuoteOpen: (quoteOpen) => set({ quoteOpen }),
    }),
    {
      name: "mhasa-app-store",
      partialize: (s) => ({ locale: s.locale }),
    }
  )
);

// Navigation helpers — use Next.js App Router URLs.
export function navigateToView(view: ViewKey): void {
  const path = view === "home" ? "/" : `/${view}`;
  window.location.href = path;
}

export function navigateToProject(slug: string): void {
  window.location.href = `/projects/${slug}`;
}

export function navigateToService(slug: string): void {
  window.location.href = `/services/${slug}`;
}

export function navigateToPost(slug: string): void {
  window.location.href = `/news/${slug}`;
}

export function navigateToJob(slug: string): void {
  window.location.href = `/careers/${slug}`;
}

export function navigateBack(): void {
  window.history.back();
}
