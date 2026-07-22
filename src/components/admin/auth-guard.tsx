// ============================================================================
// Admin Auth Guard — simple wrapper that checks session.
// Login is handled by admin/layout.tsx — this is a safety net for sub-routes.
// ============================================================================

"use client";

import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, the layout will show the login form
  // This guard just prevents content flash during loading
  if (status !== "authenticated") {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
