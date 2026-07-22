import { ResourceManager } from "@/components/admin/resource-manager";
import { AdminAuthGuard } from "@/components/admin/auth-guard";

export const metadata = { title: "Admin — Projects" };

export default function ProjectsAdminPage() {
  return (
    <AdminAuthGuard>
      <ResourceManager resource="projects" title="Projects" />
    </AdminAuthGuard>
  );
}
