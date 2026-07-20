// ============================================================================
// Resource Configs — field definitions for each admin content type.
// Drives the generic ResourceManager form rendering.
// ============================================================================

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "textarea" | "boolean" | "number" | "email" | "url" | "array";
  required?: boolean;
  fullWidth?: boolean;
  rows?: number;
  placeholder?: string;
  defaultValue?: unknown;
}

export interface ResourceConfig {
  titleField: string;
  subtitleField?: string;
  imageField?: string;
  badgeFields: string[];
  fields: FieldConfig[];
}

export type ResourceKey =
  | "services" | "projects" | "blog" | "team" | "gallery"
  | "testimonials" | "clients" | "careers" | "faqs" | "heroes" | "stats";

const slugField: FieldConfig = {
  name: "slug", label: "Slug (URL)", type: "text", required: true,
  placeholder: "lowercase-with-dashes", fullWidth: true,
};

export const resourceConfigs: Record<ResourceKey, ResourceConfig> = {
  services: {
    titleField: "title",
    subtitleField: "excerpt",
    imageField: "imageUrl",
    badgeFields: ["category", "icon"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, fullWidth: true },
      { name: "titleAr", label: "Title (Arabic)", type: "text", fullWidth: true },
      { name: "slug", label: "Slug", type: "text", required: true, fullWidth: true },
      { name: "icon", label: "Icon (Lucide name)", type: "text", placeholder: "Building2" },
      { name: "imageUrl", label: "Image URL", type: "url" },
      { name: "excerpt", label: "Excerpt", type: "textarea", rows: 2, fullWidth: true },
      { name: "excerptAr", label: "Excerpt (Arabic)", type: "textarea", rows: 2, fullWidth: true },
      { name: "description", label: "Description", type: "textarea", rows: 6, required: true, fullWidth: true },
      { name: "descriptionAr", label: "Description (Arabic)", type: "textarea", rows: 6, fullWidth: true },
      { name: "features", label: "Features", type: "array", fullWidth: true, placeholder: "Add a feature…" },
      { name: "sortOrder", label: "Sort Order", type: "number", defaultValue: 0 },
      { name: "isFeatured", label: "Featured", type: "boolean", defaultValue: false },
      { name: "isActive", label: "Active", type: "boolean", defaultValue: true },
    ],
  },
  projects: {
    titleField: "title",
    subtitleField: "clientName",
    imageField: "imageUrl",
    badgeFields: ["category", "location"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, fullWidth: true },
      { name: "titleAr", label: "Title (Arabic)", type: "text", fullWidth: true },
      { name: "slug", label: "Slug", type: "text", required: true, fullWidth: true },
      { name: "clientName", label: "Client Name", type: "text", required: true },
      { name: "category", label: "Category", type: "text", required: true, placeholder: "RTR Pipe / GRP Pipe / …" },
      { name: "location", label: "Location", type: "text" },
      { name: "value", label: "Project Value", type: "number" },
      { name: "currency", label: "Currency", type: "text", defaultValue: "SAR" },
      { name: "completionDate", label: "Completion Date", type: "text", placeholder: "YYYY-MM-DD" },
      { name: "imageUrl", label: "Main Image URL", type: "url", fullWidth: true },
      { name: "beforeImage", label: "Before Image URL", type: "url" },
      { name: "afterImage", label: "After Image URL", type: "url" },
      { name: "description", label: "Description", type: "textarea", rows: 5, required: true, fullWidth: true },
      { name: "descriptionAr", label: "Description (Arabic)", type: "textarea", rows: 5, fullWidth: true },
      { name: "isFeatured", label: "Featured", type: "boolean", defaultValue: false },
      { name: "isActive", label: "Active", type: "boolean", defaultValue: true },
    ],
  },
  blog: {
    titleField: "title",
    subtitleField: "category",
    imageField: "coverImage",
    badgeFields: ["category", "status"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, fullWidth: true },
      { name: "titleAr", label: "Title (Arabic)", type: "text", fullWidth: true },
      { name: "slug", label: "Slug", type: "text", required: true, fullWidth: true },
      { name: "category", label: "Category", type: "text", defaultValue: "Company Updates" },
      { name: "coverImage", label: "Cover Image URL", type: "url", fullWidth: true },
      { name: "excerpt", label: "Excerpt", type: "textarea", rows: 2, fullWidth: true },
      { name: "content", label: "Content (Markdown)", type: "textarea", rows: 12, required: true, fullWidth: true },
      { name: "tags", label: "Tags", type: "array", fullWidth: true, placeholder: "Add a tag…" },
      { name: "status", label: "Status", type: "text", defaultValue: "DRAFT", placeholder: "DRAFT or PUBLISHED" },
    ],
  },
  team: {
    titleField: "name",
    subtitleField: "designation",
    imageField: "imageUrl",
    badgeFields: [],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, fullWidth: true },
      { name: "nameAr", label: "Name (Arabic)", type: "text", fullWidth: true },
      { name: "designation", label: "Designation", type: "text", required: true },
      { name: "designationAr", label: "Designation (Arabic)", type: "text" },
      { name: "imageUrl", label: "Photo URL", type: "url", fullWidth: true },
      { name: "bio", label: "Bio", type: "textarea", rows: 4, fullWidth: true },
      { name: "bioAr", label: "Bio (Arabic)", type: "textarea", rows: 4, fullWidth: true },
      { name: "linkedinUrl", label: "LinkedIn URL", type: "url" },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "sortOrder", label: "Sort Order", type: "number", defaultValue: 0 },
      { name: "isActive", label: "Active", type: "boolean", defaultValue: true },
    ],
  },
  gallery: {
    titleField: "title",
    subtitleField: "category",
    imageField: "imageUrl",
    badgeFields: ["category"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "titleAr", label: "Title (Arabic)", type: "text" },
      { name: "category", label: "Category", type: "text", defaultValue: "Projects" },
      { name: "imageUrl", label: "Image URL", type: "url", required: true, fullWidth: true },
      { name: "description", label: "Description", type: "textarea", rows: 2, fullWidth: true },
      { name: "sortOrder", label: "Sort Order", type: "number", defaultValue: 0 },
      { name: "isActive", label: "Active", type: "boolean", defaultValue: true },
    ],
  },
  testimonials: {
    titleField: "clientName",
    subtitleField: "company",
    imageField: "avatarUrl",
    badgeFields: ["company", "rating"],
    fields: [
      { name: "clientName", label: "Client Name", type: "text", required: true, fullWidth: true },
      { name: "clientNameAr", label: "Client Name (Arabic)", type: "text", fullWidth: true },
      { name: "designation", label: "Designation", type: "text" },
      { name: "company", label: "Company", type: "text" },
      { name: "content", label: "Testimonial", type: "textarea", rows: 4, required: true, fullWidth: true },
      { name: "contentAr", label: "Testimonial (Arabic)", type: "textarea", rows: 4, fullWidth: true },
      { name: "rating", label: "Rating (1-5)", type: "number", defaultValue: 5 },
      { name: "avatarUrl", label: "Avatar URL", type: "url" },
      { name: "sortOrder", label: "Sort Order", type: "number", defaultValue: 0 },
      { name: "isActive", label: "Active", type: "boolean", defaultValue: true },
    ],
  },
  clients: {
    titleField: "name",
    subtitleField: "industry",
    imageField: "logoUrl",
    badgeFields: ["industry"],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "nameAr", label: "Name (Arabic)", type: "text" },
      { name: "industry", label: "Industry", type: "text" },
      { name: "logoUrl", label: "Logo URL", type: "url" },
      { name: "websiteUrl", label: "Website URL", type: "url" },
      { name: "sortOrder", label: "Sort Order", type: "number", defaultValue: 0 },
      { name: "isActive", label: "Active", type: "boolean", defaultValue: true },
    ],
  },
  careers: {
    titleField: "title",
    subtitleField: "department",
    badgeFields: ["department", "location", "type"],
    fields: [
      { name: "title", label: "Job Title", type: "text", required: true, fullWidth: true },
      { name: "titleAr", label: "Job Title (Arabic)", type: "text", fullWidth: true },
      { name: "slug", label: "Slug", type: "text", required: true, fullWidth: true },
      { name: "department", label: "Department", type: "text", required: true },
      { name: "location", label: "Location", type: "text", required: true },
      { name: "type", label: "Type", type: "text", defaultValue: "Full-time" },
      { name: "experience", label: "Experience Required", type: "text" },
      { name: "salaryRange", label: "Salary Range", type: "text" },
      { name: "closingDate", label: "Closing Date", type: "text", placeholder: "YYYY-MM-DD" },
      { name: "description", label: "Description", type: "textarea", rows: 5, required: true, fullWidth: true },
      { name: "descriptionAr", label: "Description (Arabic)", type: "textarea", rows: 5, fullWidth: true },
      { name: "requirements", label: "Requirements", type: "array", fullWidth: true, placeholder: "Add a requirement…" },
      { name: "status", label: "Status", type: "text", defaultValue: "OPEN" },
    ],
  },
  faqs: {
    titleField: "question",
    subtitleField: "category",
    badgeFields: ["category"],
    fields: [
      { name: "question", label: "Question", type: "text", required: true, fullWidth: true },
      { name: "questionAr", label: "Question (Arabic)", type: "text", fullWidth: true },
      { name: "answer", label: "Answer", type: "textarea", rows: 4, required: true, fullWidth: true },
      { name: "answerAr", label: "Answer (Arabic)", type: "textarea", rows: 4, fullWidth: true },
      { name: "category", label: "Category", type: "text", defaultValue: "General" },
      { name: "sortOrder", label: "Sort Order", type: "number", defaultValue: 0 },
      { name: "isActive", label: "Active", type: "boolean", defaultValue: true },
    ],
  },
  heroes: {
    titleField: "title",
    subtitleField: "subtitle",
    imageField: "imageUrl",
    badgeFields: [],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, fullWidth: true },
      { name: "titleAr", label: "Title (Arabic)", type: "text", fullWidth: true },
      { name: "subtitle", label: "Subtitle", type: "textarea", rows: 2, fullWidth: true },
      { name: "subtitleAr", label: "Subtitle (Arabic)", type: "textarea", rows: 2, fullWidth: true },
      { name: "imageUrl", label: "Background Image URL", type: "url", required: true, fullWidth: true },
      { name: "ctaText", label: "CTA Button Text", type: "text" },
      { name: "ctaLink", label: "CTA Link (view name)", type: "text", placeholder: "services / projects / contact" },
      { name: "sortOrder", label: "Sort Order", type: "number", defaultValue: 0 },
      { name: "isActive", label: "Active", type: "boolean", defaultValue: true },
    ],
  },
  stats: {
    titleField: "label",
    subtitleField: "suffix",
    badgeFields: [],
    fields: [
      { name: "label", label: "Label", type: "text", required: true },
      { name: "labelAr", label: "Label (Arabic)", type: "text" },
      { name: "value", label: "Value", type: "number", required: true },
      { name: "suffix", label: "Suffix", type: "text", placeholder: "+ or %" },
      { name: "icon", label: "Icon (Lucide name)", type: "text", placeholder: "Calendar" },
      { name: "sortOrder", label: "Sort Order", type: "number", defaultValue: 0 },
      { name: "isActive", label: "Active", type: "boolean", defaultValue: true },
    ],
  },
};
