import { NextRequest } from "next/server";
import { db } from "@/db";
import { resumes, education, workExperiences, projects, extracurriculars, skills, certifications, users } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { route, ok, requireUser, requireOwnedResume, logActivity } from "@/lib/api";
import { toPublicUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** Load a resume plus every section, ordered for rendering. */
export async function loadResumeBundle(resumeId: string) {
  const [eduList, workList, projList, extraList, skillList, certList] = await Promise.all([
    db.select().from(education).where(eq(education.resumeId, resumeId)).orderBy(asc(education.sortOrder)),
    db.select().from(workExperiences).where(eq(workExperiences.resumeId, resumeId)).orderBy(asc(workExperiences.sortOrder)),
    db.select().from(projects).where(eq(projects.resumeId, resumeId)).orderBy(asc(projects.sortOrder)),
    db.select().from(extracurriculars).where(eq(extracurriculars.resumeId, resumeId)).orderBy(asc(extracurriculars.sortOrder)),
    db.select().from(skills).where(eq(skills.resumeId, resumeId)).orderBy(asc(skills.sortOrder)),
    db.select().from(certifications).where(eq(certifications.resumeId, resumeId)).orderBy(asc(certifications.sortOrder)),
  ]);

  return {
    education: eduList,
    workExperiences: workList,
    projects: projList,
    extracurriculars: extraList,
    skills: skillList,
    certifications: certList,
  };
}

/** GET /api/resumes/:id — owner only. */
export const GET = route(async (_req: NextRequest, { params }: Ctx) => {
  const user = await requireUser();
  const { id: resumeId } = await params;

  const resume = await requireOwnedResume(resumeId, user.id);

  const ownerRows = await db.select().from(users).where(eq(users.id, resume.userId)).limit(1);
  const sections = await loadResumeBundle(resumeId);

  return ok({
    resume,
    user: ownerRows[0] ? toPublicUser(ownerRows[0]) : null,
    ...sections,
  });
});

/** PUT /api/resumes/:id — update design + metadata. */
export const PUT = route(async (req: NextRequest, { params }: Ctx) => {
  const user = await requireUser();
  const { id: resumeId } = await params;
  await requireOwnedResume(resumeId, user.id);

  const body = await req.json();
  const {
    title, targetRole, template, colorTheme, fontSize, fontFamily,
    showGpa, showCoursework, showProjectsFirst, isPublic, atsScore,
  } = body;

  const [updated] = await db
    .update(resumes)
    .set({
      ...(title !== undefined && { title: String(title) }),
      ...(targetRole !== undefined && { targetRole }),
      ...(template !== undefined && { template }),
      ...(colorTheme !== undefined && { colorTheme }),
      ...(fontSize !== undefined && { fontSize }),
      ...(fontFamily !== undefined && { fontFamily }),
      ...(showGpa !== undefined && { showGpa: Boolean(showGpa) }),
      ...(showCoursework !== undefined && { showCoursework: Boolean(showCoursework) }),
      ...(showProjectsFirst !== undefined && { showProjectsFirst: Boolean(showProjectsFirst) }),
      ...(isPublic !== undefined && { isPublic: Boolean(isPublic) }),
      ...(atsScore !== undefined && { atsScore: Number(atsScore) }),
      updatedAt: new Date(),
    })
    .where(eq(resumes.id, resumeId))
    .returning();

  // Visibility changes are security-relevant, so record them.
  if (isPublic !== undefined) {
    await logActivity({
      userId: user.id,
      resumeId,
      type: "edit",
      action: isPublic ? "Public link enabled" : "Public link disabled",
      target: updated.title,
      status: isPublic ? "success" : "warning",
    });
  }

  return ok({ success: true, resume: updated });
});

/** DELETE /api/resumes/:id — owner only; sections cascade. */
export const DELETE = route(async (_req: NextRequest, { params }: Ctx) => {
  const user = await requireUser();
  const { id: resumeId } = await params;
  const resume = await requireOwnedResume(resumeId, user.id);

  await db.delete(resumes).where(eq(resumes.id, resumeId));

  await logActivity({
    userId: user.id,
    type: "resume",
    action: "Resume deleted",
    target: resume.title,
    status: "warning",
  });

  return ok({ success: true });
});
