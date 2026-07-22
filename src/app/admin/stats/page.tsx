import { ResourceManager } from "@/components/admin/resource-manager";
import { AdminAuthGuard } from "@/components/admin/auth-guard";

export const metadata = { title: "Admin — Stats" };

export default function StatsAdminPage() {
  return (
    <AdminAuthGuard>
      <ResourceManager resource="stats" title="Stats" />
    </AdminAuthGuard>
  );
}
