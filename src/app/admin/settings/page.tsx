import { ResourceManager } from "@/components/admin/resource-manager";
import { AdminAuthGuard } from "@/components/admin/auth-guard";
export const metadata = { title: "Admin — Site Settings" };
export default function SettingsPage() {
  return <AdminAuthGuard><ResourceManager resource="settings" title="Site Settings" /></AdminAuthGuard>;
}
