import type { Metadata } from "next";
import { AboutView } from "@/components/views/about-view";

export const metadata: Metadata = {
  title: "About MHASA",
  description: "Three decades of engineering excellence in industrial pipe installation and specialized solutions for the Kingdom's largest projects.",
};

export const dynamic = "force-static";

export default function AboutPage() {
  
  return <AboutView />;
}
