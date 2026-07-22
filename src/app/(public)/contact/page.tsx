import type { Metadata } from "next";
import { ContactView } from "@/components/views/contact-view";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with MHASA for quotations, inquiries, and project discussions.",
};

export const dynamic = "force-static";

export default function ContactPage() {
  
  return <ContactView />;
}
