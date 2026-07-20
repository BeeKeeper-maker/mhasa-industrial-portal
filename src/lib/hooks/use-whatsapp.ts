// ============================================================================
// useWhatsApp — builds WhatsApp click-to-chat URLs with pre-filled messages.
// Reads the site WhatsApp number from settings.
// ============================================================================

"use client";

import { useSiteData } from "@/lib/hooks/use-queries";
import { useLocale } from "@/lib/hooks/use-locale";

interface WhatsAppLink {
  url: string | null;
  label: string;
}

/**
 * Returns a WhatsApp click-to-chat URL with a pre-filled message.
 * Returns null if no WhatsApp number is configured.
 */
export function useWhatsApp(): {
  buildUrl: (message: string) => string | null;
  shareProject: (title: string, client?: string) => WhatsAppLink;
  shareService: (title: string) => WhatsAppLink;
  generalInquiry: () => WhatsAppLink;
} {
  const { data: siteData } = useSiteData();
  const { locale } = useLocale();
  const number = siteData?.settings?.whatsappNumber;

  const buildUrl = (message: string): string | null => {
    if (!number) return null;
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  };

  const shareProject = (title: string, client?: string): WhatsAppLink => {
    const msg = locale === "ar"
      ? `مرحباً مهاكسا، أنا مهتم بمشروع "${title}"${client ? ` (${client})` : ""}. أود معرفة المزيد.`
      : `Hello MHASA, I'm interested in the project "${title}"${client ? ` (${client})` : ""}. I'd like to know more.`;
    return {
      url: buildUrl(msg),
      label: locale === "ar" ? "استفسر عبر واتساب" : "Inquire via WhatsApp",
    };
  };

  const shareService = (title: string): WhatsAppLink => {
    const msg = locale === "ar"
      ? `مرحباً مهاكسا، أنا مهتم بخدمة "${title}". أود طلب عرض سعر.`
      : `Hello MHASA, I'm interested in your "${title}" service. I'd like to request a quotation.`;
    return {
      url: buildUrl(msg),
      label: locale === "ar" ? "اطلب عبر واتساب" : "Quote via WhatsApp",
    };
  };

  const generalInquiry = (): WhatsAppLink => {
    const msg = locale === "ar"
      ? "مرحباً مهاكسا، أود الاستفسار عن خدماتكم."
      : "Hello MHASA, I'd like to inquire about your services.";
    return {
      url: buildUrl(msg),
      label: locale === "ar" ? "تواصل عبر واتساب" : "Chat on WhatsApp",
    };
  };

  return { buildUrl, shareProject, shareService, generalInquiry };
}
