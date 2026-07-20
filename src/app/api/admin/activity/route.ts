// ============================================================================
// /api/admin/activity — Read-only activity log (most recent 100 entries).
// ============================================================================

import { db } from "@/lib/db";
import { ok, requireAdmin, isErrorResponse } from "@/lib/api";
import type { NextRequest } from "next/server";

export async function GET(_request: NextRequest) {
  const auth = await requireAdmin();
  if (isErrorResponse(auth)) return auth;

  const items = await db.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: true },
  });

  return ok(items);
}
