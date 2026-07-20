import { db } from "@/lib/db";
import { makeListHandler, makeCreateHandler } from "@/lib/crud-factory";
import { heroSlideSchema } from "@/lib/validations";

export const GET = makeListHandler({
  model: db.heroSlide,
  orderBy: { sortOrder: "asc" },
});

export const POST = makeCreateHandler({
  model: db.heroSlide,
  schema: heroSlideSchema,
  entityName: "HeroSlide",
});
