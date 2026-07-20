// ============================================================================
// /api/admin/leads/[id] — Single contact lead: get / patch status / delete.
// ============================================================================

import { db } from "@/lib/db";
import { ok, fail, requireAdmin, isErrorResponse } from "@/lib/api";
import { logActivity } from "@/lib/log-activity";
import { getClientIp } from "@/lib/rate-limit";
import type { NextRequest } from "next/server";

const ALLOWED_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"] as const;
type LeadStatus = (typeof ALLOWED_STATUSES)[number];

function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === "string" && (ALLOWED_STATUSES as readonly string[]).includes(value);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (isErrorResponse(auth)) return auth;

  const { id } = await params;
  const item = await db.contactLead.findUnique({ where: { id } });
  if (!item) return fail("Not found", 404);
  return ok(item);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (isErrorResponse(auth)) return auth;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request body", 400);
  }

  const { status } = body as { status?: unknown };
  if (!isLeadStatus(status)) {
    return fail(`Invalid status. Allowed: ${ALLOWED_STATUSES.join(", ")}`, 422);
  }

  try {
    const updated = await db.contactLead.update({
      where: { id },
      data: { status },
    });
    await logActivity({
      action: "UPDATE_LEAD_STATUS",
      entity: "ContactLead",
      entityId: id,
      metadata: { status },
      ipAddress: getClientIp(request),
    });
    return ok(updated, "Lead status updated successfully");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return fail(`Failed to update lead: ${msg}`, 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (isErrorResponse(auth)) return auth;

  const { id } = await params;
  try {
    await db.contactLead.delete({ where: { id } });
    await logActivity({
      action: "DELETE_LEAD",
      entity: "ContactLead",
      entityId: id,
      ipAddress: getClientIp(request),
    });
    return ok({ id }, "Lead deleted successfully");
  } catch {
    return fail("Lead not found or could not be deleted", 404);
  }
}
