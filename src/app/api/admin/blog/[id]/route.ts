import { db } from "@/lib/db";
import { makeGetOneHandler, makeUpdateHandler, makeDeleteHandler } from "@/lib/crud-factory";
import { blogPostSchema } from "@/lib/validations";
import { stringifyArray } from "@/lib/api";

const include = { author: true };

export const GET = makeGetOneHandler({ model: db.blogPost, schema: blogPostSchema, entityName: "BlogPost", include });

export const PUT = makeUpdateHandler({
  model: db.blogPost,
  schema: blogPostSchema,
  entityName: "BlogPost",
  include,
  transform: (input) => ({
    ...(input as Record<string, unknown>),
    tags: stringifyArray((input as { tags?: string[] }).tags ?? []),
    publishedAt: (input as { status?: string }).status === "PUBLISHED" ? new Date() : null,
  }),
});

export const DELETE = makeDeleteHandler({ model: db.blogPost, schema: blogPostSchema, entityName: "BlogPost" });
