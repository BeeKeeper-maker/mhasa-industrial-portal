// ============================================================================
// Locale Hook — provides dictionary, direction, and translation helpers.
// ============================================================================

"use client";

import { useAppStore } from "@/lib/store";
import { getDictionary, isRTL, type Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export function useLocale() {
  const locale = useAppStore((s) => s.locale);
  const toggleLocale = useAppStore((s) => s.toggleLocale);
  const setLocale = useAppStore((s) => s.setLocale);

  const t: Dictionary = getDictionary(locale);
  const dir: "ltr" | "rtl" = isRTL(locale) ? "rtl" : "ltr";
  const rtl = isRTL(locale);

  /** Pick the localized value — falls back to English if Arabic missing. */
  const pick = <T,>(en: T | null | undefined, ar: T | null | undefined): T | null =>
    (locale === "ar" ? ar : en) ?? en ?? ar ?? null;

  return { locale, setLocale, toggleLocale, t, dir, rtl, pick };
}

export type { Locale };
