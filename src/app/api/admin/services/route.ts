import { db } from "@/lib/db";
import { makeListHandler, makeCreateHandler } from "@/lib/crud-factory";
import { serviceSchema } from "@/lib/validations";
import { stringifyArray } from "@/lib/api";

export const GET = makeListHandler({
  model: db.service,
  orderBy: { sortOrder: "asc" },
});

export const POST = makeCreateHandler({
  model: db.service,
  schema: serviceSchema,
  entityName: "Service",
  transform: (input) => ({
    ...input,
    features: stringifyArray((input as { features?: string[] }).features ?? []),
  }),
});
