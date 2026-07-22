import { db } from "@/lib/db";
import { makeGetOneHandler, makeUpdateHandler, makeDeleteHandler } from "@/lib/crud-factory";
import { blogPostSchema } from "@/lib/validations";
import { stringifyArray, parseJsonArray } from "@/lib/api";

const include = { author: true };
const transformResponse = (item: Record<string, unknown>) => ({
  ...item,
  tags: parseJsonArray(item.tags as unknown as string),
});

export const GET = makeGetOneHandler({ model: db.blogPost, schema: blogPostSchema, entityName: "BlogPost", include, transformResponse });

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
      ...(publishedAt === null && (input as { status?: string }).status === "PUBLISHED"
        ? { publishedAt: new Date() }
        : {}),
    };
  },
});

export const DELETE = makeDeleteHandler({ model: db.blogPost, schema: blogPostSchema, entityName: "BlogPost" });
