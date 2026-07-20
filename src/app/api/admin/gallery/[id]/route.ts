import { db } from "@/lib/db";
import { makeGetOneHandler, makeUpdateHandler, makeDeleteHandler } from "@/lib/crud-factory";
import { galleryItemSchema } from "@/lib/validations";

export const GET = makeGetOneHandler({ model: db.galleryItem, schema: galleryItemSchema, entityName: "GalleryItem" });

export const PUT = makeUpdateHandler({
  model: db.galleryItem,
  schema: galleryItemSchema,
  entityName: "GalleryItem",
});

export const DELETE = makeDeleteHandler({ model: db.galleryItem, schema: galleryItemSchema, entityName: "GalleryItem" });
