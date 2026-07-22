import { AdminApplications } from "@/components/admin/panels/applications";
import { AdminAuthGuard } from "@/components/admin/auth-guard";
export const metadata = { title: "Admin — Job Applications" };
export default function ApplicationsPage() {
  return <AdminAuthGuard><AdminApplications /></AdminAuthGuard>;
}
