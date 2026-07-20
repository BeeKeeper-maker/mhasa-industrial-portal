// ============================================================================
// /api/admin/applications — Manage job applications (list + status workflow).
// Applications are created publicly via /api/careers/apply; this route is admin-only.
// ============================================================================

import { db } from "@/lib/db";
import { ok, requireAdmin, isErrorResponse } from "@/lib/api";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const items = await db.jobApplication.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: { job: true },
  });

  return ok(items);
}
