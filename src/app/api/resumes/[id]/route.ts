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

    // Fetch user details
    const ownerList = await db.select().from(users).where(eq(users.id, resume.userId)).limit(1);
    const owner = ownerList[0] || null;

    // Fetch sections ordered by sortOrder
    const eduList = await db.select().from(education).where(eq(education.resumeId, resumeId)).orderBy(asc(education.sortOrder));
    const workList = await db.select().from(workExperiences).where(eq(workExperiences.resumeId, resumeId)).orderBy(asc(workExperiences.sortOrder));
    const projList = await db.select().from(projects).where(eq(projects.resumeId, resumeId)).orderBy(asc(projects.sortOrder));
    const extraList = await db.select().from(extracurriculars).where(eq(extracurriculars.resumeId, resumeId)).orderBy(asc(extracurriculars.sortOrder));
    const skillList = await db.select().from(skills).where(eq(skills.resumeId, resumeId)).orderBy(asc(skills.sortOrder));
    const certList = await db.select().from(certifications).where(eq(certifications.resumeId, resumeId)).orderBy(asc(certifications.sortOrder));

    return NextResponse.json({
      resume,
      user: owner,
      education: eduList,
      workExperiences: workList,
      projects: projList,
      extracurriculars: extraList,
      skills: skillList,
      certifications: certList,
    });
  } catch (error) {
    console.error("Fetch detailed resume error:", error);
    return NextResponse.json({ error: "Failed to fetch resume details" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: resumeId } = await params;
    const body = await req.json();

    const {
      title,
      targetRole,
      template,
      colorTheme,
      fontSize,
      fontFamily,
      showGpa,
      showCoursework,
      showProjectsFirst,
      isPublic,
      atsScore,
    } = body;

    const [updated] = await db
      .update(resumes)
      .set({
        ...(title !== undefined && { title }),
        ...(targetRole !== undefined && { targetRole }),
        ...(template !== undefined && { template }),
        ...(colorTheme !== undefined && { colorTheme }),
        ...(fontSize !== undefined && { fontSize }),
        ...(fontFamily !== undefined && { fontFamily }),
        ...(showGpa !== undefined && { showGpa }),
        ...(showCoursework !== undefined && { showCoursework }),
        ...(showProjectsFirst !== undefined && { showProjectsFirst }),
        ...(isPublic !== undefined && { isPublic }),
        ...(atsScore !== undefined && { atsScore }),
        updatedAt: new Date(),
      })
      .where(eq(resumes.id, resumeId))
      .returning();

    return NextResponse.json({ success: true, resume: updated });
  } catch (error) {
    console.error("Update resume error:", error);
    return NextResponse.json({ error: "Failed to update resume" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: resumeId } = await params;

    await db.delete(resumes).where(eq(resumes.id, resumeId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete resume error:", error);
    return NextResponse.json({ error: "Failed to delete resume" }, { status: 500 });
  }
}
