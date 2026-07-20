// ============================================================================
// /api/admin/settings — Manage single-row site settings record (id="default").
// GET returns current settings; PUT upserts partial settings object.
// ============================================================================

import { db } from "@/lib/db";
import { ok, fail, requireAdmin, isErrorResponse } from "@/lib/api";
import { logActivity } from "@/lib/log-activity";
import { getClientIp } from "@/lib/rate-limit";
import type { NextRequest } from "next/server";

// Whitelisted fields that may be updated via the API.
const ALLOWED_FIELDS = [
  "siteName",
  "siteNameAr",
  "tagline",
  "taglineAr",
  "description",
  "descriptionAr",
  "logoUrl",
  "faviconUrl",
  "primaryColor",
  "accentColor",
  "email",
  "phonePrimary",
  "phoneSecondary",
  "address",
  "addressAr",
  "mapEmbedUrl",
  "whatsappNumber",
  "linkedinUrl",
  "facebookUrl",
  "instagramUrl",
  "youtubeUrl",
  "ga4Id",
  "metaPixelId",
  "recaptchaSiteKey",
  "companyProfileUrl",
] as const;

type SettingsField = (typeof ALLOWED_FIELDS)[number];

function pickSettings(body: unknown): Record<string, string | null> {
  if (!body || typeof body !== "object") return {};
  const source = body as Record<string, unknown>;
  const picked: Record<string, string | null> = {};
  for (const field of ALLOWED_FIELDS) {
    if (field in source) {
      const value = source[field];
      // Allow strings; treat null/undefined as null (clear field).
      picked[field] = typeof value === "string" ? value : value == null ? null : String(value);
    }
  }
  return picked;
}

export async function GET() {
  const auth = await requireAdmin();
  if (isErrorResponse(auth)) return auth;

  const settings = await db.siteSetting.findUnique({ where: { id: "default" } });
  return ok(settings);
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (isErrorResponse(auth)) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request body", 400);
  }

  const data = pickSettings(body);
  if (Object.keys(data).length === 0) {
    return fail("No valid settings fields provided", 422);
  }

  try {
    const updated = await db.siteSetting.upsert({
      where: { id: "default" },
      update: data,
      create: { id: "default", ...data },
    });
    await logActivity({
      action: "UPDATE_SETTINGS",
      entity: "SiteSetting",
      entityId: "default",
      metadata: { fields: Object.keys(data) as SettingsField[] },
      ipAddress: getClientIp(request),
    });
    return ok(updated, "Settings updated successfully");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return fail(`Failed to update settings: ${msg}`, 500);
  }
}
