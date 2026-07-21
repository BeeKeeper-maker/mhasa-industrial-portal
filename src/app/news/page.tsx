import type { Metadata } from "next";
import { NewsView } from "@/components/views/news-view";

export const metadata: Metadata = {
  title: "News & Insights",
  description: "Latest industry news, company updates, and technical articles from MHASA.",
};

export const dynamic = "force-static";

export default function NewsPage() {
  
  return <NewsView />;
}
