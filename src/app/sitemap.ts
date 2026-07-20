import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://mhaksa.com";
  const lastModified = new Date();

  // Single-page app with view-state routing — all "pages" are accessible via the root URL
  const views = [
    { name: "Home", priority: 1.0 },
    { name: "About", priority: 0.9 },
    { name: "Services", priority: 0.9 },
    { name: "Projects", priority: 0.9 },
    { name: "Gallery", priority: 0.7 },
    { name: "Clients", priority: 0.7 },
    { name: "Careers", priority: 0.7 },
    { name: "News", priority: 0.8 },
    { name: "FAQ", priority: 0.6 },
    { name: "Contact", priority: 0.9 },
    { name: "Privacy Policy", priority: 0.3 },
    { name: "Terms & Conditions", priority: 0.3 },
  ];

  return views.map((view) => ({
    url: baseUrl,
    lastModified,
    changeFrequency: view.name === "News" || view.name === "Careers" ? "weekly" : "monthly",
    priority: view.priority,
  }));
}
