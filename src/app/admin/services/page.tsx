import { ResourceManager } from "@/components/admin/resource-manager";
import { AdminAuthGuard } from "@/components/admin/auth-guard";

export const metadata = { title: "Admin — Services" };

export default function ServicesAdminPage() {
  return (
    <AdminAuthGuard>
      <ResourceManager resource="services" title="Services" />
    </AdminAuthGuard>
  );
}
