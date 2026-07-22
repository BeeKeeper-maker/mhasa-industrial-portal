import { ResourceManager } from "@/components/admin/resource-manager";
import { AdminAuthGuard } from "@/components/admin/auth-guard";

export const metadata = { title: "Admin — Clients" };

export default function ClientsAdminPage() {
  return (
    <AdminAuthGuard>
      <ResourceManager resource="clients" title="Clients" />
    </AdminAuthGuard>
  );
}
