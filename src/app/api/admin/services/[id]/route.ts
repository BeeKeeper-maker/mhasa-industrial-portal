import { db } from "@/lib/db";
import { makeGetOneHandler, makeUpdateHandler, makeDeleteHandler } from "@/lib/crud-factory";
import { serviceSchema } from "@/lib/validations";
import { stringifyArray } from "@/lib/api";

export const GET = makeGetOneHandler({ model: db.service, schema: serviceSchema, entityName: "Service" });

export const PUT = makeUpdateHandler({
  model: db.service,
  schema: serviceSchema,
  entityName: "Service",
  transform: (input) => ({
    ...(input as Record<string, unknown>),
    features: stringifyArray((input as { features?: string[] }).features ?? []),
  }),
});

export const DELETE = makeDeleteHandler({ model: db.service, schema: serviceSchema, entityName: "Service" });
