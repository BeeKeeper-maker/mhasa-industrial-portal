import { AdminNewsletter } from "@/components/admin/panels/newsletter";
import { AdminAuthGuard } from "@/components/admin/auth-guard";
export const metadata = { title: "Admin — Newsletter" };
export default function NewsletterPage() {
  return <AdminAuthGuard><AdminNewsletter /></AdminAuthGuard>;
}
