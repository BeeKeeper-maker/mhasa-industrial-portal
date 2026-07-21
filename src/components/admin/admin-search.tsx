// ============================================================================
// Admin Global Search — searches across all admin content types in a single
// command-palette dialog. Accessible from the admin dashboard header.
// ============================================================================

"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search, X, Building2, Briefcase, FileText, Users, Image as ImageIcon,
  Star, Award, HelpCircle, BarChart3, Loader2, ArrowRight,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  status?: string;
}

interface AdminSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  Service: Briefcase,
  Project: Building2,
  BlogPost: FileText,
  TeamMember: Users,
  Testimonial: Star,
  Client: Award,
  Job: Briefcase,
  GalleryItem: ImageIcon,
  FaqItem: HelpCircle,
  Stat: BarChart3,
};

const TYPE_COLORS: Record<string, string> = {
  Service: "text-purple-600 bg-purple-50",
  Project: "text-orange-600 bg-orange-50",
  BlogPost: "text-blue-600 bg-blue-50",
  TeamMember: "text-green-600 bg-green-50",
  Testimonial: "text-amber-600 bg-amber-50",
  Client: "text-indigo-600 bg-indigo-50",
  Job: "text-cyan-600 bg-cyan-50",
  GalleryItem: "text-pink-600 bg-pink-50",
  FaqItem: "text-teal-600 bg-teal-50",
  Stat: "text-red-600 bg-red-50",
};

export function AdminSearch({ open, onOpenChange }: AdminSearchProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        // Fetch from multiple admin endpoints in parallel
        const [services, projects, blog, team, testimonials, clients, jobs, gallery, faqs] = await Promise.all([
          fetch("/api/admin/services").then((r) => r.json()),
          fetch("/api/admin/projects").then((r) => r.json()),
          fetch("/api/admin/blog").then((r) => r.json()),
          fetch("/api/admin/team").then((r) => r.json()),
          fetch("/api/admin/testimonials").then((r) => r.json()),
          fetch("/api/admin/clients").then((r) => r.json()),
          fetch("/api/admin/careers").then((r) => r.json()),
          fetch("/api/admin/gallery").then((r) => r.json()),
          fetch("/api/admin/faqs").then((r) => r.json()),
        ]);

        const q = query.toLowerCase();
        const match = (text: string) => text.toLowerCase().includes(q);

        const all: SearchResult[] = [
          ...(services.data ?? []).filter((s: Record<string, unknown>) => match(String(s.title ?? ""))).map((s: Record<string, unknown>) => ({
            id: String(s.id), type: "Service", title: String(s.title), subtitle: String(s.excerpt ?? ""),
          })),
          ...(projects.data ?? []).filter((p: Record<string, unknown>) => match(String(p.title ?? "")) || match(String(p.clientName ?? ""))).map((p: Record<string, unknown>) => ({
            id: String(p.id), type: "Project", title: String(p.title), subtitle: String(p.clientName ?? ""),
          })),
          ...(blog.data ?? []).filter((p: Record<string, unknown>) => match(String(p.title ?? ""))).map((p: Record<string, unknown>) => ({
            id: String(p.id), type: "BlogPost", title: String(p.title), subtitle: String(p.category ?? ""), status: String(p.status ?? ""),
          })),
          ...(team.data ?? []).filter((t: Record<string, unknown>) => match(String(t.name ?? ""))).map((t: Record<string, unknown>) => ({
            id: String(t.id), type: "TeamMember", title: String(t.name), subtitle: String(t.designation ?? ""),
          })),
          ...(testimonials.data ?? []).filter((t: Record<string, unknown>) => match(String(t.clientName ?? ""))).map((t: Record<string, unknown>) => ({
            id: String(t.id), type: "Testimonial", title: String(t.clientName), subtitle: String(t.company ?? ""),
          })),
          ...(clients.data ?? []).filter((c: Record<string, unknown>) => match(String(c.name ?? ""))).map((c: Record<string, unknown>) => ({
            id: String(c.id), type: "Client", title: String(c.name), subtitle: String(c.industry ?? ""),
          })),
          ...(jobs.data ?? []).filter((j: Record<string, unknown>) => match(String(j.title ?? "")) || match(String(j.department ?? ""))).map((j: Record<string, unknown>) => ({
            id: String(j.id), type: "Job", title: String(j.title), subtitle: String(j.department ?? ""), status: String(j.status ?? ""),
          })),
          ...(gallery.data ?? []).filter((g: Record<string, unknown>) => match(String(g.title ?? ""))).map((g: Record<string, unknown>) => ({
            id: String(g.id), type: "GalleryItem", title: String(g.title), subtitle: String(g.category ?? ""),
          })),
          ...(faqs.data ?? []).filter((f: Record<string, unknown>) => match(String(f.question ?? ""))).map((f: Record<string, unknown>) => ({
            id: String(f.id), type: "FaqItem", title: String(f.question), subtitle: String(f.category ?? ""),
          })),
        ];

        setResults(all.slice(0, 50));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpenChange]);

  // Group results by type
  const grouped = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    results.forEach((r) => {
      if (!groups[r.type]) groups[r.type] = [];
      groups[r.type].push(r);
    });
    return groups;
  }, [results]);

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setQuery(""); }}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Admin Search</DialogTitle>
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all content (services, projects, blog, team, jobs...)"
            className="border-0 px-0 shadow-none focus-visible:ring-0 text-base h-auto py-0"
          />
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-gold" />
          )}
          {query && (
            <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="max-h-[60dvh] overflow-y-auto p-2">
          {!query || query.length < 2 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              <Search className="mx-auto h-10 w-10 mb-3 opacity-20" />
              Start typing to search across all content
              <div className="mt-2 text-xs opacity-60">
                Services · Projects · Blog · Team · Jobs · Gallery · FAQs
              </div>
              <div className="mt-3 text-xs">
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
                <span className="ms-1">to open</span>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No results for &quot;{query}&quot;
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-xs text-muted-foreground">
                {results.length} results found
              </div>
              {Object.entries(grouped).map(([type, items]) => (
                <div key={type} className="mb-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <span className={cn("flex h-5 w-5 items-center justify-center rounded", TYPE_COLORS[type] ?? "bg-muted text-muted-foreground")}>
                      {(() => {
                        const Icon = TYPE_ICONS[type] ?? FileText;
                        return <Icon className="h-3 w-3" />;
                      })()}
                    </span>
                    {type} ({items.length})
                  </div>
                  {items.map((item) => (
                    <div
                      key={`${item.type}-${item.id}`}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted cursor-pointer transition-colors group"
                    >
                      <span className={cn("flex h-7 w-7 items-center justify-center rounded-md flex-shrink-0", TYPE_COLORS[item.type] ?? "bg-muted text-muted-foreground")}>
                        {(() => {
                          const Icon = TYPE_ICONS[item.type] ?? FileText;
                          return <Icon className="h-3.5 w-3.5" />;
                        })()}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{item.title}</div>
                        {item.subtitle && <div className="text-xs text-muted-foreground truncate">{item.subtitle}</div>}
                      </div>
                      {item.status && (
                        <Badge variant="outline" className="text-[10px] flex-shrink-0">{item.status}</Badge>
                      )}
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-gold transition-colors flex-shrink-0" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
