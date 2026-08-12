import { NextRequest } from "next/server";
import { db } from "@/db";
import { resumes, education, workExperiences, projects, extracurriculars, skills, certifications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { route, ok, fail, requireUser, requireOwnedResume, logActivity, newId, slugify } from "@/lib/api";

export const dynamic = "force-dynamic";

/** GET /api/resumes — every resume belonging to the signed-in student. */
export const GET = route(async () => {
  const user = await requireUser();

  const userResumes = await db
    .select()
    .from(resumes)
    .where(eq(resumes.userId, user.id))
    .orderBy(desc(resumes.updatedAt));

  return ok({ resumes: userResumes });
});

/** POST /api/resumes — create blank, or clone an existing owned resume. */
export const POST = route(async (req: NextRequest) => {
  const user = await requireUser();
  const body = await req.json();
  const { title, targetRole, template, colorTheme, copyFromResumeId } = body;

  if (!title || !String(title).trim()) {
    return fail("Please give your resume a title.", 400);
  }

  // Cloning is only allowed from a resume the user actually owns.
  if (copyFromResumeId) {
    await requireOwnedResume(copyFromResumeId, user.id);
  }

  const resumeId = newId("res");

  const [newResume] = await db
    .insert(resumes)
    .values({
      id: resumeId,
      userId: user.id,
      title: String(title).trim(),
      targetRole: targetRole?.trim() || user.headline || "Internship Applicant",
      template: template || "modern_tech",
      colorTheme: colorTheme || "navy",
      shareSlug: slugify(String(title)),
      atsScore: 80,
    })
    .returning();

  if (copyFromResumeId) {
    const [edus, works, projs, extras, skls, certs] = await Promise.all([
      db.select().from(education).where(eq(education.resumeId, copyFromResumeId)),
      db.select().from(workExperiences).where(eq(workExperiences.resumeId, copyFromResumeId)),
      db.select().from(projects).where(eq(projects.resumeId, copyFromResumeId)),
      db.select().from(extracurriculars).where(eq(extracurriculars.resumeId, copyFromResumeId)),
      db.select().from(skills).where(eq(skills.resumeId, copyFromResumeId)),
      db.select().from(certifications).where(eq(certifications.resumeId, copyFromResumeId)),
    ]);

    // Bulk insert per table instead of a query per row.
    const rebind = <T extends { id: string }>(rows: T[], prefix: string) =>
      rows.map((r) => ({ ...r, id: newId(prefix), resumeId, userId: user.id }));

    if (edus.length) await db.insert(education).values(rebind(edus, "edu"));
    if (works.length) await db.insert(workExperiences).values(rebind(works, "work"));
    if (projs.length) await db.insert(projects).values(rebind(projs, "proj"));
    if (extras.length) await db.insert(extracurriculars).values(rebind(extras, "extra"));
    if (skls.length) await db.insert(skills).values(rebind(skls, "skill"));
    if (certs.length) await db.insert(certifications).values(rebind(certs, "cert"));
  } else {
    // Give a brand-new resume a sensible starting point.
    await db.insert(education).values({
      id: newId("edu"),
      resumeId,
      userId: user.id,
      institution: user.university || "Your University",
      degree: "Bachelor of Science",
      major: user.department || "Computer Science",
      location: user.location || "City, State",
      startDate: "Aug 2022",
      endDate: user.graduationYear ? `Expected May ${user.graduationYear}` : "Expected May 2026",
      gpa: "3.80 / 4.00",
      honors: "Dean's List",
      coursework: "Data Structures, Algorithms",
      sortOrder: 1,
    });
    await db.insert(skills).values({
      id: newId("skill"),
      resumeId,
      userId: user.id,
      category: "Technical Skills",
      skillsList: "Python, TypeScript, SQL, Git, React",
      sortOrder: 1,
    });
  }

  await logActivity({
    userId: user.id,
    resumeId,
    type: "resume",
    action: copyFromResumeId ? "Resume duplicated" : "Resume created",
    target: newResume.title,
    result: newResume.template.replace(/_/g, " "),
    status: "success",
  });

  return ok({ success: true, resume: newResume }, 201);
});
