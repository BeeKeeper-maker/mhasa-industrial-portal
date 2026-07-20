// ============================================================================
// /api/careers/apply — Public job application submission.
// ============================================================================

import { db } from "@/lib/db";
import { ok, fail } from "@/lib/api";
import { jobApplicationSchema } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { logActivity } from "@/lib/log-activity";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  const limited = rateLimit(`apply:${ip}`, { capacity: 3, refillRate: 3 / 3600 });
  if (!limited.success) {
    return fail("Too many applications. Please try again later.", 429);
  }

  const contentType = request.headers.get("content-type") ?? "";

  let data: Record<string, unknown>;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const resumeFile = formData.get("resume") as File | null;

    let resumeUrl: string | null = null;
    if (resumeFile && resumeFile.size > 0) {
      // Store resume as base64 data URL (demo — production would use S3/OSS)
      const buffer = Buffer.from(await resumeFile.arrayBuffer());
      resumeUrl = `data:${resumeFile.type};base64,${buffer.toString("base64")}`;
    }

    data = {
      jobId: formData.get("jobId"),
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      coverLetter: formData.get("coverLetter") || null,
      portfolioUrl: formData.get("portfolioUrl") || null,
      resumeUrl,
    };
  } else {
    try {
      data = await request.json();
    } catch {
      return fail("Invalid request body", 400);
    }
  }

  const parsed = jobApplicationSchema.safeParse(data);
  if (!parsed.success) {
    return fail(
      parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
      422
    );
  }

  const job = await db.job.findUnique({ where: { id: parsed.data.jobId } });
  if (!job || job.status !== "OPEN") {
    return fail("This position is no longer accepting applications.", 410);
  }

  const application = await db.jobApplication.create({
    data: {
      jobId: parsed.data.jobId,
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      coverLetter: parsed.data.coverLetter ?? null,
      resumeUrl: parsed.data.resumeUrl ?? null,
      portfolioUrl: parsed.data.portfolioUrl ?? null,
    },
  });

  logActivity({ action: "JOB_APPLICATION_CREATED", entity: "JobApplication", entityId: application.id, ipAddress: ip }).catch(() => {});

  return ok({ id: application.id }, "Your application has been submitted successfully. We will contact you if shortlisted.", 201);
}
