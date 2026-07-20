// ============================================================================
// /api/public/team — Active team members.
// /api/public/gallery — Active gallery items with optional category filter.
// ============================================================================

import { db } from "@/lib/db";
import { ok } from "@/lib/api";
import type { NextRequest } from "next/server";

export async function GET(_request: NextRequest) {
  const team = await db.teamMember.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return ok(team);
}
