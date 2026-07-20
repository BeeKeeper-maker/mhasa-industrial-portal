import { db } from "@/lib/db";
import { makeListHandler, makeCreateHandler } from "@/lib/crud-factory";
import { statSchema } from "@/lib/validations";

export const GET = makeListHandler({
  model: db.stat,
  orderBy: { sortOrder: "asc" },
});

export const POST = makeCreateHandler({
  model: db.stat,
  schema: statSchema,
  entityName: "Stat",
});
