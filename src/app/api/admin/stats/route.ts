// ============================================================================
// /api/admin/stats — Aggregated analytics for the admin dashboard.
// Returns: leads over last 30 days, applications by status, content counts,
// top project categories, subscriber growth.
// ============================================================================

import { db } from "@/lib/db";
import { ok, requireAdmin, isErrorResponse } from "@/lib/api";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (isErrorResponse(auth)) return auth;

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  // Leads over last 30 days (grouped by day)
  const leads = await db.contactLead.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { id: true, status: true, createdAt: true, projectBudget: true },
  });

  const leadsByDay: Record<string, number> = {};
  leads.forEach((l) => {
    const day = l.createdAt.toISOString().slice(0, 10);
    leadsByDay[day] = (leadsByDay[day] ?? 0) + 1;
  });

  // Fill missing days with 0
  const leadsTimeSeries: { date: string; count: number; label: string }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dayKey = d.toISOString().slice(0, 10);
    leadsTimeSeries.push({
      date: dayKey,
      count: leadsByDay[dayKey] ?? 0,
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    });
  }

  // Applications by status
  const applications = await db.jobApplication.findMany({ select: { status: true } });
  const appsByStatus: Record<string, number> = {};
  applications.forEach((a) => {
    appsByStatus[a.status] = (appsByStatus[a.status] ?? 0) + 1;
  });

  // Leads by status (for breakdown)
  const allLeads = await db.contactLead.findMany({ select: { status: true } });
  const leadsByStatus: Record<string, number> = {};
  allLeads.forEach((l) => {
    leadsByStatus[l.status] = (leadsByStatus[l.status] ?? 0) + 1;
  });

  // Content counts
  const [services, projects, blogPosts, teamMembers, testimonials, clients, jobs, galleryItems, faqs, subscribers] = await Promise.all([
    db.service.count(),
    db.project.count(),
    db.blogPost.count(),
    db.teamMember.count(),
    db.testimonial.count(),
    db.client.count(),
    db.job.count(),
    db.galleryItem.count(),
    db.faqItem.count(),
    db.newsletterSubscriber.count({ where: { isActive: true } }),
  ]);

  // Top project categories
  const allProjects = await db.project.findMany({ select: { category: true, value: true } });
  const categoryStats: Record<string, { count: number; totalValue: number }> = {};
  allProjects.forEach((p) => {
    if (!categoryStats[p.category]) categoryStats[p.category] = { count: 0, totalValue: 0 };
    categoryStats[p.category].count += 1;
    categoryStats[p.category].totalValue += p.value ?? 0;
  });
  const topCategories = Object.entries(categoryStats)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Leads by budget
  const leadsByBudget: Record<string, number> = {};
  leads.forEach((l) => {
    const b = l.projectBudget ?? "Not specified";
    leadsByBudget[b] = (leadsByBudget[b] ?? 0) + 1;
  });

  return ok({
    leadsTimeSeries,
    appsByStatus,
    leadsByStatus,
    contentCounts: {
      services, projects, blogPosts, teamMembers, testimonials,
      clients, jobs, galleryItems, faqs, subscribers,
    },
    topCategories,
    leadsByBudget,
    totals: {
      leads: allLeads.length,
      applications: applications.length,
      recentLeads: leads.length,
    },
  });
}
