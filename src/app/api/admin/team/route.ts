import { db } from "@/lib/db";
import { makeListHandler, makeCreateHandler } from "@/lib/crud-factory";
import { teamMemberSchema } from "@/lib/validations";

export const GET = makeListHandler({
  model: db.teamMember,
  orderBy: { sortOrder: "asc" },
});

export const POST = makeCreateHandler({
  model: db.teamMember,
  schema: teamMemberSchema,
  entityName: "TeamMember",
});
