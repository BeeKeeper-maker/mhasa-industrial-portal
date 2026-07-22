// ============================================================================
// Admin Home — overview dashboard.
// Login is handled by admin/layout.tsx (shows login form if not authenticated).
// This page only renders when authenticated.
// ============================================================================

"use client";

import { AdminOverview } from "@/components/admin/panels/overview";

export default function AdminPage() {
  return <AdminOverview />;
}
