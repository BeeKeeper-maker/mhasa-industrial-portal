// ============================================================================
// Admin Dashboard — tabbed content management interface.
// ============================================================================

"use client";

import { useState } from "react";
import {
  LayoutDashboard, Briefcase, Building2, FileText, Users, Image as ImageIcon,
  Star, Award, Phone, Settings, ScrollText, BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminOverview } from "@/components/admin/panels/overview";
import { AdminLeads } from "@/components/admin/panels/leads";
import { AdminApplications } from "@/components/admin/panels/applications";
import { ResourceManager } from "@/components/admin/resource-manager";

type Tab =
  | "overview"
  | "leads"
  | "applications"
  | "services"
  | "projects"
  | "blog"
  | "team"
  | "gallery"
  | "testimonials"
  | "clients"
  | "careers"
  | "faqs"
  | "heroes"
  | "stats"
  | "settings"
  | "activity";

const tabs: { key: Tab; label: string; icon: React.ElementType; group?: string }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "leads", label: "Contact Leads", icon: Phone },
  { key: "applications", label: "Job Applications", icon: Users },
  { key: "services", label: "Services", icon: Briefcase, group: "Content" },
  { key: "projects", label: "Projects", icon: Building2 },
  { key: "blog", label: "Blog / News", icon: FileText },
  { key: "team", label: "Team Members", icon: Users },
  { key: "gallery", label: "Gallery", icon: ImageIcon },
  { key: "testimonials", label: "Testimonials", icon: Star },
  { key: "clients", label: "Clients", icon: Award },
  { key: "careers", label: "Careers", icon: Briefcase },
  { key: "faqs", label: "FAQs", icon: FileText },
  { key: "heroes", label: "Hero Slides", icon: ImageIcon },
  { key: "stats", label: "Statistics", icon: BarChart3 },
  { key: "settings", label: "Site Settings", icon: Settings, group: "System" },
  { key: "activity", label: "Activity Log", icon: ScrollText },
];

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r border-border bg-card overflow-y-auto">
        <div className="p-3">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-0.5",
                tab === t.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <t.icon className="h-4 w-4 flex-shrink-0" />
              {t.label}
            </button>
          ))}
        </div>
      </aside>

      {/* Mobile tab selector */}
      <div className="md:hidden border-b border-border bg-card p-2 overflow-x-auto no-scrollbar">
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex-shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                tab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground bg-muted/50"
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main panel */}
      <div className="flex-1 overflow-y-auto bg-muted/20">
        <div className="p-4 md:p-6">
          {tab === "overview" && <AdminOverview />}
          {tab === "leads" && <AdminLeads />}
          {tab === "applications" && <AdminApplications />}
          {tab === "services" && <ResourceManager resource="services" title="Services" />}
          {tab === "projects" && <ResourceManager resource="projects" title="Projects" />}
          {tab === "blog" && <ResourceManager resource="blog" title="Blog / News" />}
          {tab === "team" && <ResourceManager resource="team" title="Team Members" />}
          {tab === "gallery" && <ResourceManager resource="gallery" title="Gallery" />}
          {tab === "testimonials" && <ResourceManager resource="testimonials" title="Testimonials" />}
          {tab === "clients" && <ResourceManager resource="clients" title="Clients" />}
          {tab === "careers" && <ResourceManager resource="careers" title="Job Vacancies" />}
          {tab === "faqs" && <ResourceManager resource="faqs" title="FAQ Items" />}
          {tab === "heroes" && <ResourceManager resource="heroes" title="Hero Slides" />}
          {tab === "stats" && <ResourceManager resource="stats" title="Statistics" />}
          {tab === "settings" && <ResourceManager resource="settings" title="Site Settings" />}
          {tab === "activity" && <ResourceManager resource="activity" title="Activity Log" />}
        </div>
      </div>
    </div>
  );
}
