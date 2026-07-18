import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { resumes, education, workExperiences, projects, extracurriculars, skills, certifications, users } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: resumeId } = await params;

    const resumeList = await db.select().from(resumes).where(eq(resumes.id, resumeId)).limit(1);
    if (resumeList.length === 0) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }
    const resume = resumeList[0];
    const ownerList = await db.select().from(users).where(eq(users.id, resume.userId)).limit(1);
    const user = ownerList[0] || null;

    const eduList = await db.select().from(education).where(eq(education.resumeId, resumeId)).orderBy(asc(education.sortOrder));
    const workList = await db.select().from(workExperiences).where(eq(workExperiences.resumeId, resumeId)).orderBy(asc(workExperiences.sortOrder));
    const projList = await db.select().from(projects).where(eq(projects.resumeId, resumeId)).orderBy(asc(projects.sortOrder));
    const extraList = await db.select().from(extracurriculars).where(eq(extracurriculars.resumeId, resumeId)).orderBy(asc(extracurriculars.sortOrder));
    const skillList = await db.select().from(skills).where(eq(skills.resumeId, resumeId)).orderBy(asc(skills.sortOrder));
    const certList = await db.select().from(certifications).where(eq(certifications.resumeId, resumeId)).orderBy(asc(certifications.sortOrder));

    const backupData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      resume,
      user,
      education: eduList,
      workExperiences: workList,
      projects: projList,
      extracurriculars: extraList,
      skills: skillList,
      certifications: certList,
    };

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${resume.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-backup.json"`,
      },
    });
  } catch (error) {
    console.error("Export resume error:", error);
    return NextResponse.json({ error: "Failed to export resume backup" }, { status: 500 });
  }
}
