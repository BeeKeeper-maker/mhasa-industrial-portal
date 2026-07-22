// ============================================================================
// Resource Manager — generic CRUD interface for admin content types.
// Handles: services, projects, blog, team, gallery, testimonials, clients,
// careers, faqs, heroes, stats, settings, activity.
// ============================================================================

"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit, Loader2, X, Save, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { resourceConfigs, type ResourceKey } from "@/components/admin/resource-configs";

interface ResourceManagerProps {
  resource: ResourceKey;
  title: string;
}

export function ResourceManager({ resource, title }: ResourceManagerProps) {
  const config = resourceConfigs[resource];
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin", resource],
    queryFn: async () => {
      const res = await fetch(`/api/admin/${resource}`);
      const json = await res.json();
      return json.success ? json.data : [];
    },
  });

  const save = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const id = data.id as string | undefined;
      const method = id ? "PUT" : "POST";
      const url = id ? `/api/admin/${resource}/${id}` : `/api/admin/${resource}`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", resource] });
      queryClient.invalidateQueries({ queryKey: ["site-data"] });
      queryClient.invalidateQueries({ queryKey: [resource] });
      toast.success(editing?.id ? "Updated successfully" : "Created successfully");
      setOpen(false);
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/${resource}/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", resource] });
      queryClient.invalidateQueries({ queryKey: ["site-data"] });
      toast.success("Deleted successfully");
    },
  });

  const handleEdit = (item: Record<string, unknown>) => {
    setEditing(item);
    setOpen(true);
  };

  const handleNew = () => {
    setEditing(null);
    setOpen(true);
  };

  const filtered = items.filter((item: Record<string, unknown>) => {
    if (!search) return true;
    const str = JSON.stringify(item).toLowerCase();
    return str.includes(search.toLowerCase());
  });

  // Special handling for settings (single record)
  if (resource === "settings") {
    return <SettingsManager />;
  }
  if (resource === "activity") {
    return <ActivityLogViewer />;
  }

  // For all other resources, config must exist
  if (!config) {
    return (
      <Card className="p-12 text-center text-muted-foreground">
        Configuration not found for &quot;{resource}&quot;.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{items.length} records</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="ps-8 w-[200px] h-9"
            />
          </div>
          <Button onClick={handleNew} size="sm">
            <Plus className="h-4 w-4" />
            Add New
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="mb-2 aspect-video rounded-lg bg-muted/40 animate-pulse" />
              <div className="h-4 w-3/4 rounded bg-muted/40 animate-pulse mb-2" />
              <div className="h-3 w-1/2 rounded bg-muted/40 animate-pulse" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              {search ? `No records matching "${search}"` : "No records yet."}
            </p>
            {!search && (
              <Button onClick={handleNew} size="sm" variant="outline">
                <Plus className="h-4 w-4" />
                Create First Record
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((item: Record<string, unknown>) => (
            <Card key={item.id as string} className="p-4 group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {(config.imageField && Boolean(item[config.imageField])) && (
                    <div className="mb-2 aspect-video rounded-lg overflow-hidden bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item[config.imageField] as string}
                        alt={String(item[config.titleField] ?? "")}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <h3 className="font-semibold text-foreground truncate">
                    {String(item[config.titleField] ?? "Untitled")}
                  </h3>
                  {config.subtitleField && Boolean(item[config.subtitleField]) && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {String(item[config.subtitleField])}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {config.badgeFields.map((field) =>
                      item[field] ? (
                        <Badge key={field} variant="secondary" className="text-[10px]">
                          {String(item[field])}
                        </Badge>
                      ) : null
                    )}
                    {"isActive" in item && (
                      <Badge variant={item.isActive ? "default" : "outline"} className="text-[10px]">
                        {item.isActive ? "Active" : "Hidden"}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" size="sm" onClick={() => handleEdit(item)} className="flex-1 h-8">
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { if (confirm("Delete this record?")) del.mutate(item.id as string); }}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit / Create Dialog */}
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editing ? <Edit className="h-5 w-5 text-gold" /> : <Plus className="h-5 w-5 text-gold" />}
              {editing ? `Edit ${title.slice(0, -1)}` : `New ${title.slice(0, -1)}`}
            </DialogTitle>
          </DialogHeader>
          {save.isError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <strong>Error:</strong> {save.error?.message ?? "Failed to save. Please try again."}
            </div>
          )}
          <ResourceForm
            config={config}
            initial={editing}
            onSubmit={(data) => save.mutate(data)}
            loading={save.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// -------- Generic Resource Form --------
function ResourceForm({
  config,
  initial,
  onSubmit,
  loading,
}: {
  config: NonNullable<typeof resourceConfigs[ResourceKey]>;
  initial: Record<string, unknown> | null;
  onSubmit: (data: Record<string, unknown>) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<Record<string, unknown>>(() => {
    const base: Record<string, unknown> = {};
    config.fields.forEach((f) => {
      base[f.name] = initial?.[f.name] ?? f.defaultValue ?? (f.type === "boolean" ? true : f.type === "number" ? 0 : f.type === "array" ? [] : "");
    });
    if (initial?.id) base.id = initial.id;
    return base;
  });

  const update = (name: string, value: unknown) => setForm((p) => ({ ...p, [name]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clean form data before sending: remove id, convert empty strings to null
    const cleanData: Record<string, unknown> = {};
    Object.entries(form).forEach(([key, value]) => {
      if (key === "id") return; // Don't send id in body
      if (value === "") {
        cleanData[key] = null;
      } else if (typeof value === "string" && value === "undefined") {
        cleanData[key] = null;
      } else {
        cleanData[key] = value;
      }
    });
    onSubmit(cleanData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {config.fields.map((field) => (
          <div key={field.name} className={field.fullWidth ? "md:col-span-2" : ""}>
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-destructive ms-1">*</span>}
            </Label>
            <div className="mt-1.5">
              {field.type === "textarea" ? (
                <Textarea
                  id={field.name}
                  value={String(form[field.name] ?? "")}
                  onChange={(e) => update(field.name, e.target.value)}
                  required={field.required}
                  rows={field.rows ?? 4}
                  className="resize-y"
                />
              ) : field.type === "boolean" ? (
                <div className="flex items-center gap-2 h-10">
                  <Switch
                    id={field.name}
                    checked={Boolean(form[field.name])}
                    onCheckedChange={(v) => update(field.name, v)}
                  />
                  <span className="text-sm text-muted-foreground">{form[field.name] ? "Yes" : "No"}</span>
                </div>
              ) : field.type === "number" ? (
                <Input
                  id={field.name}
                  type="number"
                  value={Number(form[field.name] ?? 0)}
                  onChange={(e) => update(field.name, Number(e.target.value))}
                  required={field.required}
                />
              ) : field.type === "array" ? (
                <ArrayInput
                  value={(form[field.name] as string[]) ?? []}
                  onChange={(v) => update(field.name, v)}
                  placeholder={field.placeholder ?? "Add item…"}
                />
              ) : field.type === "select" ? (
                <Select
                  value={String(form[field.name] ?? field.defaultValue ?? "")}
                  onValueChange={(v) => update(field.name, v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder ?? "Select…"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(field.options ?? []).map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === "image" ? (
                <ImageUploadField
                  value={String(form[field.name] ?? "")}
                  onChange={(v) => update(field.name, v)}
                  required={field.required}
                />
              ) : (
                <Input
                  id={field.name}
                  type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
                  value={String(form[field.name] ?? "")}
                  onChange={(e) => update(field.name, e.target.value)}
                  required={field.required}
                  placeholder={field.placeholder}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Save className="h-4 w-4 me-2" />}
          {initial?.id ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}

// -------- Array Input (for features, requirements, tags) --------
function ArrayInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim();
    if (v && !value.includes(v)) {
      onChange([...value, v]);
      setInput("");
    }
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
        />
        <Button type="button" size="sm" onClick={add}><Plus className="h-4 w-4" /></Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item, i) => (
            <Badge key={i} variant="secondary" className="gap-1">
              {item}
              <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// -------- Settings Manager (single record) --------
function SettingsManager() {
  const [form, setForm] = useState<Record<string, unknown>>({});
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      return json.success ? json.data : {};
    },
  });

  // Sync fetched data to form state
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (data) setForm(data);
  }, [data]);

  const save = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-data"] });
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Settings saved successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const settingsFields = [
    { name: "siteName", label: "Site Name", section: "General" },
    { name: "siteNameAr", label: "Site Name (Arabic)" },
    { name: "tagline", label: "Tagline" },
    { name: "taglineAr", label: "Tagline (Arabic)" },
    { name: "description", label: "Description", type: "textarea" as const },
    { name: "email", label: "Email", section: "Contact" },
    { name: "phonePrimary", label: "Primary Phone" },
    { name: "phoneSecondary", label: "Secondary Phone" },
    { name: "address", label: "Address" },
    { name: "addressAr", label: "Address (Arabic)" },
    { name: "whatsappNumber", label: "WhatsApp Number" },
    { name: "mapEmbedUrl", label: "Google Maps Embed URL", type: "textarea" as const, section: "Location" },
    { name: "linkedinUrl", label: "LinkedIn URL", section: "Social" },
    { name: "facebookUrl", label: "Facebook URL" },
    { name: "instagramUrl", label: "Instagram URL" },
    { name: "youtubeUrl", label: "YouTube URL" },
    { name: "companyProfileUrl", label: "Company Profile PDF URL", section: "Files" },
  ];

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const sections = settingsFields.reduce((acc, f) => {
    const s = f.section ?? "Other";
    if (!acc[s]) acc[s] = [];
    acc[s].push(f);
    return acc;
  }, {} as Record<string, typeof settingsFields>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Site Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your website configuration</p>
        </div>
        <Button onClick={() => save.mutate(form)} disabled={save.isPending}>
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Save className="h-4 w-4 me-2" />}
          Save Changes
        </Button>
      </div>

      {save.isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <strong>Error:</strong> {save.error?.message ?? "Failed to save settings."}
        </div>
      )}
      {save.isSuccess && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3 text-sm text-green-600">
          Settings saved successfully.
        </div>
      )}

      {Object.entries(sections).map(([sectionName, fields]) => (
        <Card key={sectionName} className="p-5">
          <h2 className="font-semibold text-foreground mb-4 pb-2 border-b">{sectionName}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.name} className={f.type === "textarea" ? "md:col-span-2" : ""}>
                <Label htmlFor={f.name} className="text-sm font-medium">{f.label}</Label>
                {f.type === "textarea" ? (
                  <Textarea
                    id={f.name}
                    value={form[f.name] == null ? "" : String(form[f.name])}
                    onChange={(e) => setForm((p) => ({ ...p, [f.name]: e.target.value }))}
                    rows={3}
                    className="mt-1.5"
                  />
                ) : (
                  <Input
                    id={f.name}
                    value={form[f.name] == null ? "" : String(form[f.name])}
                    onChange={(e) => setForm((p) => ({ ...p, [f.name]: e.target.value }))}
                    className="mt-1.5"
                  />
                )}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

// -------- Activity Log Viewer --------
function ActivityLogViewer() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["admin-activity"],
    queryFn: async () => {
      const res = await fetch("/api/admin/activity");
      const json = await res.json();
      return json.success ? json.data : [];
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Activity Log</h1>
        <p className="text-sm text-muted-foreground mt-1">Recent admin actions (last 100)</p>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <Card className="p-2">
          <div className="space-y-1">
            {logs.map((log: Record<string, unknown> & { id: string }) => (
              <div key={log.id} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/50">
                <Badge variant="outline" className="text-xs font-mono">{String(log.action)}</Badge>
                <span className="text-sm text-foreground">{String(log.entity)}</span>
                {Boolean(log.entityId) && <span className="text-xs text-muted-foreground font-mono">{String(log.entityId).slice(0, 8)}</span>}
                <span className="ms-auto text-xs text-muted-foreground">
                  {((log.user as { name?: string })?.name ?? "System")} · {new Date(log.createdAt as string).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// -------- Image Upload Field --------
function ImageUploadField({
  value,
  onChange,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      const url = json.data.url as string;
      onChange(url);
      setPreview(url);
      toast.success("Image uploaded successfully");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Preview */}
      {preview && (
        <div className="relative h-32 w-full overflow-hidden rounded-lg border border-border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => { onChange(""); setPreview(""); }}
            className="absolute top-1 end-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      {/* Upload + URL input */}
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => { onChange(e.target.value); setPreview(e.target.value); }}
          placeholder="https://... or upload below"
          required={required && !value}
          className="flex-1"
        />
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <span className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {uploading ? "Uploading…" : "Upload"}
          </span>
        </label>
      </div>
    </div>
  );
}
