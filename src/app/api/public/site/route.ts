// ============================================================================
// /api/public/site — Consolidated home-page data (single round-trip).
// ============================================================================

import { db } from "@/lib/db";
import { parseJsonArray, ok } from "@/lib/api";
import type { NextRequest } from "next/server";

export async function GET(_request: NextRequest) {
  const [settings, heroes, stats, services, clients, testimonials, faqs] = await Promise.all([
    db.siteSetting.findUnique({ where: { id: "default" } }),
    db.heroSlide.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    db.stat.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    db.service.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    db.client.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    db.testimonial.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    db.faqItem.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return ok({
    settings,
    heroes,
    stats,
    services: services.map((s) => ({ ...s, features: parseJsonArray(s.features) })),
    clients,
    testimonials,
    faqs,
  });
}
