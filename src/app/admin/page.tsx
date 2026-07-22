// ============================================================================
// Admin Home — overview dashboard.
// Shows stats, charts, recent activity.
// ============================================================================

"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { AdminOverview } from "@/components/admin/panels/overview";

export default function AdminPage() {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to access the admin dashboard.</p>
          <Link href="/api/auth/signin" className="text-primary underline">Sign In</Link>
        </div>
      </div>
    );
  }

  return <AdminOverview />;
}
