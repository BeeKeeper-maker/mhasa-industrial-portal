import { ResourceManager } from "@/components/admin/resource-manager";
import { AdminAuthGuard } from "@/components/admin/auth-guard";

export const metadata = { title: "Admin — Gallery" };

export default function GalleryAdminPage() {
  return (
    <AdminAuthGuard>
      <ResourceManager resource="gallery" title="Gallery" />
    </AdminAuthGuard>
  );
}
