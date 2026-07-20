// ============================================================================
// Admin Applications Panel — job application inbox with status workflow.
// ============================================================================

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, Phone, Trash2, Loader2, Users, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Job Applications</h1>
          <p className="text-sm text-muted-foreground mt-1">{apps.length} applications received</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Filter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

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
            <Card key={app.id} className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
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

              {app.coverLetter && (
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
                {app.resumeUrl && (
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
