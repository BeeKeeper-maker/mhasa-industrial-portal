// ============================================================================
// Server-side Data Fetching — direct Prisma queries for Server Components.
// These functions replace the client-side API hooks with server-side data
// fetching for SSR/SSG, enabling proper SEO and faster First Contentful Paint.
// ============================================================================

import { db } from "@/lib/db";
import { parseJsonArray } from "@/lib/api";
import type {
  ServiceDTO, ProjectDTO, BlogPostDTO, TeamMemberDTO,
  GalleryItemDTO, JobDTO, FaqItemDTO,
  SiteSettingDTO,
} from "@/lib/types";

// -------- Site Settings --------
export async function getSettings(): Promise<SiteSettingDTO | null> {
  const s = await db.siteSetting.findUnique({ where: { id: "default" } });
  if (!s) return null;
  return {
    siteName: s.siteName,
    siteNameAr: s.siteNameAr,
    tagline: s.tagline,
    taglineAr: s.taglineAr,
    description: s.description,
    email: s.email,
    phonePrimary: s.phonePrimary,
    phoneSecondary: s.phoneSecondary,
    address: s.address,
    addressAr: s.addressAr,
    mapEmbedUrl: s.mapEmbedUrl,
    whatsappNumber: s.whatsappNumber,
    linkedinUrl: s.linkedinUrl,
    facebookUrl: s.facebookUrl,
    instagramUrl: s.instagramUrl,
    youtubeUrl: s.youtubeUrl,
    companyProfileUrl: s.companyProfileUrl,
  };
}

// -------- Consolidated Home Data --------
export async function getSiteData() {
  const [settings, heroes, stats, services, clients, testimonials, faqs] = await Promise.all([
    getSettings(),
    db.heroSlide.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    db.stat.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    getServices(),
    db.client.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    db.testimonial.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    db.faqItem.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  return { settings, heroes, stats, services, clients, testimonials, faqs };
}

// -------- Services --------
export async function getServices(): Promise<ServiceDTO[]> {
  const items = await db.service.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return items.map((s) => ({ ...s, features: parseJsonArray(s.features), updatedAt: s.updatedAt.toISOString() }));
}

export async function getServiceBySlug(slug: string): Promise<(ServiceDTO & { projects: ProjectDTO[] }) | null> {
  const service = await db.service.findUnique({
    where: { slug, isActive: true },
    include: {
      projects: {
        include: { project: true },
        orderBy: { project: { completionDate: "desc" } },
        take: 4,
      },
    },
  });
  if (!service) return null;
  return {
    ...service,
    features: parseJsonArray(service.features),
    updatedAt: service.updatedAt.toISOString(),
    projects: service.projects.map((ps) => ({
      ...ps.project,
      galleryImages: parseJsonArray(ps.project.galleryImages),
      startDate: ps.project.startDate?.toISOString() ?? null,
      completionDate: ps.project.completionDate?.toISOString() ?? null,
      updatedAt: ps.project.updatedAt.toISOString(),
    })),
  };
}

// -------- Projects --------
export async function getProjects(opts?: { category?: string; featured?: boolean; limit?: number }): Promise<ProjectDTO[]> {
  const where: { isActive?: boolean; category?: string; isFeatured?: boolean } = { isActive: true };
  if (opts?.category && opts.category !== "all") where.category = opts.category;
  if (opts?.featured) where.isFeatured = true;
  const items = await db.project.findMany({
    where,
    orderBy: { completionDate: "desc" },
    ...(opts?.limit ? { take: opts.limit } : {}),
  });
  return items.map((p) => ({
    ...p,
    galleryImages: parseJsonArray(p.galleryImages),
    startDate: p.startDate?.toISOString() ?? null,
    completionDate: p.completionDate?.toISOString() ?? null,
    updatedAt: p.updatedAt.toISOString(),
  }));
}

export async function getProjectBySlug(slug: string): Promise<(ProjectDTO & { services: ServiceDTO[] }) | null> {
  const project = await db.project.findUnique({
    where: { slug, isActive: true },
    include: { services: { include: { service: true } } },
  });
  if (!project) return null;
  return {
    ...project,
    galleryImages: parseJsonArray(project.galleryImages),
    startDate: project.startDate?.toISOString() ?? null,
    completionDate: project.completionDate?.toISOString() ?? null,
    updatedAt: project.updatedAt.toISOString(),
    services: project.services.map((ps) => ({
      ...ps.service,
      features: parseJsonArray(ps.service.features),
      updatedAt: ps.service.updatedAt.toISOString(),
    })),
  };
}

export async function getAllProjectSlugs(): Promise<string[]> {
  const projects = await db.project.findMany({ where: { isActive: true }, select: { slug: true } });
  return projects.map((p) => p.slug);
}

// -------- Blog Posts --------
export async function getBlogPosts(opts?: { category?: string; limit?: number }): Promise<BlogPostDTO[]> {
  const where: { status: string; category?: string } = { status: "PUBLISHED" };
  if (opts?.category && opts.category !== "all") where.category = opts.category;
  const posts = await db.blogPost.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    ...(opts?.limit ? { take: opts.limit } : {}),
    include: { author: true },
  });
  return posts.map((p) => ({
    ...p,
    status: p.status as BlogPostDTO["status"],
    tags: parseJsonArray(p.tags),
    publishedAt: p.publishedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    authorName: p.author?.name ?? null,
  }));
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostDTO | null> {
  const post = await db.blogPost.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: { author: true },
  });
  if (!post) return null;
  db.blogPost.update({ where: { id: post.id }, data: { views: { increment: 1 } } }).catch(() => {});
  return {
    ...post,
    status: post.status as BlogPostDTO["status"],
    tags: parseJsonArray(post.tags),
    publishedAt: post.publishedAt?.toISOString() ?? null,
    createdAt: post.createdAt.toISOString(),
    authorName: post.author?.name ?? null,
  };
}

export async function getAllBlogSlugs(): Promise<string[]> {
  const posts = await db.blogPost.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } });
  return posts.map((p) => p.slug);
}

// -------- Jobs --------
export async function getJobs(opts?: { department?: string }): Promise<JobDTO[]> {
  const where: { status: string; department?: string } = { status: "OPEN" };
  if (opts?.department && opts.department !== "all") where.department = opts.department;
  const jobs = await db.job.findMany({ where, orderBy: { createdAt: "desc" } });
  return jobs.map((j) => ({
    ...j,
    status: j.status as JobDTO["status"],
    requirements: parseJsonArray(j.requirements),
    closingDate: j.closingDate?.toISOString() ?? null,
    createdAt: j.createdAt.toISOString(),
  }));
}

export async function getJobBySlug(slug: string): Promise<JobDTO | null> {
  const job = await db.job.findUnique({ where: { slug, status: "OPEN" } });
  if (!job) return null;
  return {
    ...job,
    status: job.status as JobDTO["status"],
    requirements: parseJsonArray(job.requirements),
    closingDate: job.closingDate?.toISOString() ?? null,
    createdAt: job.createdAt.toISOString(),
  };
}

export async function getAllJobSlugs(): Promise<string[]> {
  const jobs = await db.job.findMany({ where: { status: "OPEN" }, select: { slug: true } });
  return jobs.map((j) => j.slug);
}

// -------- Team --------
export async function getTeam(): Promise<TeamMemberDTO[]> {
  return db.teamMember.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
}

// -------- Gallery --------
export async function getGallery(category?: string): Promise<GalleryItemDTO[]> {
  const where: { isActive: boolean; category?: string } = { isActive: true };
  if (category && category !== "all") where.category = category;
  return db.galleryItem.findMany({ where, orderBy: { sortOrder: "asc" } });
}

// -------- FAQ --------
export async function getFaqs(): Promise<FaqItemDTO[]> {
  return db.faqItem.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
}
