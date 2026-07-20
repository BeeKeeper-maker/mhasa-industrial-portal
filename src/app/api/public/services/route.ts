// ============================================================================
// /api/public/services — Public service list + single by slug.
// ============================================================================

import { db } from "@/lib/db";
import { parseJsonArray, ok, fail } from "@/lib/api";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (slug) {
    const service = await db.service.findUnique({
      where: { slug, isActive: true },
      include: {
        projects: {
          include: { project: true },
          orderBy: { project: { completionDate: "desc" } },
          take: 4,
        },
      },
    });
    if (!service) return fail("Service not found", 404);
    return ok({
      ...service,
      features: parseJsonArray(service.features),
      projects: service.projects.map((ps) => ({
        ...ps.project,
        galleryImages: parseJsonArray(ps.project.galleryImages),
        completionDate: ps.project.completionDate?.toISOString() ?? null,
      })),
    });
  }

  const services = await db.service.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return ok(
    services.map((s) => ({ ...s, features: parseJsonArray(s.features) }))
  );
}
