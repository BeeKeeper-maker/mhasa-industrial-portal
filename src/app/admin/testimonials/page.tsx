import { ResourceManager } from "@/components/admin/resource-manager";
import { AdminAuthGuard } from "@/components/admin/auth-guard";

export const metadata = { title: "Admin — Testimonials" };

export default function TestimonialsAdminPage() {
  return (
    <AdminAuthGuard>
      <ResourceManager resource="testimonials" title="Testimonials" />
    </AdminAuthGuard>
  );
}
