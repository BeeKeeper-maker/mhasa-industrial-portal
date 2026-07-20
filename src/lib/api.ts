// ============================================================================
// API Utilities — response helpers, JSON parsing, admin guard.
// ============================================================================

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { NextResponse } from "next/server";
import { NextResponse as NR } from "next/server";
import type { ApiResponse } from "@/lib/types";

/** Standard JSON success response. */
export function ok<T>(data: T, message?: string, status = 200): NextResponse<ApiResponse<T>> {
  return NR.json({ success: true, data, message }, { status });
}

/** Standard JSON error response. */
export function fail(error: string, status = 400): NextResponse<ApiResponse<never>> {
  return NR.json({ success: false, error }, { status });
}

/** Safely parse a JSON string field stored in SQLite (which has no array type). */
export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

/** Serialize an array into a JSON string for storage. */
export function stringifyArray(arr: string[]): string {
  return JSON.stringify(arr ?? []);
}

/**
 * Require an authenticated admin session.
 * Returns the session user or throws a 401 NextResponse.
 */
export async function requireAdmin():
  Promise<{ id: string; email: string; name: string; role: string } | NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return fail("Unauthorized — authentication required", 401);
  }
  const user = session.user as { id: string; email: string; name: string; role: string };
  if (!user.role || !["ADMIN", "EDITOR", "AUTHOR"].includes(user.role)) {
    return fail("Forbidden — insufficient permissions", 403);
  }
  return user;
}

/** Type guard: is the returned value a NextResponse (i.e. an error)? */
export function isErrorResponse<T>(value: T | NextResponse): value is NextResponse {
  return value instanceof NR;
}

/** Build a slug from a title string. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
