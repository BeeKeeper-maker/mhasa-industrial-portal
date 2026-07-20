// ============================================================================
// /api/admin/newsletter — Admin list subscribers + stats.
// ============================================================================

import { db } from "@/lib/db";
import { ok, fail, requireAdmin, isErrorResponse } from "@/lib/api";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("status"); // "active" | "unsubscribed" | null (all)

  const where = filter === "active"
    ? { isActive: true }
    : filter === "unsubscribed"
    ? { isActive: false }
    : {};

  const [subscribers, totalActive, totalAll] = await Promise.all([
    db.newsletterSubscriber.findMany({ where, orderBy: { createdAt: "desc" }, take: 500 }),
    db.newsletterSubscriber.count({ where: { isActive: true } }),
    db.newsletterSubscriber.count(),
  ]);

  return ok({ subscribers, stats: { active: totalActive, total: totalAll } });
}
