// ============================================================================
// /api/public/blog — Published blog posts list + single by slug.
// ?category=...  ?slug=...  ?limit=6
// ============================================================================

import { db } from "@/lib/db";
import { parseJsonArray, ok, fail } from "@/lib/api";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const category = searchParams.get("category");
  const limit = searchParams.get("limit");

  if (slug) {
    const post = await db.blogPost.findUnique({
      where: { slug, status: "PUBLISHED" },
      include: { author: true },
    });
    if (!post) return fail("Post not found", 404);

    // Increment view count (fire-and-forget)
    db.blogPost.update({ where: { id: post.id }, data: { views: { increment: 1 } } }).catch(() => {});

    return ok({
      ...post,
      tags: parseJsonArray(post.tags),
      publishedAt: post.publishedAt?.toISOString() ?? null,
      createdAt: post.createdAt.toISOString(),
      authorName: post.author?.name ?? null,
    });
  }

  const where: { status: string; category?: string } = { status: "PUBLISHED" };
  if (category && category !== "all") where.category = category;

  const posts = await db.blogPost.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    ...(limit ? { take: Number(limit) } : {}),
    include: { author: true },
  });

  return ok(
    posts.map((p) => ({
      ...p,
      tags: parseJsonArray(p.tags),
      publishedAt: p.publishedAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
      authorName: p.author?.name ?? null,
    }))
  );
}
