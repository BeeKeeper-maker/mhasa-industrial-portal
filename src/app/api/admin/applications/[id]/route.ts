// ============================================================================
// /api/admin/applications/[id] — Single job application: get / patch status / delete.
// ============================================================================

import { db } from "@/lib/db";
import { ok, fail, requireAdmin, isErrorResponse } from "@/lib/api";
import { logActivity } from "@/lib/log-activity";
import { getClientIp } from "@/lib/rate-limit";
import type { NextRequest } from "next/server";

const ALLOWED_STATUSES = ["NEW", "REVIEWING", "SHORTLISTED", "REJECTED", "HIRED"] as const;
type ApplicationStatus = (typeof ALLOWED_STATUSES)[number];

function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return typeof value === "string" && (ALLOWED_STATUSES as readonly string[]).includes(value);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (isErrorResponse(auth)) return auth;

  const { id } = await params;
  const item = await db.jobApplication.findUnique({
    where: { id },
    include: { job: true },
  });
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
  if (!isApplicationStatus(status)) {
    return fail(`Invalid status. Allowed: ${ALLOWED_STATUSES.join(", ")}`, 422);
  }

  try {
    const updated = await db.jobApplication.update({
      where: { id },
      data: { status },
      include: { job: true },
    });
    await logActivity({
      action: "UPDATE_APPLICATION_STATUS",
      entity: "JobApplication",
      entityId: id,
      metadata: { status },
      ipAddress: getClientIp(request),
    });
    return ok(updated, "Application status updated successfully");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return fail(`Failed to update application: ${msg}`, 500);
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
    await db.jobApplication.delete({ where: { id } });
    await logActivity({
      action: "DELETE_APPLICATION",
      entity: "JobApplication",
      entityId: id,
      ipAddress: getClientIp(request),
    });
    return ok({ id }, "Application deleted successfully");
  } catch {
    return fail("Application not found or could not be deleted", 404);
  }
}
