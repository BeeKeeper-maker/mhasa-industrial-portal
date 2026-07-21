import type { Metadata } from "next";
import { GalleryView } from "@/components/views/gallery-view";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Explore our collection of project, equipment, team, and office photography.",
};

export const dynamic = "force-static";

export default function GalleryPage() {
  
  return <GalleryView />;
}
