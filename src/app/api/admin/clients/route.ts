import { db } from "@/lib/db";
import { makeListHandler, makeCreateHandler } from "@/lib/crud-factory";
import { clientSchema } from "@/lib/validations";

export const GET = makeListHandler({
  model: db.client,
  orderBy: { sortOrder: "asc" },
});

export const POST = makeCreateHandler({
  model: db.client,
  schema: clientSchema,
  entityName: "Client",
});
