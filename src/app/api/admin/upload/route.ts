// ============================================================================
// /api/admin/upload — Image upload endpoint.
// Accepts multipart/form-data, stores to public/uploads/, returns URL.
// ============================================================================

import { NextRequest } from "next/server";
import { ok, fail, requireAdmin, isErrorResponse } from "@/lib/api";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (isErrorResponse(auth)) return auth;

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return fail("Expected multipart/form-data", 400);
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return fail("No file provided", 400);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return fail(`File type "${file.type}" not allowed. Use: ${ALLOWED_TYPES.join(", ")}`, 415);
  }

  if (file.size > MAX_SIZE) {
    return fail(`File too large. Max size: ${MAX_SIZE / 1024 / 1024}MB`, 413);
  }

  // Generate unique filename
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const filename = `${randomUUID()}.${ext}`;
  const uploadDir = join(process.cwd(), "public", "uploads");

  try {
    await mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(join(uploadDir, filename), buffer);

    const url = `/uploads/${filename}`;
    return ok({ url, filename, size: file.size, type: file.type }, "File uploaded successfully", 201);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return fail(`Upload failed: ${msg}`, 500);
  }
}
