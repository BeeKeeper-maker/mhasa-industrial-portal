// ============================================================================
// /api/admin/leads — Manage contact leads (list + status workflow).
// Leads are created publicly via /api/contact; this route is admin-only.
// ============================================================================

import { db } from "@/lib/db";
import { ok, requireAdmin, isErrorResponse } from "@/lib/api";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const items = await db.contactLead.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return ok(items);
}
