import { db } from "@/lib/db";
import { makeGetOneHandler, makeUpdateHandler, makeDeleteHandler } from "@/lib/crud-factory";
import { testimonialSchema } from "@/lib/validations";

export const GET = makeGetOneHandler({ model: db.testimonial, schema: testimonialSchema, entityName: "Testimonial" });

export const PUT = makeUpdateHandler({
  model: db.testimonial,
  schema: testimonialSchema,
  entityName: "Testimonial",
});

export const DELETE = makeDeleteHandler({ model: db.testimonial, schema: testimonialSchema, entityName: "Testimonial" });
