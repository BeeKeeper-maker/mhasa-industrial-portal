import { db } from "@/lib/db";
import { makeGetOneHandler, makeUpdateHandler, makeDeleteHandler } from "@/lib/crud-factory";
import { faqSchema } from "@/lib/validations";

export const GET = makeGetOneHandler({ model: db.faqItem, schema: faqSchema, entityName: "FaqItem" });

export const PUT = makeUpdateHandler({
  model: db.faqItem,
  schema: faqSchema,
  entityName: "FaqItem",
});

export const DELETE = makeDeleteHandler({ model: db.faqItem, schema: faqSchema, entityName: "FaqItem" });
