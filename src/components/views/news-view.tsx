// ============================================================================
// News View — list mode (with category filter) and detail mode
// (cover hero, markdown content, tags, share, related posts).
// ============================================================================

"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import {
  ArrowRight, ChevronLeft, Calendar, User, Tag, Clock,
  Share2, Linkedin, Twitter, Link2, Check, MessageCircle,
  Sparkles, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReadingProgress } from "@/components/site/reading-progress";
import { BlogToc, markdownHeadingComponents } from "@/components/site/blog-toc";
import { BlogGridSkeleton } from "@/components/site/skeletons";
import {
  SectionHeading, FadeIn, GoldDivider,
} from "@/components/site/primitives";
import { BlogCard } from "@/components/site/cards";
import { useBlogPosts, useBlogPost } from "@/lib/hooks/use-queries";
import { useAppStore } from "@/lib/store";
import { useLocale } from "@/lib/hooks/use-locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function NewsView() {
  const selectedSlug = useAppStore((s) => s.selectedPostSlug);
  if (selectedSlug) return <PostDetail slug={selectedSlug} />;
  return <NewsList />;
}

// ============================================================================
// List Mode — hero + category filter + grid of BlogCard.
// ============================================================================
function NewsList() {
  const { t, locale } = useLocale();
  const [category, setCategory] = useState<string>("all");

  const { data: allPosts, isLoading: allLoading } = useBlogPosts();
  const { data: filtered } = useBlogPosts({ category });
  const posts = category === "all" ? (allPosts ?? []) : (filtered ?? []);

  // Known categories with Arabic translations
  const knownCategories: Record<string, string> = {
    "Industry News": locale === "ar" ? "أخبار الصناعة" : "Industry News",
    "Company Updates": locale === "ar" ? "تحديثات الشركة" : "Company Updates",
    "Articles": locale === "ar" ? "مقالات" : "Articles",
  };

  const categories = useMemo(() => {
    if (!allPosts) return [];
    const uniq = Array.from(new Set(allPosts.map((p) => p.category).filter(Boolean)));
    return uniq.sort();
  }, [allPosts]);

  const labelFor = (cat: string) => knownCategories[cat] ?? cat;

  return (
    <div className="flex flex-col">
      <PageHero
        eyebrow={t.nav.news}
        title={locale === "ar" ? "آخر الأخبار والمقالات" : "Latest News & Insights"}
        subtitle={
          locale === "ar"
            ? "ابقَ على اطلاع بأحدث مستجدات الصناعة وأخبار الشركة والمقالات التقنية من فريق مهاكسا."
            : "Stay up-to-date with industry developments, company announcements, and technical articles from the MHASA team."
        }
        breadcrumb={t.nav.news}
      />

      <section className="section-pad bg-background">
        <div className="container mx-auto px-6">
          {/* Category filter */}
          <FadeIn className="mb-10">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
                {locale === "ar" ? "الكل" : "All"}
              </FilterChip>
              {categories.map((cat) => (
                <FilterChip
                  key={cat}
                  active={category === cat}
                  onClick={() => setCategory(cat)}
                >
                  {labelFor(cat)}
                </FilterChip>
              ))}
            </div>
          </FadeIn>

          {/* Grid */}
          {allLoading ? (
            <BlogGridSkeleton count={6} />
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">{t.common.noResults}</p>
            </div>
          ) : (
            <div className="fade-in-content grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((p, i) => (
                <BlogCard key={p.id} post={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      <CTASection />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all",
        active
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
          : "bg-muted/60 text-foreground hover:bg-muted hover:text-primary"
      )}
    >
      {children}
    </button>
  );
}

// ============================================================================
// Post Detail — cover hero + meta + content + tags + share + related.
// ============================================================================
function PostDetail({ slug }: { slug: string }) {
  const { data: post, isLoading } = useBlogPost(slug);
  const { data: allPosts } = useBlogPosts();
  const { t, locale, pick } = useLocale();
  const resetSelection = useAppStore((s) => s.resetSelection);
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-[60dvh] flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">{t.common.loading}</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[60dvh] flex flex-col items-center justify-center gap-4 bg-background">
        <p className="text-muted-foreground">{t.common.noResults}</p>
        <Button onClick={resetSelection} variant="outline">
          <ChevronLeft className="me-2 h-4 w-4 rtl:rotate-180" />
          {locale === "ar" ? "العودة للأخبار" : "Back to News"}
        </Button>
      </div>
    );
  }

  const title = pick(post.title, post.titleAr) ?? post.title;
  const content = pick(post.content, post.contentAr) ?? post.content;
  const excerpt = pick(post.excerpt, post.excerptAr);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };
  const publishedAt = formatDate(post.publishedAt);

  // Reading time estimate (avg 200 wpm)
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.round(wordCount / 200));

  // Related posts (same category, exclude current, limit 3)
  const relatedPosts = (allPosts ?? [])
    .filter((p) => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success(locale === "ar" ? "تم نسخ الرابط" : "Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(locale === "ar" ? "تعذر النسخ" : "Couldn't copy link");
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = encodeURIComponent(title);

  return (
    <div className="flex flex-col">
      <ReadingProgress />

      {/* Cover hero */}
      <section className="relative h-[60dvh] min-h-[440px] w-full overflow-hidden bg-navy">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : null}
        <div className="absolute inset-0 hero-overlay" />

        <div className="relative z-10 container mx-auto h-full px-6 flex flex-col justify-end pb-12">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            onClick={resetSelection}
            className="inline-flex w-fit items-center gap-1.5 text-sm text-white/80 hover:text-gold transition-colors mb-6"
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            {locale === "ar" ? "كل الأخبار" : "All News"}
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-3xl"
          >
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className="bg-gold text-gold-foreground hover:bg-gold font-semibold border-0">
                {post.category}
              </Badge>
              {publishedAt && (
                <span className="inline-flex items-center gap-1.5 text-sm text-white/80">
                  <Calendar className="h-4 w-4 text-gold" />
                  {publishedAt}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-sm text-white/80">
                <Clock className="h-4 w-4 text-gold" />
                {locale === "ar" ? `${readingMinutes} دقائق قراءة` : `${readingMinutes} min read`}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-white leading-[1.1] text-balance">
              {title}
            </h1>
            {excerpt && (
              <p className="mt-4 text-base md:text-lg text-white/80 leading-relaxed text-balance line-clamp-2">
                {excerpt}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Author + share bar */}
      <section className="py-6 bg-muted/30 border-b border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                <User className="h-5 w-5" />
              </div>
              <div>
                {post.authorName && (
                  <div className="text-sm font-semibold text-foreground">{post.authorName}</div>
                )}
                <div className="text-xs text-muted-foreground inline-flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {post.views.toLocaleString()} {locale === "ar" ? "مشاهدة" : "views"}
                </div>
              </div>
            </div>

            {/* Share buttons */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider me-1 inline-flex items-center gap-1.5">
                <Share2 className="h-3.5 w-3.5" />
                {locale === "ar" ? "مشاركة" : "Share"}
              </span>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/60 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on X / Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/60 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href={`https://wa.me/?text=${shareText}%20${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on WhatsApp"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/60 text-foreground hover:bg-[#25D366] hover:text-white transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <button
                onClick={handleCopyLink}
                aria-label="Copy link"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/60 text-foreground hover:bg-gold hover:text-gold-foreground transition-colors"
              >
                {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Article body */}
      <section className="section-pad bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            {/* TOC sidebar (desktop only) */}
            <div className="hidden lg:block lg:col-span-3">
              <BlogToc content={content} />
            </div>

            {/* Article content */}
            <div className="lg:col-span-9">
              <FadeIn>
                <article
                  className="prose-content text-foreground/90 leading-relaxed
                    [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:font-display [&_h1]:mt-8 [&_h1]:mb-4
                    [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:font-display [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-foreground
                    [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-foreground
                    [&_p]:mb-4 [&_p]:text-muted-foreground [&_p]:leading-relaxed
                    [&_ul]:list-disc [&_ul]:ps-6 [&_ul]:mb-4 [&_ul]:space-y-2 [&_ul]:text-muted-foreground
                    [&_ol]:list-decimal [&_ol]:ps-6 [&_ol]:mb-4 [&_ol]:space-y-2 [&_ol]:text-muted-foreground
                    [&_li]:leading-relaxed
                    [&_blockquote]:border-s-4 [&_blockquote]:border-gold [&_blockquote]:ps-4 [&_blockquote]:py-2 [&_blockquote]:my-6 [&_blockquote]:bg-muted/30 [&_blockquote]:rounded-e-lg [&_blockquote]:text-foreground [&_blockquote]:italic
                    [&_a]:text-primary [&_a]:font-medium [&_a]:underline [&_a]:hover:text-gold
                    [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
                    [&_pre]:bg-navy [&_pre]:text-white [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4
                    [&_img]:rounded-lg [&_img]:my-4"
                >
                  <ReactMarkdown
                    components={markdownHeadingComponents}
                    urlTransform={(url) => {
                      // Security: only allow http, https, mailto, and relative URLs
                      // Prevents javascript: and data: URL injection via markdown links
                      if (/^(https?:|mailto:|\/|#)/i.test(url)) return url;
                      return "#";
                    }}
                  >{content}</ReactMarkdown>
                </article>
              </FadeIn>

            {/* Tags */}
            {post.tags.length > 0 && (
              <FadeIn delay={0.1} className="mt-10 pt-6 border-t border-border">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag className="h-4 w-4 text-gold me-1" />
                  {post.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-muted/60 text-foreground hover:bg-muted"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </FadeIn>
            )}

            {/* Back to news button */}
            <FadeIn delay={0.15} className="mt-10">
              <Button onClick={resetSelection} variant="outline">
                <ChevronLeft className="me-2 h-4 w-4 rtl:rotate-180" />
                {locale === "ar" ? "كل الأخبار" : "Back to All News"}
              </Button>
            </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="section-pad bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <div className="absolute top-0 end-1/4 h-72 w-72 rounded-full bg-gold blur-3xl" />
          </div>
          <div className="container mx-auto px-6 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <SectionHeading
                eyebrow={locale === "ar" ? "مقالات ذات صلة" : "Related Articles"}
                title={locale === "ar" ? "تابع القراءة" : "Keep Reading"}
                align="left"
              />
              <Button
                variant="outline"
                onClick={resetSelection}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground self-start md:self-auto font-semibold"
              >
                {locale === "ar" ? "كل الأخبار" : "All News"}
                <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((p, i) => (
                <BlogCard key={p.id} post={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CTASection />
    </div>
  );
}

// ============================================================================
// Page Hero — shared hero for the news list page.
// ============================================================================
function PageHero({
  eyebrow,
  title,
  subtitle,
  breadcrumb,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  breadcrumb: string;
}) {
  const { t } = useLocale();
  const setView = useAppStore((s) => s.setView);

  return (
    <section className="relative py-16 md:py-24 bg-navy text-white overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 end-0 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute bottom-0 start-0 h-96 w-96 rounded-full bg-primary/40 blur-3xl" />
      </div>
      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 text-xs text-white/60 mb-6"
        >
          <button onClick={() => setView("home")} className="hover:text-gold transition-colors">
            {t.nav.home}
          </button>
          <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
          <span className="text-gold font-medium">{breadcrumb}</span>
        </motion.div>

        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          light
          align="left"
        />
      </div>
    </section>
  );
}

// ============================================================================
// CTA Section.
// ============================================================================
function CTASection() {
  const setView = useAppStore((s) => s.setView);
  const { t, locale } = useLocale();

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-primary via-navy to-navy">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 end-0 h-96 w-96 rounded-full bg-gold blur-3xl" />
        <div className="absolute bottom-0 start-0 h-96 w-96 rounded-full bg-gold blur-3xl" />
      </div>
      <div className="container mx-auto px-6 relative">
        <div className="mx-auto max-w-3xl text-center">
          <GoldDivider className="mb-6" />
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-display text-balance">
            {locale === "ar" ? "هل لديك سؤال هندسي؟" : "Have an Engineering Question?"}
          </h2>
          <p className="mt-4 text-white/70 text-base md:text-lg leading-relaxed text-balance">
            {locale === "ar"
              ? "فريقنا الهندسي جاهز لمساعدتك في تحديات تركيب الأنابيب والحلول الصناعية."
              : "Our engineering team is ready to help with your pipe installation and industrial solution challenges."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              onClick={() => setView("contact")}
              className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold px-8 h-12 text-base shadow-xl shadow-gold/20"
            >
              <Sparkles className="me-2 h-4 w-4" />
              {t.actions.getInTouch}
              <ArrowRight className="ms-2 h-5 w-5 rtl:rotate-180" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setView("services")}
              className="border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white h-12 px-8 text-base"
            >
              {t.actions.exploreServices}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
