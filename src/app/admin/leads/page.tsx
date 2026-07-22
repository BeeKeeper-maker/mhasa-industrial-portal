import { AdminLeads } from "@/components/admin/panels/leads";
import { AdminAuthGuard } from "@/components/admin/auth-guard";
export const metadata = { title: "Admin — Contact Leads" };
export default function LeadsPage() {
  return <AdminAuthGuard><AdminLeads /></AdminAuthGuard>;
}
