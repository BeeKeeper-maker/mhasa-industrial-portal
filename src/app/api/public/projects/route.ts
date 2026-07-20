// ============================================================================
// /api/public/projects — Projects list with category filter + single by slug.
// ?category=RTR+Pipe  ?featured=true  ?limit=6  ?slug=...
// ============================================================================

import { db } from "@/lib/db";
import { parseJsonArray, ok, fail } from "@/lib/api";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const limit = searchParams.get("limit");

  // Single project by slug with services
  if (slug) {
    const project = await db.project.findUnique({
      where: { slug, isActive: true },
      include: { services: { include: { service: true } } },
    });
    if (!project) return fail("Project not found", 404);
    return ok({
      ...project,
      galleryImages: parseJsonArray(project.galleryImages),
      startDate: project.startDate?.toISOString() ?? null,
      completionDate: project.completionDate?.toISOString() ?? null,
      services: project.services.map((ps) => ({
        ...ps.service,
        features: parseJsonArray(ps.service.features),
      })),
    });
  }

  const where: { isActive?: boolean; category?: string; isFeatured?: boolean } = {
    isActive: true,
  };
  if (category && category !== "all") where.category = category;
  if (featured === "true") where.isFeatured = true;

  const projects = await db.project.findMany({
    where,
    orderBy: { completionDate: "desc" },
    ...(limit ? { take: Number(limit) } : {}),
  });

  return ok(
    projects.map((p) => ({
      ...p,
      galleryImages: parseJsonArray(p.galleryImages),
      startDate: p.startDate?.toISOString() ?? null,
      completionDate: p.completionDate?.toISOString() ?? null,
    }))
  );
}
