import { db } from "@/lib/db";
import { makeListHandler, makeCreateHandler } from "@/lib/crud-factory";
import { serviceSchema } from "@/lib/validations";
import { stringifyArray, parseJsonArray } from "@/lib/api";

export const GET = makeListHandler({
  model: db.service,
  orderBy: { sortOrder: "asc" },
  transformResponse: (item: Record<string, unknown>) => ({
    ...item,
    features: parseJsonArray(item.features as unknown as string),
  }),
});

export const POST = makeCreateHandler({
  model: db.service,
  schema: serviceSchema,
  entityName: "Service",
  transform: (input) => ({
    ...(input as Record<string, unknown>),
    features: stringifyArray((input as { features?: string[] }).features ?? []),
  }),
});
