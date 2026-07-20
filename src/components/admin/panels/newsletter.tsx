// ============================================================================
// Admin Newsletter Panel — view subscribers with stats + CSV export.
// ============================================================================

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mail, Loader2, Download, Users, TrendingUp, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export function AdminNewsletter() {
  const [filter, setFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-newsletter", filter],
    queryFn: async () => {
      const url = filter === "all" ? "/api/admin/newsletter" : `/api/admin/newsletter?status=${filter}`;
      const res = await fetch(url);
      const json = await res.json();
      return json.success ? json.data : { subscribers: [], stats: { active: 0, total: 0 } };
    },
  });

  const subscribers = data?.subscribers ?? [];
  const stats = data?.stats ?? { active: 0, total: 0 };

  const exportCsv = () => {
    if (!subscribers.length) return;
    const headers = ["Email", "Name", "Locale", "Source", "Status", "Subscribed At"];
    const rows = subscribers.map((s: Record<string, unknown>) => [
      s.email, s.name ?? "", s.locale ?? "en", s.source ?? "footer",
      s.isActive ? "Active" : "Unsubscribed",
      new Date(s.createdAt as string).toLocaleString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mhasa-newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cards = [
    { label: "Total Subscribers", value: stats.total, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Active", value: stats.active, icon: TrendingUp, color: "text-green-600 bg-green-50" },
    { label: "Unsubscribed", value: stats.total - stats.active, icon: Mail, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Newsletter Subscribers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your mailing list</p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Filter" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={!subscribers.length}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <div className="flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-foreground">{c.value}</div>
            <div className="text-sm text-muted-foreground">{c.label}</div>
          </Card>
        ))}
      </div>

      {/* Subscribers list */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : subscribers.length === 0 ? (
        <Card className="p-12 text-center">
          <Mail className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">No subscribers yet</p>
        </Card>
      ) : (
        <Card className="p-2">
          <div className="space-y-1">
            {subscribers.map((s: Record<string, unknown> & { id: string }) => (
              <div key={s.id} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{s.email as string}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {Boolean(s.name) && <span>{s.name as string}</span>}
                    <span>·</span>
                    <span>{(s.source as string) ?? "footer"}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-0.5">
                      <Calendar className="h-3 w-3" />
                      {new Date(s.createdAt as string).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Badge variant={s.isActive ? "default" : "outline"} className="text-xs">
                  {s.isActive ? "Active" : "Unsubscribed"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
