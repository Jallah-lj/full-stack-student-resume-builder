import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { education, workExperiences, projects, extracurriculars, skills, certifications, resumes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ type: string; sectionId: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, sectionId } = await params;
    const body = await req.json();

    let updatedRecord = null;
    let resumeIdToTouch = null;

    if (type === "education") {
      const existing = await db.select().from(education).where(eq(education.id, sectionId)).limit(1);
      if (existing.length === 0) return NextResponse.json({ error: "Record not found" }, { status: 404 });
      resumeIdToTouch = existing[0].resumeId;

      [updatedRecord] = await db.update(education)
        .set({
          institution: body.institution !== undefined ? body.institution : existing[0].institution,
          degree: body.degree !== undefined ? body.degree : existing[0].degree,
          major: body.major !== undefined ? body.major : existing[0].major,
          minor: body.minor !== undefined ? body.minor : existing[0].minor,
          location: body.location !== undefined ? body.location : existing[0].location,
          startDate: body.startDate !== undefined ? body.startDate : existing[0].startDate,
          endDate: body.endDate !== undefined ? body.endDate : existing[0].endDate,
          gpa: body.gpa !== undefined ? body.gpa : existing[0].gpa,
          honors: body.honors !== undefined ? body.honors : existing[0].honors,
          coursework: body.coursework !== undefined ? body.coursework : existing[0].coursework,
          sortOrder: body.sortOrder !== undefined ? body.sortOrder : existing[0].sortOrder,
        })
        .where(eq(education.id, sectionId))
        .returning();
    } else if (type === "work") {
      const existing = await db.select().from(workExperiences).where(eq(workExperiences.id, sectionId)).limit(1);
      if (existing.length === 0) return NextResponse.json({ error: "Record not found" }, { status: 404 });
      resumeIdToTouch = existing[0].resumeId;

      const bulletsVal = typeof body.bullets === "object" ? JSON.stringify(body.bullets) : (body.bullets || existing[0].bullets);

      [updatedRecord] = await db.update(workExperiences)
        .set({
          company: body.company !== undefined ? body.company : existing[0].company,
          role: body.role !== undefined ? body.role : existing[0].role,
          location: body.location !== undefined ? body.location : existing[0].location,
          startDate: body.startDate !== undefined ? body.startDate : existing[0].startDate,
          endDate: body.endDate !== undefined ? body.endDate : existing[0].endDate,
          isCurrent: body.isCurrent !== undefined ? Boolean(body.isCurrent) : existing[0].isCurrent,
          bullets: bulletsVal,
          sortOrder: body.sortOrder !== undefined ? body.sortOrder : existing[0].sortOrder,
        })
        .where(eq(workExperiences.id, sectionId))
        .returning();
    } else if (type === "projects") {
      const existing = await db.select().from(projects).where(eq(projects.id, sectionId)).limit(1);
      if (existing.length === 0) return NextResponse.json({ error: "Record not found" }, { status: 404 });
      resumeIdToTouch = existing[0].resumeId;

      const bulletsVal = typeof body.bullets === "object" ? JSON.stringify(body.bullets) : (body.bullets || existing[0].bullets);

      [updatedRecord] = await db.update(projects)
        .set({
          title: body.title !== undefined ? body.title : existing[0].title,
          roleOrTechnologies: body.roleOrTechnologies !== undefined ? body.roleOrTechnologies : existing[0].roleOrTechnologies,
          link: body.link !== undefined ? body.link : existing[0].link,
          date: body.date !== undefined ? body.date : existing[0].date,
          bullets: bulletsVal,
          sortOrder: body.sortOrder !== undefined ? body.sortOrder : existing[0].sortOrder,
        })
        .where(eq(projects.id, sectionId))
        .returning();
    } else if (type === "extracurriculars") {
      const existing = await db.select().from(extracurriculars).where(eq(extracurriculars.id, sectionId)).limit(1);
      if (existing.length === 0) return NextResponse.json({ error: "Record not found" }, { status: 404 });
      resumeIdToTouch = existing[0].resumeId;

      const bulletsVal = typeof body.bullets === "object" ? JSON.stringify(body.bullets) : (body.bullets || existing[0].bullets);

      [updatedRecord] = await db.update(extracurriculars)
        .set({
          organization: body.organization !== undefined ? body.organization : existing[0].organization,
          role: body.role !== undefined ? body.role : existing[0].role,
          date: body.date !== undefined ? body.date : existing[0].date,
          bullets: bulletsVal,
          sortOrder: body.sortOrder !== undefined ? body.sortOrder : existing[0].sortOrder,
        })
        .where(eq(extracurriculars.id, sectionId))
        .returning();
    } else if (type === "skills") {
      const existing = await db.select().from(skills).where(eq(skills.id, sectionId)).limit(1);
      if (existing.length === 0) return NextResponse.json({ error: "Record not found" }, { status: 404 });
      resumeIdToTouch = existing[0].resumeId;

      [updatedRecord] = await db.update(skills)
        .set({
          category: body.category !== undefined ? body.category : existing[0].category,
          skillsList: body.skillsList !== undefined ? body.skillsList : existing[0].skillsList,
          sortOrder: body.sortOrder !== undefined ? body.sortOrder : existing[0].sortOrder,
        })
        .where(eq(skills.id, sectionId))
        .returning();
    } else if (type === "certifications") {
      const existing = await db.select().from(certifications).where(eq(certifications.id, sectionId)).limit(1);
      if (existing.length === 0) return NextResponse.json({ error: "Record not found" }, { status: 404 });
      resumeIdToTouch = existing[0].resumeId;

      [updatedRecord] = await db.update(certifications)
        .set({
          name: body.name !== undefined ? body.name : existing[0].name,
          issuer: body.issuer !== undefined ? body.issuer : existing[0].issuer,
          issueDate: body.issueDate !== undefined ? body.issueDate : existing[0].issueDate,
          credentialUrl: body.credentialUrl !== undefined ? body.credentialUrl : existing[0].credentialUrl,
          sortOrder: body.sortOrder !== undefined ? body.sortOrder : existing[0].sortOrder,
        })
        .where(eq(certifications.id, sectionId))
        .returning();
    } else {
      return NextResponse.json({ error: "Invalid section type" }, { status: 400 });
    }

    if (resumeIdToTouch) {
      await db.update(resumes).set({ updatedAt: new Date() }).where(eq(resumes.id, resumeIdToTouch));
    }

    return NextResponse.json({ success: true, record: updatedRecord });
  } catch (error) {
    console.error("Update section error:", error);
    return NextResponse.json({ error: "Failed to update section" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ type: string; sectionId: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, sectionId } = await params;

    if (type === "education") {
      await db.delete(education).where(eq(education.id, sectionId));
    } else if (type === "work") {
      await db.delete(workExperiences).where(eq(workExperiences.id, sectionId));
    } else if (type === "projects") {
      await db.delete(projects).where(eq(projects.id, sectionId));
    } else if (type === "extracurriculars") {
      await db.delete(extracurriculars).where(eq(extracurriculars.id, sectionId));
    } else if (type === "skills") {
      await db.delete(skills).where(eq(skills.id, sectionId));
    } else if (type === "certifications") {
      await db.delete(certifications).where(eq(certifications.id, sectionId));
    } else {
      return NextResponse.json({ error: "Invalid section type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete section error:", error);
    return NextResponse.json({ error: "Failed to delete section" }, { status: 500 });
  }
}
