// ============================================================================
// Admin Layout — wraps all /admin/* routes.
// Provides SessionProvider + AdminDashboard shell (sidebar + topbar).
// Does NOT include public Header/Footer (those are in (public)/layout.tsx).
// ============================================================================

import { Toaster } from "@/components/ui/sonner";
import { AdminSessionProvider } from "@/components/admin/session-provider";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const metadata = {
  title: "Admin Dashboard | MHASA",
  description: "Content management system",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminSessionProvider>
      <AdminDashboard>
        {children}
      </AdminDashboard>
      <Toaster richColors position="top-center" />
    </AdminSessionProvider>
  );
}
