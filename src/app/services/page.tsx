import type { Metadata } from "next";
import { ServicesView } from "@/components/views/services-view";

export const metadata: Metadata = {
  title: "Services",
  description: "Comprehensive industrial piping solutions — RTR, GRP, GRE, FRP pipe installation, sewer lines, and fiberglass engineering.",
};

export const dynamic = "force-static";

export default function ServicesPage() {
  
  return <ServicesView />;
}
