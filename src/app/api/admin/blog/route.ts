import { db } from "@/lib/db";
import { makeListHandler, makeCreateHandler } from "@/lib/crud-factory";
import { blogPostSchema } from "@/lib/validations";
import { stringifyArray, parseJsonArray, slugify } from "@/lib/api";

export const GET = makeListHandler({
  model: db.blogPost,
  orderBy: { createdAt: "desc" },
  include: { author: true },
  transformResponse: (item: Record<string, unknown>) => ({
    ...item,
    tags: parseJsonArray(item.tags as unknown as string),
  }),
});

export const POST = makeCreateHandler({
  model: db.blogPost,
  schema: blogPostSchema,
  entityName: "BlogPost",
  transform: (input) => ({
    ...(input as Record<string, unknown>),
    tags: stringifyArray((input as { tags?: string[] }).tags ?? []),
    slug: (input as { slug: string }).slug || slugify((input as { title: string }).title),
    publishedAt: (input as { status?: string }).status === "PUBLISHED" ? new Date() : null,
  }),
});
