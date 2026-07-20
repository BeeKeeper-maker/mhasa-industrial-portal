// ============================================================================
// Activity Logger — records admin actions for audit trail.
// ============================================================================

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface LogOptions {
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userId?: string;
}

/** Log an activity. Non-blocking — errors are swallowed. */
export async function logActivity(opts: LogOptions): Promise<void> {
  try {
    let userId = opts.userId;
    if (!userId) {
      const session = await getServerSession(authOptions);
      userId = session?.user ? (session.user as { id?: string }).id : undefined;
    }
    await db.activityLog.create({
      data: {
        userId: userId ?? null,
        action: opts.action,
        entity: opts.entity,
        entityId: opts.entityId ?? null,
        metadata: opts.metadata ? JSON.stringify(opts.metadata) : null,
        ipAddress: opts.ipAddress ?? null,
      },
    });
  } catch {
    // Activity logging is best-effort; never block the main operation.
  }
}
