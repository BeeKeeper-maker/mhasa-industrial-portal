// ============================================================================
// Admin Applications Panel — job application inbox with status workflow.
// ============================================================================

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, Phone, Trash2, Loader2, Users, FileText, CheckSquare, Square, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

const STATUSES = ["NEW", "REVIEWING", "SHORTLISTED", "REJECTED", "HIRED"] as const;
const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  REVIEWING: "bg-amber-100 text-amber-700",
  SHORTLISTED: "bg-purple-100 text-purple-700",
  REJECTED: "bg-red-100 text-red-700",
  HIRED: "bg-green-100 text-green-700",
};

export function AdminApplications() {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const queryClient = useQueryClient();

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ["admin-applications", filter],
    queryFn: async () => {
      const url = filter === "all" ? "/api/admin/applications" : `/api/admin/applications?status=${filter}`;
      const res = await fetch(url);
      const json = await res.json();
      return json.success ? json.data : [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      toast.success("Status updated");
    },
  });

  const deleteApp = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/applications/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      toast.success("Application deleted");
    },
  });

  const bulkDelete = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/applications/${id}`, { method: "DELETE" }).then((r) => r.json())
        )
      );
      const failed = results.filter((r: { success?: boolean }) => !r.success);
      if (failed.length) throw new Error(`${failed.length} deletions failed`);
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      toast.success(`${selected.size} applications deleted`);
      setSelected(new Set());
      setBulkMode(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const bulkStatusChange = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      const results = await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/applications/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          }).then((r) => r.json())
        )
      );
      const failed = results.filter((r: { success?: boolean }) => !r.success);
      if (failed.length) throw new Error(`${failed.length} updates failed`);
      return results;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      toast.success(`${variables.ids.length} applications → ${variables.status}`);
      setSelected(new Set());
      setBulkMode(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === apps.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(apps.map((a: { id: string }) => a.id)));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Job Applications</h1>
          <p className="text-sm text-muted-foreground mt-1">{apps.length} applications received</p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Filter" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button
            variant={bulkMode ? "default" : "outline"}
            size="sm"
            onClick={() => { setBulkMode(!bulkMode); setSelected(new Set()); }}
            disabled={!apps.length}
          >
            <CheckSquare className="h-4 w-4" />
            {bulkMode ? "Exit Bulk" : "Select"}
          </Button>
        </div>
      </div>

      {/* Bulk action bar */}
      {bulkMode && apps.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gold/30 bg-gold/5 p-3">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {selected.size === apps.length ? (
                <CheckSquare className="h-4 w-4 text-gold" />
              ) : (
                <Square className="h-4 w-4 text-muted-foreground" />
              )}
              {selected.size === apps.length ? "Deselect All" : "Select All"}
            </button>
            <span className="text-sm text-muted-foreground">{selected.size} selected</span>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {selected.size > 0 && (
              <Select
                value=""
                onValueChange={(v) => {
                  if (v && confirm(`Change status of ${selected.size} applications to "${v}"?`)) {
                    bulkStatusChange.mutate({ ids: Array.from(selected), status: v });
                  }
                }}
              >
                <SelectTrigger className="h-8 w-[150px] text-xs">
                  <SelectValue placeholder="Set status…" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            <Button
              variant="destructive"
              size="sm"
              disabled={selected.size === 0 || bulkDelete.isPending}
              onClick={() => {
                if (confirm(`Delete ${selected.size} selected applications? This cannot be undone.`)) {
                  bulkDelete.mutate(Array.from(selected));
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setBulkMode(false); setSelected(new Set()); }}
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : apps.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">No applications found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {apps.map((app: Record<string, unknown> & { id: string }) => (
            <Card
              key={app.id}
              className={`p-4 transition-all ${
                bulkMode && selected.has(app.id) ? "ring-2 ring-gold border-gold/40" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                {/* Checkbox (bulk mode) */}
                {bulkMode && (
                  <Checkbox
                    checked={selected.has(app.id)}
                    onCheckedChange={() => toggleSelect(app.id)}
                    className="mt-1 border-gold/40 data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-foreground">{app.fullName as string}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {(app.job as { title?: string })?.title ?? "Unknown position"}
                  </p>
                </div>
                <Badge className={statusColors[app.status as string] ?? ""}>{app.status as string}</Badge>
              </div>

              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{app.email as string}</div>
                <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{app.phone as string}</div>
              </div>

              {Boolean(app.coverLetter) && (
                <div className="mt-3 rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground line-clamp-3">{app.coverLetter as string}</p>
                </div>
              )}

              <div className="mt-3 flex items-center gap-2">
                <Select value={app.status as string} onValueChange={(v) => updateStatus.mutate({ id: app.id, status: v })}>
                  <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                {Boolean(app.resumeUrl) && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8"><FileText className="h-3.5 w-3.5" /></Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh]">
                      <DialogHeader><DialogTitle>Resume — {app.fullName as string}</DialogTitle></DialogHeader>
                      {(app.resumeUrl as string).startsWith("data:application/pdf") ? (
                        <iframe src={app.resumeUrl as string} className="w-full h-[70vh] rounded-lg" title="Resume" />
                      ) : (
                        <a href={app.resumeUrl as string} download className="text-primary underline">Download resume</a>
                      )}
                    </DialogContent>
                  </Dialog>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteApp.mutate(app.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
