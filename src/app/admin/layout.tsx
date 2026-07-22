// ============================================================================
// Admin Layout — wraps all /admin/* routes.
// Server Component: exports metadata, wraps client component.
// ============================================================================

import { Toaster } from "@/components/ui/sonner";
import { AdminSessionProvider } from "@/components/admin/session-provider";
import { AdminLayoutInner } from "@/components/admin/admin-layout-inner";

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
      <AdminLayoutInner>
        {children}
      </AdminLayoutInner>
      <Toaster richColors position="top-center" />
    </AdminSessionProvider>
  );
}
