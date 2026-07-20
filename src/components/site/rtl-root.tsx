// ============================================================================
// RTL Root — synchronizes document direction & lang with the locale store.
// ============================================================================

"use client";

import { useEffect, type ReactNode } from "react";
import { useLocale } from "@/lib/hooks/use-locale";

export function RtlRoot({ children }: { children: ReactNode }) {
  const { locale, dir } = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  return <>{children}</>;
}
