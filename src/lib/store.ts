// ============================================================================
// Global UI Store — view-state router, locale, admin modal, search.
// Since only the `/` route is user-visible, we manage "pages" via state.
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
  view: ViewKey;
  locale: Locale;
  adminOpen: boolean;
  searchOpen: boolean;
  quoteOpen: boolean;
  selectedProjectSlug: string | null;
  selectedServiceSlug: string | null;
  selectedPostSlug: string | null;
  selectedJobSlug: string | null;
  setView: (view: ViewKey) => void;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  setAdminOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setQuoteOpen: (open: boolean) => void;
  openProject: (slug: string) => void;
  openService: (slug: string) => void;
  openPost: (slug: string) => void;
  openJob: (slug: string) => void;
  resetSelection: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      view: "home",
      locale: "en",
      adminOpen: false,
      searchOpen: false,
      quoteOpen: false,
      selectedProjectSlug: null,
      selectedServiceSlug: null,
      selectedPostSlug: null,
      selectedJobSlug: null,
      setView: (view) => {
        set({
          view,
          selectedProjectSlug: null,
          selectedServiceSlug: null,
          selectedPostSlug: null,
          selectedJobSlug: null,
        });
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      },
      setLocale: (locale) => set({ locale }),
      toggleLocale: () =>
        set((s) => ({ locale: s.locale === "en" ? "ar" : "en" })),
      setAdminOpen: (adminOpen) => set({ adminOpen }),
      setSearchOpen: (searchOpen) => set({ searchOpen }),
      setQuoteOpen: (quoteOpen) => set({ quoteOpen }),
      openProject: (slug) => {
        set({ view: "projects", selectedProjectSlug: slug });
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      },
      openService: (slug) => {
        set({ view: "services", selectedServiceSlug: slug });
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      },
      openPost: (slug) => {
        set({ view: "news", selectedPostSlug: slug });
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      },
      openJob: (slug) => {
        set({ view: "careers", selectedJobSlug: slug });
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      },
      resetSelection: () =>
        set({
          selectedProjectSlug: null,
          selectedServiceSlug: null,
          selectedPostSlug: null,
          selectedJobSlug: null,
        }),
    }),
    {
      name: "mhasa-app-store",
      partialize: (s) => ({ locale: s.locale }),
    }
  )
);
