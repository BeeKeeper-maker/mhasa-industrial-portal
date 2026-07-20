// ============================================================================
// React Query Hooks — data fetching for public + admin data.
// ============================================================================

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ServiceDTO, ProjectDTO, BlogPostDTO, TeamMemberDTO, TestimonialDTO,
  GalleryItemDTO, ClientDTO, JobDTO, FaqItemDTO, StatDTO, HeroSlideDTO,
  SiteSettingDTO,
} from "@/lib/types";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = await res.json();
  if (!json.success) throw new Error(json.error ?? "Request failed");
  return json.data as T;
}

// -------- Public site data (single consolidated call) --------
interface SiteData {
  settings: SiteSettingDTO | null;
  heroes: HeroSlideDTO[];
  stats: StatDTO[];
  services: ServiceDTO[];
  clients: ClientDTO[];
  testimonials: TestimonialDTO[];
  faqs: FaqItemDTO[];
}

export function useSiteData() {
  return useQuery<SiteData>({
    queryKey: ["site-data"],
    queryFn: () => fetchJson<SiteData>("/api/public/site"),
    staleTime: 5 * 60 * 1000,
  });
}

// -------- Projects --------
export function useProjects(opts?: { category?: string; featured?: boolean; limit?: number }) {
  const params = new URLSearchParams();
  if (opts?.category && opts.category !== "all") params.set("category", opts.category);
  if (opts?.featured) params.set("featured", "true");
  if (opts?.limit) params.set("limit", String(opts.limit));
  const qs = params.toString();
  return useQuery<ProjectDTO[]>({
    queryKey: ["projects", opts],
    queryFn: () => fetchJson<ProjectDTO[]>(`/api/public/projects${qs ? `?${qs}` : ""}`),
  });
}

export function useProject(slug: string | null) {
  return useQuery<ProjectDTO | null>({
    queryKey: ["project", slug],
    queryFn: () => (slug ? fetchJson<ProjectDTO>(`/api/public/projects?slug=${slug}`) : Promise.resolve(null)),
    enabled: !!slug,
  });
}

// -------- Services --------
export function useServices() {
  return useQuery<ServiceDTO[]>({
    queryKey: ["services"],
    queryFn: () => fetchJson<ServiceDTO[]>("/api/public/services"),
  });
}

export function useService(slug: string | null) {
  return useQuery<ServiceDTO | null>({
    queryKey: ["service", slug],
    queryFn: () => (slug ? fetchJson<ServiceDTO>(`/api/public/services?slug=${slug}`) : Promise.resolve(null)),
    enabled: !!slug,
  });
}

// -------- Blog --------
export function useBlogPosts(opts?: { category?: string; limit?: number }) {
  const params = new URLSearchParams();
  if (opts?.category && opts.category !== "all") params.set("category", opts.category);
  if (opts?.limit) params.set("limit", String(opts.limit));
  const qs = params.toString();
  return useQuery<BlogPostDTO[]>({
    queryKey: ["blog-posts", opts],
    queryFn: () => fetchJson<BlogPostDTO[]>(`/api/public/blog${qs ? `?${qs}` : ""}`),
  });
}

export function useBlogPost(slug: string | null) {
  return useQuery<BlogPostDTO | null>({
    queryKey: ["blog-post", slug],
    queryFn: () => (slug ? fetchJson<BlogPostDTO>(`/api/public/blog?slug=${slug}`) : Promise.resolve(null)),
    enabled: !!slug,
  });
}

// -------- Jobs --------
export function useJobs(opts?: { department?: string }) {
  const params = new URLSearchParams();
  if (opts?.department && opts.department !== "all") params.set("department", opts.department);
  const qs = params.toString();
  return useQuery<JobDTO[]>({
    queryKey: ["jobs", opts],
    queryFn: () => fetchJson<JobDTO[]>(`/api/public/jobs${qs ? `?${qs}` : ""}`),
  });
}

export function useJob(slug: string | null) {
  return useQuery<JobDTO | null>({
    queryKey: ["job", slug],
    queryFn: () => (slug ? fetchJson<JobDTO>(`/api/public/jobs?slug=${slug}`) : Promise.resolve(null)),
    enabled: !!slug,
  });
}

// -------- Team --------
export function useTeam() {
  return useQuery<TeamMemberDTO[]>({
    queryKey: ["team"],
    queryFn: () => fetchJson<TeamMemberDTO[]>("/api/public/team"),
  });
}

// -------- Gallery --------
export function useGallery(category?: string) {
  const qs = category && category !== "all" ? `?category=${category}` : "";
  return useQuery<GalleryItemDTO[]>({
    queryKey: ["gallery", category],
    queryFn: () => fetchJson<GalleryItemDTO[]>(`/api/public/gallery${qs}`),
  });
}

// -------- Search --------
interface SearchResults {
  projects: { id: string; slug: string; title: string; category: string; clientName: string }[];
  services: { id: string; slug: string; title: string; excerpt: string | null }[];
  posts: { id: string; slug: string; title: string; category: string }[];
  jobs: { id: string; slug: string; title: string; department: string; location: string }[];
}

export function useSearch(query: string) {
  return useQuery<SearchResults>({
    queryKey: ["search", query],
    queryFn: () => fetchJson<SearchResults>(`/api/search?q=${encodeURIComponent(query)}`),
    enabled: query.trim().length >= 2,
  });
}

// -------- Contact form --------
export function useContactForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Submission failed");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-leads"] });
    },
  });
}

// -------- Job application --------
export function useJobApplication() {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/careers/apply", { method: "POST", body: formData });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Application failed");
      return json;
    },
  });
}
