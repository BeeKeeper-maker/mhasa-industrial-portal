// ============================================================================
// Admin Dashboard Shell — sidebar navigation + content area.
// Each section is a separate URL (/admin/services, /admin/projects, etc.)
// This component renders the sidebar + top bar, children render in content area.
// ============================================================================

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Briefcase, Building2, FileText, Users, Image as ImageIcon,
  Star, Award, Phone, Settings, ScrollText, BarChart3, Mail, Search,
  LogOut, ArrowLeft, Shield, Menu, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminSearch } from "@/components/admin/admin-search";
import { cn } from "@/lib/utils";

type Tab =
  | "overview"
  | "leads"
  | "applications"
  | "newsletter"
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

const tabs: { key: Tab; label: string; icon: React.ElementType; path: string }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard, path: "/admin" },
  { key: "leads", label: "Contact Leads", icon: Phone, path: "/admin/leads" },
  { key: "applications", label: "Job Applications", icon: Users, path: "/admin/applications" },
  { key: "newsletter", label: "Newsletter", icon: Mail, path: "/admin/newsletter" },
  { key: "services", label: "Services", icon: Briefcase, path: "/admin/services" },
  { key: "projects", label: "Projects", icon: Building2, path: "/admin/projects" },
  { key: "blog", label: "Blog / News", icon: FileText, path: "/admin/blog" },
  { key: "team", label: "Team Members", icon: Users, path: "/admin/team" },
  { key: "gallery", label: "Gallery", icon: ImageIcon, path: "/admin/gallery" },
  { key: "testimonials", label: "Testimonials", icon: Star, path: "/admin/testimonials" },
  { key: "clients", label: "Clients", icon: Award, path: "/admin/clients" },
  { key: "careers", label: "Careers", icon: Briefcase, path: "/admin/careers" },
  { key: "faqs", label: "FAQs", icon: FileText, path: "/admin/faqs" },
  { key: "heroes", label: "Hero Slides", icon: ImageIcon, path: "/admin/heroes" },
  { key: "stats", label: "Statistics", icon: BarChart3, path: "/admin/stats" },
  { key: "settings", label: "Site Settings", icon: Settings, path: "/admin/settings" },
  { key: "activity", label: "Activity Log", icon: ScrollText, path: "/admin/activity" },
];

export function AdminDashboard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/admin") return pathname === "/admin";
    return pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      <AdminSearch open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative z-50 md:z-0 w-64 h-full flex-shrink-0 border-r border-border bg-card overflow-y-auto transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-3">
          {/* Search button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors mb-3"
          >
            <Search className="h-4 w-4" />
            <span>Search all…</span>
            <kbd className="ms-auto rounded border border-border bg-background px-1 font-mono text-[10px]">⌘K</kbd>
          </button>

          {/* Nav items */}
          <nav className="space-y-0.5">
            {tabs.map((t) => (
              <Link
                key={t.key}
                href={t.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive(t.path)
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <t.icon className="h-4 w-4 flex-shrink-0" />
                {t.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-border bg-navy px-4 py-3 text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-white"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/20 text-gold">
              <Shield className="h-4 w-4" />
            </div>
            <div className="hidden sm:block">
              <div className="font-display font-bold text-sm">MHASA Admin</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">View Site</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/admin" })}
              className="text-white hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
