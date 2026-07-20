import { db } from "@/lib/db";
import { makeGetOneHandler, makeUpdateHandler, makeDeleteHandler } from "@/lib/crud-factory";
import { teamMemberSchema } from "@/lib/validations";

export const GET = makeGetOneHandler({ model: db.teamMember, schema: teamMemberSchema, entityName: "TeamMember" });

export const PUT = makeUpdateHandler({
  model: db.teamMember,
  schema: teamMemberSchema,
  entityName: "TeamMember",
});

export const DELETE = makeDeleteHandler({ model: db.teamMember, schema: teamMemberSchema, entityName: "TeamMember" });
