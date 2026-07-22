// ============================================================================
// Admin Dashboard Shell — sidebar navigation + content area.
// Features: collapsible sidebar groups, mobile drawer, URL-based navigation.
// ============================================================================

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Briefcase, Building2, FileText, Users, Image as ImageIcon,
  Star, Award, Phone, Settings, ScrollText, BarChart3, Mail, Search,
  LogOut, ArrowLeft, Shield, Menu, X, ChevronDown, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminSearch } from "@/components/admin/admin-search";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Dashboard",
    items: [
      { label: "Overview", icon: LayoutDashboard, path: "/admin" },
    ],
  },
  {
    label: "Inbox",
    items: [
      { label: "Contact Leads", icon: Phone, path: "/admin/leads" },
      { label: "Job Applications", icon: Users, path: "/admin/applications" },
      { label: "Newsletter", icon: Mail, path: "/admin/newsletter" },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Services", icon: Briefcase, path: "/admin/services" },
      { label: "Projects", icon: Building2, path: "/admin/projects" },
      { label: "Blog / News", icon: FileText, path: "/admin/blog" },
      { label: "Team Members", icon: Users, path: "/admin/team" },
      { label: "Gallery", icon: ImageIcon, path: "/admin/gallery" },
      { label: "Testimonials", icon: Star, path: "/admin/testimonials" },
      { label: "Clients", icon: Award, path: "/admin/clients" },
      { label: "Careers", icon: Briefcase, path: "/admin/careers" },
      { label: "FAQs", icon: FileText, path: "/admin/faqs" },
      { label: "Hero Slides", icon: ImageIcon, path: "/admin/heroes" },
      { label: "Statistics", icon: BarChart3, path: "/admin/stats" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Site Settings", icon: Settings, path: "/admin/settings" },
      { label: "Activity Log", icon: ScrollText, path: "/admin/activity" },
    ],
  },
];

export function AdminDashboard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const isActive = (path: string) => {
    if (path === "/admin") return pathname === "/admin";
    return pathname.startsWith(path);
  };

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  // Check if any item in a group is active (auto-expand active group)
  const isGroupActive = (group: NavGroup) =>
    group.items.some((item) => isActive(item.path));

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
          "fixed md:relative z-50 md:z-0 w-64 h-full flex-shrink-0 border-r border-border bg-card overflow-y-auto transition-transform duration-300 no-scrollbar",
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

          {/* Collapsible nav groups */}
          <nav className="space-y-1">
            {navGroups.map((group) => {
              const collapsed = collapsedGroups.has(group.label) && !isGroupActive(group);
              return (
                <div key={group.label} className="mb-1">
                  {/* Group header */}
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className="flex w-full items-center gap-1.5 px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 hover:text-muted-foreground transition-colors"
                  >
                    {collapsed ? (
                      <ChevronRight className="h-3 w-3 rtl:rotate-180" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                    {group.label}
                  </button>

                  {/* Group items */}
                  {!collapsed && (
                    <div className="space-y-0.5 mt-0.5">
                      {group.items.map((item) => (
                        <Link
                          key={item.path}
                          href={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            isActive(item.path)
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
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
              aria-label="Toggle sidebar"
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
