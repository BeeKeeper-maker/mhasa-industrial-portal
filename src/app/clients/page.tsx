import type { Metadata } from "next";
import { ClientsView } from "@/components/views/clients-view";

export const metadata: Metadata = {
  title: "Our Clients",
  description: "Trusted by Saudi Arabia's leading oil & gas, petrochemical, and industrial operators.",
};

export const dynamic = "force-static";

export default function ClientsPage() {
  return <ClientsView />;
}
