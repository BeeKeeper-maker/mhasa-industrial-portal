// ============================================================================
// Admin Layout — separate from public site (no Header/Footer/overlays).
// Uses a client wrapper for SessionProvider.
// ============================================================================

import { Toaster } from "@/components/ui/sonner";
import { AdminSessionProvider } from "@/components/admin/session-provider";

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
      <div className="min-h-screen bg-muted/20">
        {children}
      </div>
      <Toaster richColors position="top-center" />
    </AdminSessionProvider>
  );
}
