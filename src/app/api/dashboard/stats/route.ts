import { db } from "@/db";
import { resumes, jobApplications, activityLog, resumeViews } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { route, ok, requireUser } from "@/lib/api";

export const dynamic = "force-dynamic";

/** GET /api/dashboard/stats — everything the dashboard home needs, in one call. */
export const GET = route(async () => {
  const user = await requireUser();

  const [userResumes, userApps, recentActivity, viewRows] = await Promise.all([
    db.select().from(resumes).where(eq(resumes.userId, user.id)).orderBy(desc(resumes.updatedAt)),
    db
      .select({
        id: jobApplications.id,
        companyName: jobApplications.companyName,
        jobTitle: jobApplications.jobTitle,
        matchScore: jobApplications.matchScore,
        status: jobApplications.status,
        createdAt: jobApplications.createdAt,
        resumeId: jobApplications.resumeId,
      })
      .from(jobApplications)
      .where(eq(jobApplications.userId, user.id))
      .orderBy(desc(jobApplications.createdAt)),
    db.select().from(activityLog).where(eq(activityLog.userId, user.id)).orderBy(desc(activityLog.createdAt)).limit(6),
    db
      .select({ views: sql<number>`count(*)::int` })
      .from(resumeViews)
      .innerJoin(resumes, eq(resumes.id, resumeViews.resumeId))
      .where(eq(resumes.userId, user.id)),
  ]);

  const avgAtsScore = userResumes.length
    ? Math.round(userResumes.reduce((s, r) => s + (r.atsScore || 0), 0) / userResumes.length)
    : 0;

  const statusCounts = userApps.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  // Profile completion drives the checklist card on the dashboard.
  const checklist = [
    { key: "profilePicture", label: "Profile picture", done: !!user.profilePictureUrl },
    { key: "university", label: "University set", done: !!user.university },
    { key: "preferredRole", label: "Preferred role", done: !!user.preferredJobRole },
    { key: "linkedin", label: "LinkedIn URL", done: !!user.linkedinUrl },
    { key: "firstResume", label: "First resume created", done: userResumes.length > 0 },
  ];
  const completionPct = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100);

  return ok({
    totalResumes: userResumes.length,
    avgAtsScore,
    totalApplications: userApps.length,
    interviewing: statusCounts["interviewing"] || 0,
    offers: statusCounts["offer"] || 0,
    applied: statusCounts["applied"] || 0,
    rejected: statusCounts["rejected"] || 0,
    totalViews: viewRows[0]?.views ?? 0,
    bestResume: userResumes.reduce<typeof userResumes[number] | null>(
      (best, r) => (!best || r.atsScore > best.atsScore ? r : best),
      null
    ),
    checklist,
    completionPct,
    recentResumes: userResumes.slice(0, 3),
    recentApps: userApps.slice(0, 5),
    recentActivity,
  });
});
