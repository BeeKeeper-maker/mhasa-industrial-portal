import type { Metadata } from "next";
import { FaqView } from "@/components/views/faq-view";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about MHASA services, capabilities, and processes.",
};

export const dynamic = "force-static";

export default function FaqPage() {
  
  return <FaqView />;
}
