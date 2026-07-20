import { db } from "@/lib/db";
import { makeGetOneHandler, makeUpdateHandler, makeDeleteHandler } from "@/lib/crud-factory";
import { heroSlideSchema } from "@/lib/validations";

export const GET = makeGetOneHandler({ model: db.heroSlide, schema: heroSlideSchema, entityName: "HeroSlide" });

export const PUT = makeUpdateHandler({
  model: db.heroSlide,
  schema: heroSlideSchema,
  entityName: "HeroSlide",
});

export const DELETE = makeDeleteHandler({ model: db.heroSlide, schema: heroSlideSchema, entityName: "HeroSlide" });
