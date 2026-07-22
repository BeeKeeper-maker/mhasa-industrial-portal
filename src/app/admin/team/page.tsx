import { ResourceManager } from "@/components/admin/resource-manager";
import { AdminAuthGuard } from "@/components/admin/auth-guard";

export const metadata = { title: "Admin — Team" };

export default function TeamAdminPage() {
  return (
    <AdminAuthGuard>
      <ResourceManager resource="team" title="Team" />
    </AdminAuthGuard>
  );
}
