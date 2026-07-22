import { ResourceManager } from "@/components/admin/resource-manager";
import { AdminAuthGuard } from "@/components/admin/auth-guard";

export const metadata = { title: "Admin — Faqs" };

export default function FaqsAdminPage() {
  return (
    <AdminAuthGuard>
      <ResourceManager resource="faqs" title="Faqs" />
    </AdminAuthGuard>
  );
}
