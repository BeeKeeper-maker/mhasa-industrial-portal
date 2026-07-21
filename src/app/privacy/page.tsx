import type { Metadata } from "next";
import { PrivacyView } from "@/components/views/legal-view";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How MHASA collects, uses, and protects your personal information.",
};

export const dynamic = "force-static";

export default function PrivacyPage() {
  return <PrivacyView />;
}
