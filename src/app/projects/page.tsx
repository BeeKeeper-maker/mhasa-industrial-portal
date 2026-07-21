import type { Metadata } from "next";
import { ProjectsView } from "@/components/views/projects-view";

export const metadata: Metadata = {
  title: "Projects",
  description: "Explore our portfolio of industrial pipe installation projects for the Kingdom's largest operators.",
};

export const dynamic = "force-static";

export default function ProjectsPage() {
  
  return <ProjectsView />;
}
