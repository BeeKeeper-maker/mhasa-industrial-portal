import { ResourceManager } from "@/components/admin/resource-manager";
import { AdminAuthGuard } from "@/components/admin/auth-guard";

export const metadata = { title: "Admin — Blog" };

export default function BlogAdminPage() {
  return (
    <AdminAuthGuard>
      <ResourceManager resource="blog" title="Blog" />
    </AdminAuthGuard>
  );
}
