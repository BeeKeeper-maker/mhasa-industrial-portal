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
  transform: (input) => {
    const { publishedAt, ...rest } = input as { publishedAt?: string | null } & Record<string, unknown>;
    return {
      ...rest,
      tags: stringifyArray((input as { tags?: string[] }).tags ?? []),
      // Only set publishedAt to now if switching to PUBLISHED and no existing date
      // If already published, keep the existing date (don't pass publishedAt = let Prisma keep it)
      ...(publishedAt === null && (input as { status?: string }).status === "PUBLISHED"
        ? { publishedAt: new Date() }
        : {}),
    };
  },
});

export const DELETE = makeDeleteHandler({ model: db.blogPost, schema: blogPostSchema, entityName: "BlogPost" });
