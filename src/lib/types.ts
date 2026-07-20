// ============================================================================
// Shared TypeScript Types & DTOs
// Central type definitions consumed by both client and server.
// ============================================================================

export type Role = "ADMIN" | "EDITOR" | "AUTHOR";

export type Locale = "en" | "ar";

export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST";
export type ApplicationStatus = "NEW" | "REVIEWING" | "SHORTLISTED" | "REJECTED" | "HIRED";
export type BlogStatus = "DRAFT" | "PUBLISHED";
export type JobStatus = "OPEN" | "CLOSED";

export interface ServiceDTO {
  id: string;
  slug: string;
  title: string;
  titleAr: string | null;
  excerpt: string | null;
  excerptAr: string | null;
  description: string;
  descriptionAr: string | null;
  icon: string | null;
  imageUrl: string | null;
  features: string[];
  sortOrder: number;
  isFeatured: boolean;
  isActive: boolean;
  updatedAt?: string;
}

export interface ProjectDTO {
  id: string;
  slug: string;
  title: string;
  titleAr: string | null;
  clientName: string;
  category: string;
  location: string | null;
  value: number | null;
  currency: string;
  startDate: string | null;
  completionDate: string | null;
  description: string;
  descriptionAr: string | null;
  imageUrl: string | null;
  galleryImages: string[];
  beforeImage: string | null;
  afterImage: string | null;
  isFeatured: boolean;
  services?: ServiceDTO[];
  updatedAt?: string;
}

export interface BlogPostDTO {
  id: string;
  slug: string;
  title: string;
  titleAr: string | null;
  excerpt: string | null;
  excerptAr: string | null;
  content: string;
  contentAr: string | null;
  coverImage: string | null;
  category: string;
  tags: string[];
  status: BlogStatus;
  views: number;
  publishedAt: string | null;
  authorName: string | null;
  createdAt: string;
}

export interface TeamMemberDTO {
  id: string;
  name: string;
  nameAr: string | null;
  designation: string;
  designationAr: string | null;
  bio: string | null;
  bioAr: string | null;
  imageUrl: string | null;
  linkedinUrl: string | null;
  email: string | null;
  phone: string | null;
  sortOrder: number;
}

export interface TestimonialDTO {
  id: string;
  clientName: string;
  clientNameAr: string | null;
  designation: string | null;
  company: string | null;
  content: string;
  contentAr: string | null;
  rating: number;
  avatarUrl: string | null;
}

export interface GalleryItemDTO {
  id: string;
  title: string;
  titleAr: string | null;
  description: string | null;
  imageUrl: string | null;
  category: string;
}

export interface ClientDTO {
  id: string;
  name: string;
  nameAr: string | null;
  logoUrl: string | null;
  industry: string | null;
  websiteUrl: string | null;
}

export interface JobDTO {
  id: string;
  slug: string;
  title: string;
  titleAr: string | null;
  department: string;
  location: string;
  type: string;
  experience: string | null;
  description: string;
  descriptionAr: string | null;
  requirements: string[];
  salaryRange: string | null;
  status: JobStatus;
  closingDate: string | null;
  createdAt: string;
}

export interface ContactLeadDTO {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string;
  subject: string;
  message: string;
  projectBudget: string | null;
  attachmentUrl: string | null;
  status: LeadStatus;
  createdAt: string;
}

export interface FaqItemDTO {
  id: string;
  question: string;
  questionAr: string | null;
  answer: string;
  answerAr: string | null;
  category: string;
}

export interface StatDTO {
  id: string;
  label: string;
  labelAr: string | null;
  value: number;
  suffix: string | null;
  icon: string | null;
}

export interface HeroSlideDTO {
  id: string;
  title: string;
  titleAr: string | null;
  subtitle: string | null;
  subtitleAr: string | null;
  imageUrl: string | null;
  ctaText: string | null;
  ctaTextAr: string | null;
  ctaLink: string | null;
}

export interface SiteSettingDTO {
  siteName: string;
  siteNameAr: string | null;
  tagline: string | null;
  taglineAr: string | null;
  description: string | null;
  email: string | null;
  phonePrimary: string | null;
  phoneSecondary: string | null;
  address: string | null;
  addressAr: string | null;
  mapEmbedUrl: string | null;
  whatsappNumber: string | null;
  linkedinUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  companyProfileUrl: string | null;
}

// API response envelope
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
