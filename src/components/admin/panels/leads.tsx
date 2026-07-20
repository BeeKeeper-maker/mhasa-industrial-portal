// ============================================================================
// Admin Leads Panel — inbox for contact form submissions with status workflow.
// ============================================================================

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Phone, Mail, Building2, Trash2, Download, Loader2, Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"] as const;
const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700 border-blue-200",
  CONTACTED: "bg-amber-100 text-amber-700 border-amber-200",
  QUALIFIED: "bg-purple-100 text-purple-700 border-purple-200",
  CONVERTED: "bg-green-100 text-green-700 border-green-200",
  LOST: "bg-red-100 text-red-700 border-red-200",
};

export function AdminLeads() {
  const [filter, setFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["admin-leads", filter],
    queryFn: async () => {
      const url = filter === "all" ? "/api/admin/leads" : `/api/admin/leads?status=${filter}`;
      const res = await fetch(url);
      const json = await res.json();
      return json.success ? json.data : [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
      toast.success("Status updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteLead = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
      toast.success("Lead deleted");
    },
  });

  const exportCsv = () => {
    if (!leads.length) return;
    const headers = ["Name", "Company", "Email", "Phone", "Subject", "Budget", "Status", "Date"];
    const rows = leads.map((l: Record<string, string>) => [
      l.name, l.company ?? "", l.email, l.phone, l.subject, l.projectBudget ?? "", l.status, new Date(l.createdAt).toLocaleString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mhasa-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contact Leads</h1>
          <p className="text-sm text-muted-foreground mt-1">{leads.length} inquiries received</p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Filter" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={!leads.length}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : leads.length === 0 ? (
        <Card className="p-12 text-center">
          <Inbox className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">No leads found</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {leads.map((lead: Record<string, unknown> & { id: string }) => (
            <Card key={lead.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">{lead.name as string}</h3>
                    <Badge variant="outline" className={statusColors[lead.status as string] ?? ""}>
                      {lead.status as string}
                    </Badge>
                    {lead.projectBudget && (
                      <Badge variant="secondary" className="text-xs">{lead.projectBudget as string}</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    {lead.company && (
                      <div className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5" />{lead.company as string}</div>
                    )}
                    <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{lead.email as string}</div>
                    <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{lead.phone as string}</div>
                    <div className="text-xs">{new Date(lead.createdAt as string).toLocaleString()}</div>
                  </div>
                  <div className="mt-3 rounded-lg bg-muted/50 p-3">
                    <div className="text-xs font-semibold text-foreground mb-1">{lead.subject as string}</div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lead.message as string}</p>
                  </div>
                </div>
                <div className="flex md:flex-col gap-2 md:w-40">
                  <Select
                    value={lead.status as string}
                    onValueChange={(v) => updateStatus.mutate({ id: lead.id, status: v })}
                  >
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteLead.mutate(lead.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
