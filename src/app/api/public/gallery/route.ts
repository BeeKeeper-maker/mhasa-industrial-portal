import { db } from "@/lib/db";
import { ok } from "@/lib/api";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const where: { isActive: boolean; category?: string } = { isActive: true };
  if (category && category !== "all") where.category = category;

  const gallery = await db.galleryItem.findMany({
    where,
    orderBy: { sortOrder: "asc" },
  });

  return ok(gallery);
}
