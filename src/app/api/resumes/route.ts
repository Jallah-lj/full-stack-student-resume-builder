import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { resumes, education, workExperiences, projects, extracurriculars, skills, certifications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function getUser(req: NextRequest) {
  const { getSessionUser } = await import("@/lib/auth");
  return getSessionUser();
}

export async function GET(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 503 });
    const user = await getUser(req);
    if (!user) return NextResponse.json({ resumes: [] });

    const userResumes = await db.select().from(resumes).where(eq(resumes.userId, user.id)).orderBy(desc(resumes.updatedAt));
    return NextResponse.json({ resumes: userResumes });
  } catch (err: any) {
    console.error("GET /api/resumes:", err?.message);
    return NextResponse.json({ error: err?.message || "Failed to fetch resumes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 503 });
    const user = await getUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, targetRole, template, colorTheme, copyFromResumeId } = body;

    const resumeId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const shareSlug = `${(title || "resume").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.random().toString(36).substring(2, 6)}`;

    const [newResume] = await db.insert(resumes).values({
      id: resumeId, userId: user.id,
      title: title || "New Resume",
      targetRole: targetRole || user.headline || "Internship Applicant",
      template: template || "modern_tech",
      colorTheme: colorTheme || "navy",
      shareSlug, atsScore: 80,
    }).returning();

    if (copyFromResumeId) {
      const [edus, works, projs, extras, skls, certs] = await Promise.all([
        db.select().from(education).where(eq(education.resumeId, copyFromResumeId)),
        db.select().from(workExperiences).where(eq(workExperiences.resumeId, copyFromResumeId)),
        db.select().from(projects).where(eq(projects.resumeId, copyFromResumeId)),
        db.select().from(extracurriculars).where(eq(extracurriculars.resumeId, copyFromResumeId)),
        db.select().from(skills).where(eq(skills.resumeId, copyFromResumeId)),
        db.select().from(certifications).where(eq(certifications.resumeId, copyFromResumeId)),
      ]);
      for (const e of edus)  await db.insert(education).values({ ...e, id: `edu_${Date.now()}_${Math.random().toString(36).substring(2,6)}`, resumeId, userId: user.id });
      for (const w of works) await db.insert(workExperiences).values({ ...w, id: `work_${Date.now()}_${Math.random().toString(36).substring(2,6)}`, resumeId, userId: user.id });
      for (const p of projs) await db.insert(projects).values({ ...p, id: `proj_${Date.now()}_${Math.random().toString(36).substring(2,6)}`, resumeId, userId: user.id });
      for (const x of extras) await db.insert(extracurriculars).values({ ...x, id: `extra_${Date.now()}_${Math.random().toString(36).substring(2,6)}`, resumeId, userId: user.id });
      for (const s of skls)  await db.insert(skills).values({ ...s, id: `skill_${Date.now()}_${Math.random().toString(36).substring(2,6)}`, resumeId, userId: user.id });
      for (const c of certs) await db.insert(certifications).values({ ...c, id: `cert_${Date.now()}_${Math.random().toString(36).substring(2,6)}`, resumeId, userId: user.id });
    } else {
      await db.insert(education).values({ id: `edu_${Date.now()}`, resumeId, userId: user.id, institution: "Your University", degree: "Bachelor of Science", major: "Computer Science", location: "City, State", startDate: "Aug 2022", endDate: "Expected May 2026", gpa: "3.80 / 4.00", honors: "Dean's List", coursework: "Data Structures, Algorithms", sortOrder: 1 });
      await db.insert(skills).values({ id: `skill_${Date.now()}`, resumeId, userId: user.id, category: "Technical Skills", skillsList: "Python, TypeScript, SQL, Git, React", sortOrder: 1 });
    }

    return NextResponse.json({ success: true, resume: newResume });
  } catch (err: any) {
    console.error("POST /api/resumes:", err?.message);
    return NextResponse.json({ error: err?.message || "Failed to create resume" }, { status: 500 });
  }
}
