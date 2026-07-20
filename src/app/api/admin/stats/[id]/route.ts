import { db } from "@/lib/db";
import { makeGetOneHandler, makeUpdateHandler, makeDeleteHandler } from "@/lib/crud-factory";
import { statSchema } from "@/lib/validations";

export const GET = makeGetOneHandler({ model: db.stat, schema: statSchema, entityName: "Stat" });

export const PUT = makeUpdateHandler({
  model: db.stat,
  schema: statSchema,
  entityName: "Stat",
});

export const DELETE = makeDeleteHandler({ model: db.stat, schema: statSchema, entityName: "Stat" });
