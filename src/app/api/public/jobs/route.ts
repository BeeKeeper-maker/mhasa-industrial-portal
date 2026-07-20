// ============================================================================
// /api/public/jobs — Open job vacancies + single by slug.
// ?slug=...  ?department=...
// ============================================================================

import { db } from "@/lib/db";
import { parseJsonArray, ok, fail } from "@/lib/api";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const department = searchParams.get("department");

  if (slug) {
    const job = await db.job.findUnique({ where: { slug, status: "OPEN" } });
    if (!job) return fail("Job not found", 404);
    return ok({
      ...job,
      requirements: parseJsonArray(job.requirements),
      closingDate: job.closingDate?.toISOString() ?? null,
      createdAt: job.createdAt.toISOString(),
    });
  }

  const where: { status: string; department?: string } = { status: "OPEN" };
  if (department && department !== "all") where.department = department;

  const jobs = await db.job.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return ok(
    jobs.map((j) => ({
      ...j,
      requirements: parseJsonArray(j.requirements),
      closingDate: j.closingDate?.toISOString() ?? null,
      createdAt: j.createdAt.toISOString(),
    }))
  );
}
