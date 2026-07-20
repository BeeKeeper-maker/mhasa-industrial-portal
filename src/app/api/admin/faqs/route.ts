import { db } from "@/lib/db";
import { makeListHandler, makeCreateHandler } from "@/lib/crud-factory";
import { faqSchema } from "@/lib/validations";

export const GET = makeListHandler({
  model: db.faqItem,
  orderBy: { sortOrder: "asc" },
});

export const POST = makeCreateHandler({
  model: db.faqItem,
  schema: faqSchema,
  entityName: "FaqItem",
});
