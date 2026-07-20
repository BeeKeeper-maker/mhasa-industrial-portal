// ============================================================================
// Admin Charts — analytics visualizations for the dashboard overview.
// Uses Recharts (already installed). Includes:
//   - LeadsOverTimeChart (area chart, last 30 days)
//   - ApplicationsByStatusChart (donut chart)
//   - LeadsByStatusChart (horizontal bar chart)
//   - ContentCountsGrid (stat tiles)
// ============================================================================

"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";
import { TrendingUp, Users, FileText, Mail, Loader2, Briefcase, Building2, Star, Image as ImageIcon, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatsData {
  leadsTimeSeries: { date: string; count: number; label: string }[];
  appsByStatus: Record<string, number>;
  leadsByStatus: Record<string, number>;
  contentCounts: Record<string, number>;
  topCategories: { name: string; count: number; totalValue: number }[];
  leadsByBudget: Record<string, number>;
  totals: { leads: number; applications: number; recentLeads: number };
}

async function fetchStats(days: number = 30): Promise<StatsData | null> {
  const res = await fetch(`/api/admin/stats?days=${days}`);
  const json = await res.json();
  return json.success ? json.data : null;
}

const STATUS_COLORS: Record<string, string> = {
  NEW: "#3b82f6",
  CONTACTED: "#f59e0b",
  REVIEWING: "#8b5cf6",
  QUALIFIED: "#8b5cf6",
  SHORTLISTED: "#8b5cf6",
  CONVERTED: "#10b981",
  HIRED: "#10b981",
  REJECTED: "#ef4444",
  LOST: "#ef4444",
};

// ============================================================================
// Leads Over Time — area chart
// ============================================================================
export function LeadsOverTimeChart({ days = 30 }: { days?: number }) {
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats", days], queryFn: () => fetchStats(days) });

  if (isLoading) {
    return (
      <Card className="p-5">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  const series = data?.leadsTimeSeries ?? [];
  const total = series.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            Leads — Last 30 Days
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{total} inquiries received</p>
        </div>
        <Badge variant="secondary" className="text-xs">{data?.totals.leads ?? 0} total</Badge>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={series} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#6b7280" }}
            interval={4}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#6b7280" }}
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "none",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#fff",
            }}
            labelStyle={{ color: "#fbbf24" }}
            formatter={(v: number) => [`${v} leads`, "Inquiries"]}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#leadGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "#3b82f6" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ============================================================================
// Applications By Status — donut chart
// ============================================================================
export function ApplicationsByStatusChart({ days = 30 }: { days?: number }) {
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats", days], queryFn: () => fetchStats(days) });

  if (isLoading) {
    return (
      <Card className="p-5">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  const statusData = Object.entries(data?.appsByStatus ?? {}).map(([name, value]) => ({
    name,
    value,
    color: STATUS_COLORS[name] ?? "#6b7280",
  }));

  const total = statusData.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-green-600" />
            Applications by Status
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{total} total applications</p>
        </div>
      </div>
      {total === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          No applications yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {statusData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "none",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#fff",
              }}
              formatter={(v: number, n: string) => [`${v} applications`, n]}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

// ============================================================================
// Leads By Status — horizontal bar chart
// ============================================================================
export function LeadsByStatusChart({ days = 30 }: { days?: number }) {
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats", days], queryFn: () => fetchStats(days) });

  if (isLoading) {
    return (
      <Card className="p-5">
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  const statusData = Object.entries(data?.leadsByStatus ?? {}).map(([name, value]) => ({
    name,
    value,
    fill: STATUS_COLORS[name] ?? "#6b7280",
  }));

  return (
    <Card className="p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Mail className="h-4 w-4 text-purple-600" />
          Leads Pipeline
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">Breakdown by status</p>
      </div>
      {statusData.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          No leads yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={statusData} layout="vertical" margin={{ left: 10, right: 10 }}>
            <XAxis type="number" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: "#374151" }}
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "none",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#fff",
              }}
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
              formatter={(v: number) => [`${v} leads`, "Count"]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

// ============================================================================
// Content Counts Grid — quick stat tiles for all content types
// ============================================================================
export function ContentCountsGrid() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: fetchStats });

  if (isLoading || !data) {
    return (
      <Card className="p-5">
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  const counts = data.contentCounts;
  const items = [
    { label: "Services", value: counts.services, icon: Briefcase, color: "text-purple-600 bg-purple-50" },
    { label: "Projects", value: counts.projects, icon: Building2, color: "text-orange-600 bg-orange-50" },
    { label: "Blog Posts", value: counts.blogPosts, icon: FileText, color: "text-blue-600 bg-blue-50" },
    { label: "Team", value: counts.teamMembers, icon: Users, color: "text-green-600 bg-green-50" },
    { label: "Testimonials", value: counts.testimonials, icon: Star, color: "text-amber-600 bg-amber-50" },
    { label: "Clients", value: counts.clients, icon: Award, color: "text-indigo-600 bg-indigo-50" },
    { label: "Jobs", value: counts.jobs, icon: Briefcase, color: "text-cyan-600 bg-cyan-50" },
    { label: "Gallery", value: counts.galleryItems, icon: ImageIcon, color: "text-pink-600 bg-pink-50" },
    { label: "FAQs", value: counts.faqs, icon: FileText, color: "text-teal-600 bg-teal-50" },
    { label: "Subscribers", value: counts.subscribers, icon: Mail, color: "text-red-600 bg-red-50" },
  ];

  return (
    <Card className="p-5">
      <h3 className="font-semibold text-foreground mb-4">Content Overview</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-border/60 p-3 text-center hover:shadow-sm transition-shadow">
            <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg ${item.color} mb-2`}>
              <item.icon className="h-4 w-4" />
            </div>
            <div className="text-xl font-bold text-foreground">{item.value}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{item.label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============================================================================
// Top Project Categories — bar chart with value
// ============================================================================
export function TopCategoriesChart() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: fetchStats });

  if (isLoading) {
    return (
      <Card className="p-5">
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  const categories = data?.topCategories ?? [];

  return (
    <Card className="p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Building2 className="h-4 w-4 text-orange-600" />
          Projects by Category
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">Distribution across service lines</p>
      </div>
      {categories.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          No projects yet
        </div>
      ) : (
        <div className="space-y-2.5">
          {categories.map((cat) => {
            const maxCount = Math.max(...categories.map((c) => c.count), 1);
            const pct = (cat.count / maxCount) * 100;
            return (
              <div key={cat.name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-foreground">{cat.name}</span>
                  <span className="text-muted-foreground">{cat.count} projects</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-navy to-gold transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {cat.totalValue > 0 && (
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Total value: SAR {cat.totalValue.toLocaleString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
