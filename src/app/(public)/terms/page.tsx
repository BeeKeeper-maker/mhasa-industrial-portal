import type { Metadata } from "next";
import { TermsView } from "@/components/views/legal-view";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for using the MHASA website and services.",
};

export const dynamic = "force-static";

export default function TermsPage() {
  return <TermsView />;
}
