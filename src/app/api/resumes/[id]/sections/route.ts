import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { education, workExperiences, projects, extracurriculars, skills, certifications, resumes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: resumeId } = await params;
    const body = await req.json();
    const { sectionType, data } = body;

    const newId = `${sectionType}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Update resume timestamp
    await db.update(resumes).set({ updatedAt: new Date() }).where(eq(resumes.id, resumeId));

    let createdRecord = null;

    if (sectionType === "education") {
      [createdRecord] = await db.insert(education).values({
        id: newId,
        resumeId,
        userId: user.id,
        institution: data.institution || "New Institution",
        degree: data.degree || "Bachelor of Science",
        major: data.major || "Major Field",
        minor: data.minor || "",
        location: data.location || "",
        startDate: data.startDate || "",
        endDate: data.endDate || "Expected 2026",
        gpa: data.gpa || "",
        honors: data.honors || "",
        coursework: data.coursework || "",
        sortOrder: data.sortOrder || 10,
      }).returning();
    } else if (sectionType === "work") {
      [createdRecord] = await db.insert(workExperiences).values({
        id: newId,
        resumeId,
        userId: user.id,
        company: data.company || "Company Name",
        role: data.role || "Role Title",
        location: data.location || "",
        startDate: data.startDate || "",
        endDate: data.endDate || "",
        isCurrent: Boolean(data.isCurrent),
        bullets: typeof data.bullets === "string" ? data.bullets : JSON.stringify(data.bullets || ["Key contribution or accomplishment"]),
        sortOrder: data.sortOrder || 10,
      }).returning();
    } else if (sectionType === "projects") {
      [createdRecord] = await db.insert(projects).values({
        id: newId,
        resumeId,
        userId: user.id,
        title: data.title || "Project Title",
        roleOrTechnologies: data.roleOrTechnologies || "",
        link: data.link || "",
        date: data.date || "",
        bullets: typeof data.bullets === "string" ? data.bullets : JSON.stringify(data.bullets || ["Built feature or system"]),
        sortOrder: data.sortOrder || 10,
      }).returning();
    } else if (sectionType === "extracurriculars") {
      [createdRecord] = await db.insert(extracurriculars).values({
        id: newId,
        resumeId,
        userId: user.id,
        organization: data.organization || "Club or Leadership Org",
        role: data.role || "Executive / Member",
        date: data.date || "",
        bullets: typeof data.bullets === "string" ? data.bullets : JSON.stringify(data.bullets || ["Organized events or led team"]),
        sortOrder: data.sortOrder || 10,
      }).returning();
    } else if (sectionType === "skills") {
      [createdRecord] = await db.insert(skills).values({
        id: newId,
        resumeId,
        userId: user.id,
        category: data.category || "Skill Category",
        skillsList: data.skillsList || "Skill 1, Skill 2, Skill 3",
        sortOrder: data.sortOrder || 10,
      }).returning();
    } else if (sectionType === "certifications") {
      [createdRecord] = await db.insert(certifications).values({
        id: newId,
        resumeId,
        userId: user.id,
        name: data.name || "Certification Name",
        issuer: data.issuer || "",
        issueDate: data.issueDate || "",
        credentialUrl: data.credentialUrl || "",
        sortOrder: data.sortOrder || 10,
      }).returning();
    } else {
      return NextResponse.json({ error: "Invalid section type" }, { status: 400 });
    }

    return NextResponse.json({ success: true, sectionType, record: createdRecord });
  } catch (error) {
    console.error("Create section error:", error);
    return NextResponse.json({ error: "Failed to create section record" }, { status: 500 });
  }
}
