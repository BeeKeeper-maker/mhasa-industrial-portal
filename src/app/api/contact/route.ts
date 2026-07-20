// ============================================================================
// /api/contact — Public contact lead submission.
// Protected by rate limiting, honeypot, and Zod validation.
// ============================================================================

import { db } from "@/lib/db";
import { ok, fail } from "@/lib/api";
import { contactLeadSchema } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { logActivity } from "@/lib/log-activity";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // Rate limit: 5 submissions per hour per IP
  const limited = rateLimit(`contact:${ip}`, { capacity: 5, refillRate: 5 / 3600 });
  if (!limited.success) {
    return fail("Too many requests. Please try again later.", 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request body", 400);
  }

  const parsed = contactLeadSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
      422
    );
  }

  // Honeypot: if "website" filled, silently drop (bot)
  if (parsed.data.website) {
    return ok({ accepted: true }, "Thank you for your message.", 200);
  }

  const { name, company, email, phone, subject, message, projectBudget, attachmentUrl } =
    parsed.data;

  const lead = await db.contactLead.create({
    data: {
      name,
      company: company ?? null,
      email,
      phone,
      subject,
      message,
      projectBudget: projectBudget ?? null,
      attachmentUrl: attachmentUrl ?? null,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent")?.slice(0, 500) ?? null,
    },
  });

  // Best-effort activity log (non-blocking)
  logActivity({ action: "CONTACT_LEAD_CREATED", entity: "ContactLead", entityId: lead.id, ipAddress: ip }).catch(() => {});

  return ok({ id: lead.id }, "Thank you for your inquiry. Our team will respond within 24 hours.", 201);
}
