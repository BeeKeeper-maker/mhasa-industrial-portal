// ============================================================================
// /api/admin/upload — Multipart file upload → base64 data URL.
// Supports images (png/jpeg/webp/gif) and PDFs / DWGs (octet-stream).
// Max file size: 10MB. Returns { url, filename, size }.
// ============================================================================

import { ok, fail, requireAdmin, isErrorResponse } from "@/lib/api";
import { logActivity } from "@/lib/log-activity";
import { getClientIp } from "@/lib/rate-limit";
import type { NextRequest } from "next/server";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/octet-stream", // DWG files often come through as octet-stream
] as const;

function isAllowedMime(value: string): boolean {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(value);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (isErrorResponse(auth)) return auth;

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return fail("Expected multipart/form-data request", 400);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return fail("Missing 'file' field", 400);
  }

  if (!isAllowedMime(file.type)) {
    return fail(
      `Unsupported file type: ${file.type || "unknown"}. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`,
      415
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return fail("File too large. Max size is 10MB.", 413);
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const url = `data:${file.type};base64,${base64}`;

    await logActivity({
      action: "UPLOAD_FILE",
      entity: "Upload",
      metadata: { filename: file.name, size: file.size, type: file.type },
      ipAddress: getClientIp(request),
    });

    return ok(
      { url, filename: file.name, size: file.size },
      "File uploaded successfully",
      201
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return fail(`Failed to process upload: ${msg}`, 500);
  }
}
