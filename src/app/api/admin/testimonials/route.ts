import { db } from "@/lib/db";
import { makeListHandler, makeCreateHandler } from "@/lib/crud-factory";
import { testimonialSchema } from "@/lib/validations";

export const GET = makeListHandler({
  model: db.testimonial,
  orderBy: { sortOrder: "asc" },
});

export const POST = makeCreateHandler({
  model: db.testimonial,
  schema: testimonialSchema,
  entityName: "Testimonial",
});
