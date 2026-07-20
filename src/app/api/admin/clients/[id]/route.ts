import { db } from "@/lib/db";
import { makeGetOneHandler, makeUpdateHandler, makeDeleteHandler } from "@/lib/crud-factory";
import { clientSchema } from "@/lib/validations";

export const GET = makeGetOneHandler({ model: db.client, schema: clientSchema, entityName: "Client" });

export const PUT = makeUpdateHandler({
  model: db.client,
  schema: clientSchema,
  entityName: "Client",
});

export const DELETE = makeDeleteHandler({ model: db.client, schema: clientSchema, entityName: "Client" });
