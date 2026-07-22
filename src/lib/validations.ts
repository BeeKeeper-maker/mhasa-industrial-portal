// ============================================================================
// Zod Validation Schemas
// Single source of truth for request validation on both client & server.
// All image fields accept both URLs and relative paths (/uploads/...).
// All number fields use coerce to accept string inputs from HTML forms.
// ============================================================================

import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Accept URLs (https://...) OR relative paths (/uploads/...) OR empty string
const urlString = z.string()
  .refine(
    (val) => val === "" || val.startsWith("/") || val.startsWith("http://") || val.startsWith("https://") || val.startsWith("data:"),
    "Must be a valid URL or relative path"
  )
  .optional()
  .nullable()
  .or(z.literal(""));

// Coerce string to number for HTML form inputs
const num = z.coerce.number().optional().nullable();
const numDefault = (def: number) => z.coerce.number().int().default(def);

// Coerce to boolean (handles true/false/"true"/"false"/0/1)
const bool = z.coerce.boolean().default(true);

export const serviceSchema = z.object({
  slug: z.string().regex(slugRegex, "Invalid slug format"),
  title: z.string().min(2, "Title too short").max(120),
  titleAr: z.string().optional().nullable(),
  excerpt: z.string().max(300).optional().nullable(),
  excerptAr: z.string().optional().nullable(),
  description: z.string().min(10),
  descriptionAr: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  imageUrl: urlString,
  features: z.array(z.string()).default([]),
  sortOrder: numDefault(0),
  isFeatured: bool.default(false),
  isActive: bool.default(true),
});

export const projectSchema = z.object({
  slug: z.string().regex(slugRegex),
  title: z.string().min(2).max(160),
  titleAr: z.string().optional().nullable(),
  clientName: z.string().min(2),
  category: z.string().min(2),
  location: z.string().optional().nullable(),
  value: num,
  currency: z.string().default("SAR"),
  startDate: z.string().optional().nullable(),
  completionDate: z.string().optional().nullable(),
  description: z.string().min(10),
  descriptionAr: z.string().optional().nullable(),
  imageUrl: urlString,
  galleryImages: z.array(z.string()).default([]),
  beforeImage: urlString,
  afterImage: urlString,
  isFeatured: bool.default(false),
  isActive: bool.default(true),
  serviceIds: z.array(z.string()).default([]),
});

export const blogPostSchema = z.object({
  slug: z.string().regex(slugRegex),
  title: z.string().min(2).max(200),
  titleAr: z.string().optional().nullable(),
  excerpt: z.string().max(500).optional().nullable(),
  excerptAr: z.string().optional().nullable(),
  content: z.string().min(10),
  contentAr: z.string().optional().nullable(),
  coverImage: urlString,
  category: z.string().default("Company Updates"),
  tags: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  publishedAt: z.string().optional().nullable(),
});

export const teamMemberSchema = z.object({
  name: z.string().min(2),
  nameAr: z.string().optional().nullable(),
  designation: z.string().min(2),
  designationAr: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  bioAr: z.string().optional().nullable(),
  imageUrl: urlString,
  linkedinUrl: urlString,
  email: z.string().email().optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  sortOrder: numDefault(0),
  isActive: bool.default(true),
});

export const testimonialSchema = z.object({
  clientName: z.string().min(2),
  clientNameAr: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  content: z.string().min(10),
  contentAr: z.string().optional().nullable(),
  rating: numDefault(5),
  avatarUrl: urlString,
  sortOrder: numDefault(0),
  isActive: bool.default(true),
});

export const galleryItemSchema = z.object({
  title: z.string().min(2),
  titleAr: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  imageUrl: urlString,
  category: z.string().default("Projects"),
  sortOrder: numDefault(0),
  isActive: bool.default(true),
});

export const clientSchema = z.object({
  name: z.string().min(2),
  nameAr: z.string().optional().nullable(),
  logoUrl: urlString,
  industry: z.string().optional().nullable(),
  websiteUrl: urlString,
  sortOrder: numDefault(0),
  isActive: bool.default(true),
});

export const jobSchema = z.object({
  slug: z.string().regex(slugRegex),
  title: z.string().min(2),
  titleAr: z.string().optional().nullable(),
  department: z.string().min(2),
  location: z.string().min(2),
  type: z.string().default("Full-time"),
  experience: z.string().optional().nullable(),
  description: z.string().min(10),
  descriptionAr: z.string().optional().nullable(),
  requirements: z.array(z.string()).default([]),
  salaryRange: z.string().optional().nullable(),
  status: z.enum(["OPEN", "CLOSED"]).default("OPEN"),
  closingDate: z.string().optional().nullable(),
});

export const jobApplicationSchema = z.object({
  jobId: z.string().cuid(),
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  coverLetter: z.string().optional().nullable(),
  resumeUrl: z.string().optional().nullable(),
  portfolioUrl: urlString,
});

export const contactLeadSchema = z.object({
  name: z.string().min(2, "Name is required"),
  company: z.string().optional().nullable(),
  email: z.string().email("Valid email required"),
  phone: z.string().min(6, "Valid phone required"),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  projectBudget: z
    .enum(["< 100K SAR", "100K - 500K SAR", "500K - 1M SAR", "1M - 5M SAR", "> 5M SAR"])
    .optional()
    .nullable(),
  attachmentUrl: z.string().optional().nullable(),
  website: z.string().max(0).optional(),
});

export const faqSchema = z.object({
  question: z.string().min(5),
  questionAr: z.string().optional().nullable(),
  answer: z.string().min(10),
  answerAr: z.string().optional().nullable(),
  category: z.string().default("General"),
  sortOrder: numDefault(0),
  isActive: bool.default(true),
});

export const heroSlideSchema = z.object({
  title: z.string().min(2),
  titleAr: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  subtitleAr: z.string().optional().nullable(),
  imageUrl: urlString,
  ctaText: z.string().optional().nullable(),
  ctaTextAr: z.string().optional().nullable(),
  ctaLink: z.string().optional().nullable(),
  sortOrder: numDefault(0),
  isActive: bool.default(true),
});

export const statSchema = z.object({
  label: z.string().min(2),
  labelAr: z.string().optional().nullable(),
  value: z.coerce.number().int().nonnegative(),
  suffix: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  sortOrder: numDefault(0),
  isActive: bool.default(true),
});

export const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type TeamMemberInput = z.infer<typeof teamMemberSchema>;
export type TestimonialInput = z.infer<typeof testimonialSchema>;
export type GalleryItemInput = z.infer<typeof galleryItemSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type JobInput = z.infer<typeof jobSchema>;
export type JobApplicationInput = z.infer<typeof jobApplicationSchema>;
export type ContactLeadInput = z.infer<typeof contactLeadSchema>;
export type FaqInput = z.infer<typeof faqSchema>;
export type HeroSlideInput = z.infer<typeof heroSlideSchema>;
export type StatInput = z.infer<typeof statSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
