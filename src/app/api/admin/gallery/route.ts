import { db } from "@/lib/db";
import { makeListHandler, makeCreateHandler } from "@/lib/crud-factory";
import { galleryItemSchema } from "@/lib/validations";

export const GET = makeListHandler({
  model: db.galleryItem,
  orderBy: { sortOrder: "asc" },
});

export const POST = makeCreateHandler({
  model: db.galleryItem,
  schema: galleryItemSchema,
  entityName: "GalleryItem",
});
