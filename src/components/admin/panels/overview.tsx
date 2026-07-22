// ============================================================================
// Admin Overview — dashboard summary with stats and recent activity.
// ============================================================================

"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { Phone, Users, FileText, TrendingUp, ArrowUpRight, Mail, Calendar, Briefcase, Building2, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LeadsOverTimeChart, ApplicationsByStatusChart, LeadsByStatusChart,
  ContentCountsGrid, TopCategoriesChart,
} from "@/components/admin/charts";
import { cn } from "@/lib/utils";

async function fetchAdmin(url: string) {
  const res = await fetch(url);
  const json = await res.json();
  return json.success ? json.data : null;
}

const DATE_RANGES = [
  { days: 7, label: "7D" },
  { days: 30, label: "30D" },
  { days: 90, label: "90D" },
];

export function AdminOverview() {
  const [days, setDays] = useState(30);
  const { data: leads } = useQuery({ queryKey: ["admin-leads"], queryFn: () => fetchAdmin("/api/admin/leads") });
  const { data: applications } = useQuery({ queryKey: ["admin-applications"], queryFn: () => fetchAdmin("/api/admin/applications") });
  const { data: projects } = useQuery({ queryKey: ["admin-projects"], queryFn: () => fetchAdmin("/api/admin/projects") });
  const { data: newsletter } = useQuery({ queryKey: ["admin-newsletter"], queryFn: () => fetchAdmin("/api/admin/newsletter") });
  const { data: activity } = useQuery({ queryKey: ["admin-activity"], queryFn: () => fetchAdmin("/api/admin/activity") });

  const newLeads = (leads ?? []).filter((l: { status: string }) => l.status === "NEW").length;
  const newApps = (applications ?? []).filter((a: { status: string }) => a.status === "NEW").length;
  const activeSubs = (newsletter as { stats?: { active?: number } } | null)?.stats?.active ?? 0;

  const stats = [
    { label: "New Leads", value: newLeads, total: leads?.length ?? 0, icon: Phone, color: "text-blue-600 bg-blue-50" },
    { label: "New Applications", value: newApps, total: applications?.length ?? 0, icon: Users, color: "text-green-600 bg-green-50" },
    { label: "Newsletter Subs", value: activeSubs, total: 0, icon: Mail, color: "text-amber-600 bg-amber-50" },
    { label: "Projects", value: projects?.length ?? 0, icon: FileText, color: "text-orange-600 bg-orange-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back. Here&apos;s what&apos;s happening with your site.</p>
        </div>
        {/* Date range selector */}
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card p-1">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground mx-1.5" />
          {DATE_RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-semibold transition-colors",
                days === r.days
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/leads"><Button variant="outline" size="sm" className="gap-1.5"><Phone className="h-3.5 w-3.5" />View Leads</Button></Link>
        <Link href="/admin/services"><Button variant="outline" size="sm" className="gap-1.5"><Briefcase className="h-3.5 w-3.5" />Manage Services</Button></Link>
        <Link href="/admin/projects"><Button variant="outline" size="sm" className="gap-1.5"><Building2 className="h-3.5 w-3.5" />Manage Projects</Button></Link>
        <Link href="/admin/blog"><Button variant="outline" size="sm" className="gap-1.5"><FileText className="h-3.5 w-3.5" />Write Blog Post</Button></Link>
        <Link href="/admin/settings"><Button variant="outline" size="sm" className="gap-1.5"><Settings className="h-3.5 w-3.5" />Site Settings</Button></Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              {s.total > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {s.total} total
                </Badge>
              )}
            </div>
            <div className="mt-3 text-3xl font-bold text-foreground">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LeadsOverTimeChart days={days} />
        <ApplicationsByStatusChart days={days} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LeadsByStatusChart days={days} />
        <TopCategoriesChart />
      </div>

      <ContentCountsGrid />

      {/* Recent Activity */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Recent Activity</h2>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </div>
        {activity && activity.length > 0 ? (
          <div className="space-y-2">
            {activity.slice(0, 8).map((a: { id: string; action: string; entity: string; createdAt: string; user?: { name?: string } }) => (
              <div key={a.id} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {a.action.split("_")[0]?.charAt(0) ?? "A"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {a.action.replace(/_/g, " ")} — {a.entity}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {a.user?.name ?? "System"} · {new Date(a.createdAt).toLocaleString()}
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/40" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
        )}
      </Card>
    </div>
  );
}
