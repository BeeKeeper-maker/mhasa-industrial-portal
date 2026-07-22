import { ResourceManager } from "@/components/admin/resource-manager";
import { AdminAuthGuard } from "@/components/admin/auth-guard";

export const metadata = { title: "Admin — Careers" };

export default function CareersAdminPage() {
  return (
    <AdminAuthGuard>
      <ResourceManager resource="careers" title="Careers" />
    </AdminAuthGuard>
  );
}
