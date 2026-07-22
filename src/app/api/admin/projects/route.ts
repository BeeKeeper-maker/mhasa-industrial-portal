import { db } from "@/lib/db";
import { makeListHandler, makeCreateHandler } from "@/lib/crud-factory";
import { projectSchema } from "@/lib/validations";
import { stringifyArray, parseJsonArray } from "@/lib/api";

export const GET = makeListHandler({
  model: db.project,
  orderBy: { completionDate: "desc" },
  transformResponse: (item: Record<string, unknown>) => ({
    ...item,
    galleryImages: parseJsonArray(item.galleryImages as unknown as string),
  }),
});

export const POST = makeCreateHandler({
  model: db.project,
  schema: projectSchema,
  entityName: "Project",
  transform: (input) => {
    const { serviceIds, ...rest } = input as { serviceIds?: string[] } & Record<string, unknown>;
    return {
      ...rest,
      galleryImages: stringifyArray((input as { galleryImages?: string[] }).galleryImages ?? []),
      startDate: (input as { startDate?: string }).startDate ? new Date((input as { startDate: string }).startDate) : null,
      completionDate: (input as { completionDate?: string }).completionDate ? new Date((input as { completionDate: string }).completionDate) : null,
      services: serviceIds?.length
        ? { create: serviceIds.map((id: string) => ({ service: { connect: { id } } })) }
        : undefined,
    };
  },
});
