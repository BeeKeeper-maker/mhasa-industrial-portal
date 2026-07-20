import { db } from "@/lib/db";
import { makeGetOneHandler, makeUpdateHandler, makeDeleteHandler } from "@/lib/crud-factory";
import { jobSchema } from "@/lib/validations";
import { stringifyArray } from "@/lib/api";

export const GET = makeGetOneHandler({ model: db.job, schema: jobSchema, entityName: "Job" });

export const PUT = makeUpdateHandler({
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

export const DELETE = makeDeleteHandler({ model: db.job, schema: jobSchema, entityName: "Job" });
