import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getJobBySlug, getAllJobSlugs } from "@/lib/server-queries";
import { JobDetail } from "@/components/views/careers-view";

export async function generateStaticParams() {
  const slugs = await getAllJobSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return { title: "Job Not Found" };
  return {
    title: job.title,
    description: `${job.title} — ${job.department} in ${job.location}`,
  };
}

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) notFound();
  return <JobDetail slug={slug} />;
}
