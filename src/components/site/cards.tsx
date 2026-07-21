// ============================================================================
// Content Cards — ServiceCard, ProjectCard, TestimonialCard, BlogCard.
// ============================================================================

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { ArrowRight, MapPin, Calendar, Quote, ArrowUpRight, Building2, Star, Check, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/site/icon";
import { useLocale } from "@/lib/hooks/use-locale";
import { navigateToService, navigateToProject, navigateToPost } from "@/lib/store";
import type { ServiceDTO, ProjectDTO, TestimonialDTO, BlogPostDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

// -------- Service Card --------
export function ServiceCard({ service, index = 0 }: { service: ServiceDTO; index?: number }) {
  const { locale, pick } = useLocale();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Card
        className="group card-lift gradient-border relative h-full overflow-hidden cursor-pointer border-border/60 bg-card"
        onClick={() => navigateToService(service.slug)}
      >
        {/* Top accent bar */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary to-gold opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Icon */}
        <div className="relative p-6 pb-0">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/5 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-110">
            <Icon name={service.icon} className="h-7 w-7" />
          </div>
        </div>

        <div className="p-6 pt-4">
          <h3 className="text-xl font-bold text-foreground transition-colors group-hover:text-primary">
            {pick(service.title, service.titleAr) ?? service.title}
          </h3>
          {pick(service.excerpt, service.excerptAr) && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
              {pick(service.excerpt, service.excerptAr)}
            </p>
          )}

          <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold opacity-0 transition-all duration-300 group-hover:opacity-100">
            {locale === "ar" ? "اعرف المزيد" : "Learn More"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// -------- Project Card --------
export function ProjectCard({
  project,
  index = 0,
  compareMode = false,
  compareSelected = false,
  onCompareToggle,
}: {
  project: ProjectDTO;
  index?: number;
  compareMode?: boolean;
  compareSelected?: boolean;
  onCompareToggle?: (id: string) => void;
}) {
  const { pick } = useLocale();
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Card
        className={`group card-lift image-zoom relative h-full overflow-hidden cursor-pointer border-0 bg-muted/30 p-0 ${
          compareSelected ? "ring-2 ring-gold" : ""
        } ${project.isFeatured ? "ring-1 ring-gold/40" : ""}`}
        onClick={() => compareMode && onCompareToggle ? onCompareToggle(project.id) : navigateToProject(project.slug)}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {/* Shimmer placeholder */}
          {!imgLoaded && <div className="absolute inset-0 shimmer" aria-hidden="true" />}
          {project.imageUrl ? (
            <Image
              src={project.imageUrl}
              alt={pick(project.title, project.titleAr) ?? project.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onLoad={() => setImgLoaded(true)}
              className={`object-cover transition-all duration-700 group-hover:scale-110 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-primary/10 text-primary/40">
              <Building2Fallback />
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-95" />

          {/* Category badge */}
          <div className="absolute top-4 start-4 flex flex-col gap-1.5">
            <Badge className="bg-gold text-gold-foreground hover:bg-gold font-semibold border-0">
              {project.category}
            </Badge>
            {project.isFeatured && (
              <Badge className="bg-navy/90 text-gold border-0 text-[10px] font-bold backdrop-blur-sm">
                ★ Featured
              </Badge>
            )}
          </div>

          {/* Content overlay */}
          <div className="absolute inset-x-0 bottom-0 p-5">
            <h3 className="text-lg font-bold text-white leading-tight line-clamp-2">
              {pick(project.title, project.titleAr) ?? project.title}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-white/80">
              <span className="inline-flex items-center gap-1">
                <Building2Fallback className="h-3.5 w-3.5" />
                {project.clientName}
              </span>
              {project.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {project.location}
                </span>
              )}
            </div>
          </div>

          {/* Hover arrow / Compare badge */}
          {compareMode ? (
            <div className={cn(
              "absolute top-4 end-4 flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all",
              compareSelected
                ? "bg-gold border-gold text-gold-foreground"
                : "bg-white/80 border-white text-primary hover:bg-white"
            )}>
              {compareSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </div>
          ) : (
            <div className="absolute top-4 end-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:-translate-y-1">
              <ArrowUpRight className="h-4 w-4 rtl:rotate-90" />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

function Building2Fallback({ className }: { className?: string }) {
  return <Building2 className={cn("h-5 w-5", className)} />;
}

// -------- Testimonial Card --------
export function TestimonialCard({ testimonial, index = 0 }: { testimonial: TestimonialDTO; index?: number }) {
  const { pick } = useLocale();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="relative h-full overflow-hidden border-border/60 bg-card p-6">
        <Quote className="absolute top-4 end-4 h-10 w-10 text-gold/15" />

        {/* Rating */}
        <div className="flex gap-0.5 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn("h-4 w-4", i < testimonial.rating ? "fill-gold text-gold" : "text-muted-foreground/30")}
            />
          ))}
        </div>

        <p className="relative text-sm md:text-base leading-relaxed text-foreground/80 italic">
          &ldquo;{pick(testimonial.content, testimonial.contentAr) ?? testimonial.content}&rdquo;
        </p>

        <div className="mt-5 flex items-center gap-3 pt-4 border-t border-border/40">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
            {(pick(testimonial.clientName, testimonial.clientNameAr) ?? testimonial.clientName).charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-foreground text-sm">
              {pick(testimonial.clientName, testimonial.clientNameAr) ?? testimonial.clientName}
            </div>
            <div className="text-xs text-muted-foreground">
              {[testimonial.designation, testimonial.company].filter(Boolean).join(" — ")}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// -------- Blog Card --------
export function BlogCard({ post, index = 0 }: { post: BlogPostDTO; index?: number }) {
  const { pick, locale } = useLocale();
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Card
        className="group card-lift image-zoom h-full overflow-hidden cursor-pointer border-border/60 bg-card"
        onClick={() => navigateToPost(post.slug)}
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {/* Shimmer placeholder */}
          {!imgLoaded && post.coverImage && <div className="absolute inset-0 shimmer" aria-hidden="true" />}
          {post.coverImage && (
            <Image
              src={post.coverImage}
              alt={pick(post.title, post.titleAr) ?? post.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              onLoad={() => setImgLoaded(true)}
              className={`object-cover transition-all duration-700 group-hover:scale-105 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            />
          )}
          <div className="absolute top-3 start-3">
            <Badge className="bg-white/90 text-primary hover:bg-white border-0">{post.category}</Badge>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Calendar className="h-3.5 w-3.5" />
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", { year: "numeric", month: "short", day: "numeric" }) : ""}
          </div>
          <h3 className="text-base font-bold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {pick(post.title, post.titleAr) ?? post.title}
          </h3>
          {pick(post.excerpt, post.excerptAr) && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {pick(post.excerpt, post.excerptAr)}
            </p>
          )}
          <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold">
            {locale === "ar" ? "اقرأ المزيد" : "Read More"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
