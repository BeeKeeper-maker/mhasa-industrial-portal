import { db } from "@/lib/db";
import { makeListHandler, makeCreateHandler } from "@/lib/crud-factory";
import { jobSchema } from "@/lib/validations";
import { stringifyArray, parseJsonArray } from "@/lib/api";

export const GET = makeListHandler({
  model: db.job,
  orderBy: { createdAt: "desc" },
  transformResponse: (item: Record<string, unknown>) => ({
    ...item,
    requirements: parseJsonArray(item.requirements as unknown as string),
  }),
});

export const POST = makeCreateHandler({
  model: db.job,
  schema: jobSchema,
  entityName: "Job",
  transform: (input) => ({
    ...(input as Record<string, unknown>),
    requirements: stringifyArray((input as { requirements?: string[] }).requirements ?? []),
    closingDate: (input as { closingDate?: string }).closingDate
      ? new Date((input as { closingDate: string }).closingDate)
      : null,
  }),
});
