import { ResourceManager } from "@/components/admin/resource-manager";
import { AdminAuthGuard } from "@/components/admin/auth-guard";

export const metadata = { title: "Admin — Heroes" };

export default function HeroesAdminPage() {
  return (
    <AdminAuthGuard>
      <ResourceManager resource="heroes" title="Heroes" />
    </AdminAuthGuard>
  );
}
