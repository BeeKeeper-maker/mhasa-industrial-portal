import type { Metadata } from "next";
import { CareersView } from "@/components/views/careers-view";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join MHASA — current job vacancies and career opportunities in Saudi Arabia's industrial sector.",
};

export const dynamic = "force-static";

export default function CareersPage() {
  
  return <CareersView />;
}
