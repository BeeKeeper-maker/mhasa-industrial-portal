// ============================================================================
// /api/search — Global search across projects, services, blog, jobs.
// ============================================================================

import { db } from "@/lib/db";
import { parseJsonArray, ok } from "@/lib/api";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim().toLowerCase();

  if (!q || q.length < 2) {
    return ok({ projects: [], services: [], posts: [], jobs: [] });
  }

  const [projects, services, posts, jobs] = await Promise.all([
    db.project.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: q } },
          { clientName: { contains: q } },
          { category: { contains: q } },
          { description: { contains: q } },
        ],
      },
      take: 5,
      select: { id: true, slug: true, title: true, category: true, clientName: true },
    }),
    db.service.findMany({
      where: {
        isActive: true,
        OR: [{ title: { contains: q } }, { excerpt: { contains: q } }, { description: { contains: q } }],
      },
      take: 5,
      select: { id: true, slug: true, title: true, excerpt: true },
    }),
    db.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        OR: [{ title: { contains: q } }, { excerpt: { contains: q } }],
      },
      take: 5,
      select: { id: true, slug: true, title: true, category: true },
    }),
    db.job.findMany({
      where: {
        status: "OPEN",
        OR: [{ title: { contains: q } }, { department: { contains: q } }, { location: { contains: q } }],
      },
      take: 5,
      select: { id: true, slug: true, title: true, department: true, location: true },
    }),
  ]);

  return ok({
    projects: projects.map((p) => ({ ...p })),
    services: services.map((s) => ({ ...s, features: parseJsonArray(null) })),
    posts,
    jobs,
  });
}
