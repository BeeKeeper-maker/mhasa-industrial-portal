// ============================================================================
// LastUpdatedBadge — displays a relative "updated X ago" badge.
// Used on admin-edited content cards and detail pages.
// ============================================================================

"use client";

import { useState } from "react";
import { Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface LastUpdatedBadgeProps {
  date: string | Date | null;
  className?: string;
  locale?: "en" | "ar";
  showIcon?: boolean;
}

function getRelativeTime(date: Date, locale: "en" | "ar"): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  const ar = locale === "ar";
  const rtf = new Intl.RelativeTimeFormat(ar ? "ar" : "en", { numeric: "auto" });

  if (diffSec < 60) return rtf.format(-diffSec, "second");
  if (diffMin < 60) return rtf.format(-diffMin, "minute");
  if (diffHr < 24) return rtf.format(-diffHr, "hour");
  if (diffDay < 7) return rtf.format(-diffDay, "day");
  if (diffWeek < 4) return rtf.format(-diffWeek, "week");
  if (diffMonth < 12) return rtf.format(-diffMonth, "month");
  return rtf.format(-diffYear, "year");
}

export function LastUpdatedBadge({
  date,
  className,
  locale = "en",
  showIcon = true,
}: LastUpdatedBadgeProps) {
  // Read "now" once on mount — calling Date.now() during render is impure.
  const [now] = useState(() => Date.now());

  if (!date) return null;

  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return null;

  const relative = getRelativeTime(dateObj, locale);
  const isRecent = now - dateObj.getTime() < 24 * 60 * 60 * 1000; // < 24h

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs text-muted-foreground",
        className
      )}
      title={dateObj.toLocaleString(locale === "ar" ? "ar-SA" : "en-US")}
    >
      {showIcon && (isRecent ? (
        <RefreshCw className="h-3 w-3 text-gold" />
      ) : (
        <Clock className="h-3 w-3" />
      ))}
      <span>
        {locale === "ar" ? "تحديث" : "Updated"} {relative}
      </span>
    </span>
  );
}
