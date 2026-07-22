import { db } from "@/lib/db";
import { makeGetOneHandler, makeUpdateHandler, makeDeleteHandler } from "@/lib/crud-factory";
import { projectSchema } from "@/lib/validations";
import { stringifyArray, parseJsonArray } from "@/lib/api";

const include = { services: { include: { service: true } } };
const transformResponse = (item: Record<string, unknown>) => ({
  ...item,
  galleryImages: parseJsonArray(item.galleryImages as unknown as string),
});

export const GET = makeGetOneHandler({ model: db.project, schema: projectSchema, entityName: "Project", include, transformResponse });

export const PUT = makeUpdateHandler({
  model: db.project,
  schema: projectSchema,
  entityName: "Project",
  include,
  transform: (input) => {
    const { serviceIds: _serviceIds, ...rest } = input as { serviceIds?: string[] } & Record<string, unknown>;
    return {
      ...rest,
      galleryImages: stringifyArray((input as { galleryImages?: string[] }).galleryImages ?? []),
      startDate: (input as { startDate?: string }).startDate ? new Date((input as { startDate: string }).startDate) : null,
      completionDate: (input as { completionDate?: string }).completionDate ? new Date((input as { completionDate: string }).completionDate) : null,
    };
  },
});

export const DELETE = makeDeleteHandler({ model: db.project, schema: projectSchema, entityName: "Project" });
