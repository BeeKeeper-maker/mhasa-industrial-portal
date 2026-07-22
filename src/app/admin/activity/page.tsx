import { ResourceManager } from "@/components/admin/resource-manager";
import { AdminAuthGuard } from "@/components/admin/auth-guard";
export const metadata = { title: "Admin — Activity Log" };
export default function ActivityPage() {
  return <AdminAuthGuard><ResourceManager resource="activity" title="Activity Log" /></AdminAuthGuard>;
}
