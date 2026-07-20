// ============================================================================
// /api/newsletter/subscribe — Public newsletter subscription endpoint.
// ============================================================================

import { db } from "@/lib/db";
import { ok, fail } from "@/lib/api";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { z } from "zod";
import type { NextRequest } from "next/server";

const subscribeSchema = z.object({
  email: z.string().email("Valid email required"),
  name: z.string().max(100).optional().nullable(),
  locale: z.enum(["en", "ar"]).default("en"),
  source: z.enum(["footer", "popup", "quick-quote"]).default("footer"),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // Rate limit: 3 subscriptions per hour per IP
  const limited = rateLimit(`newsletter:${ip}`, { capacity: 3, refillRate: 3 / 3600 });
  if (!limited.success) {
    return fail("Too many requests. Please try again later.", 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request body", 400);
  }

  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
      422
    );
  }

  const { email, name, locale, source } = parsed.data;

  // Upsert — if email exists and was unsubscribed, reactivate
  const existing = await db.newsletterSubscriber.findUnique({ where: { email } });

  if (existing) {
    if (existing.isActive) {
      return ok({ alreadySubscribed: true }, "You're already subscribed to our newsletter.");
    }
    await db.newsletterSubscriber.update({
      where: { email },
      data: { isActive: true, unsubscribedAt: null, name: name ?? existing.name, locale, source, ipAddress: ip },
    });
    return ok({ reactivated: true }, "Welcome back! Your subscription has been reactivated.");
  }

  await db.newsletterSubscriber.create({
    data: {
      email,
      name: name ?? null,
      locale,
      source,
      ipAddress: ip,
    },
  });

  return ok({ subscribed: true }, "Thank you for subscribing! You'll receive our latest updates.", 201);
}
