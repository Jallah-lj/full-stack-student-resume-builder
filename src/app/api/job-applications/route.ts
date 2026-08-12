import { NextRequest } from "next/server";
import { db } from "@/db";
import { jobApplications, resumes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { route, ok, fail, requireUser, requireOwnedResume, logActivity, newId } from "@/lib/api";

export const dynamic = "force-dynamic";

const STATUSES = ["draft", "applied", "interviewing", "offer", "rejected"] as const;

/** GET /api/job-applications — tracker rows joined with their resume title. */
export const GET = route(async () => {
  const user = await requireUser();

  const apps = await db
    .select({
      id: jobApplications.id,
      resumeId: jobApplications.resumeId,
      companyName: jobApplications.companyName,
      jobTitle: jobApplications.jobTitle,
      jobDescription: jobApplications.jobDescription,
      matchScore: jobApplications.matchScore,
      missingKeywords: jobApplications.missingKeywords,
      matchedKeywords: jobApplications.matchedKeywords,
      status: jobApplications.status,
      createdAt: jobApplications.createdAt,
      resumeTitle: resumes.title,
    })
    .from(jobApplications)
    .leftJoin(resumes, eq(resumes.id, jobApplications.resumeId))
    .where(eq(jobApplications.userId, user.id))
    .orderBy(desc(jobApplications.createdAt));

  return ok({ jobApplications: apps });
});

/** POST /api/job-applications — save a tailored match to the tracker. */
export const POST = route(async (req: NextRequest) => {
  const user = await requireUser();
  const body = await req.json();
  const { resumeId, companyName, jobTitle, jobDescription, matchScore, missingKeywords, matchedKeywords, status } = body;

  if (!resumeId) return fail("Choose which resume you applied with.", 400);
  // resumeId is a NOT NULL foreign key — verify ownership before inserting
  // so we return a clean 403/404 instead of a database constraint error.
  await requireOwnedResume(resumeId, user.id);

  if (!companyName?.trim()) return fail("Company name is required.", 400);
  if (!jobTitle?.trim()) return fail("Job title is required.", 400);

  const nextStatus = STATUSES.includes(status) ? status : "applied";
  const asJson = (v: unknown) => (typeof v === "string" ? v : JSON.stringify(v ?? []));

  const [application] = await db
    .insert(jobApplications)
    .values({
      id: newId("job"),
      userId: user.id,
      resumeId,
      companyName: companyName.trim(),
      jobTitle: jobTitle.trim(),
      jobDescription: jobDescription || "",
      matchScore: Number(matchScore) || 75,
      missingKeywords: asJson(missingKeywords),
      matchedKeywords: asJson(matchedKeywords),
      status: nextStatus,
    })
    .returning();

  await logActivity({
    userId: user.id,
    resumeId,
    type: "application",
    action: "Application tracked",
    target: `${application.jobTitle} · ${application.companyName}`,
    result: `${application.matchScore}% match`,
    status: "success",
  });

  return ok({ success: true, application }, 201);
});
