// ============================================================================
// Search Dialog — global command palette search across all content types.
// ============================================================================

"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Search, FileText, Briefcase, Building2, Layers } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";
import { useSearch } from "@/lib/hooks/use-queries";
import { useLocale } from "@/lib/hooks/use-locale";
import { cn } from "@/lib/utils";

/** Highlights occurrences of `query` within `text` using <mark> tags. */
function Highlight({ text, query }: { text: string; query: string }): ReactNode {
  if (!query.trim()) return text;
  const q = query.trim();
  const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) && part.toLowerCase() === q.toLowerCase() ? (
      <mark key={i} className="bg-gold/30 text-foreground rounded px-0.5 font-semibold">{part}</mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export function SearchDialog() {
  const searchOpen = useAppStore((s) => s.searchOpen);
  const setSearchOpen = useAppStore((s) => s.setSearchOpen);
  const openProject = useAppStore((s) => s.openProject);
  const openService = useAppStore((s) => s.openService);
  const openPost = useAppStore((s) => s.openPost);
  const openJob = useAppStore((s) => s.openJob);
  const { t, locale } = useLocale();
  const [query, setQuery] = useState("");

  const { data: results, isFetching } = useSearch(query);

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  const hasResults =
    results &&
    (results.projects.length > 0 ||
      results.services.length > 0 ||
      results.posts.length > 0 ||
      results.jobs.length > 0);

  const handleProject = (slug: string) => { openProject(slug); setSearchOpen(false); };
  const handleService = (slug: string) => { openService(slug); setSearchOpen(false); };
  const handlePost = (slug: string) => { openPost(slug); setSearchOpen(false); };
  const handleJob = (slug: string) => { openJob(slug); setSearchOpen(false); };

  return (
    <Dialog
      open={searchOpen}
      onOpenChange={(open) => {
        setSearchOpen(open);
        if (!open) setQuery("");
      }}
    >
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{t.actions.search}</DialogTitle>
          <DialogDescription>
            {locale === "ar" ? "ابحث في المشاريع والخدمات والأخبار والوظائف" : "Search projects, services, news, and jobs"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={locale === "ar" ? "ابحث عن مشاريع، خدمات، أخبار..." : "Search projects, services, news..."}
            className="border-0 px-0 shadow-none focus-visible:ring-0 text-base h-auto py-0"
          />
          {isFetching && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!query || query.length < 2 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              <Search className="mx-auto h-10 w-10 mb-3 opacity-20" />
              {locale === "ar" ? "ابدأ الكتابة للبحث" : "Start typing to search"}
              <div className="mt-2 text-xs opacity-60">
                {locale === "ar" ? "مشاريع • خدمات • أخبار • وظائف" : "Projects • Services • News • Jobs"}
              </div>
            </div>
          ) : !hasResults ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              {t.common.noResults}
            </div>
          ) : (
            <div className="space-y-1">
              {results!.projects.length > 0 && (
                <SearchGroup label={locale === "ar" ? "المشاريع" : "Projects"} icon={Building2}>
                  {results!.projects.map((p) => (
                    <SearchItem key={p.id} onClick={() => handleProject(p.slug)}>
                      <Building2 className="h-4 w-4 text-primary" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate"><Highlight text={p.title} query={query} /></div>
                        <div className="text-xs text-muted-foreground truncate"><Highlight text={`${p.clientName} · ${p.category}`} query={query} /></div>
                      </div>
                    </SearchItem>
                  ))}
                </SearchGroup>
              )}
              {results!.services.length > 0 && (
                <SearchGroup label={locale === "ar" ? "الخدمات" : "Services"} icon={Layers}>
                  {results!.services.map((s) => (
                    <SearchItem key={s.id} onClick={() => handleService(s.slug)}>
                      <Layers className="h-4 w-4 text-primary" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate"><Highlight text={s.title} query={query} /></div>
                        {s.excerpt && <div className="text-xs text-muted-foreground truncate"><Highlight text={s.excerpt} query={query} /></div>}
                      </div>
                    </SearchItem>
                  ))}
                </SearchGroup>
              )}
              {results!.posts.length > 0 && (
                <SearchGroup label={locale === "ar" ? "الأخبار" : "News"} icon={FileText}>
                  {results!.posts.map((p) => (
                    <SearchItem key={p.id} onClick={() => handlePost(p.slug)}>
                      <FileText className="h-4 w-4 text-primary" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate"><Highlight text={p.title} query={query} /></div>
                        <div className="text-xs text-muted-foreground">{p.category}</div>
                      </div>
                    </SearchItem>
                  ))}
                </SearchGroup>
              )}
              {results!.jobs.length > 0 && (
                <SearchGroup label={locale === "ar" ? "الوظائف" : "Jobs"} icon={Briefcase}>
                  {results!.jobs.map((j) => (
                    <SearchItem key={j.id} onClick={() => handleJob(j.slug)}>
                      <Briefcase className="h-4 w-4 text-primary" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate"><Highlight text={j.title} query={query} /></div>
                        <div className="text-xs text-muted-foreground truncate"><Highlight text={`${j.department} · ${j.location}`} query={query} /></div>
                      </div>
                    </SearchItem>
                  ))}
                </SearchGroup>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SearchGroup({ label, icon: Icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      {children}
    </div>
  );
}

function SearchItem({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start transition-colors",
        "hover:bg-muted focus:bg-muted focus:outline-none"
      )}
    >
      {children}
    </button>
  );
}
