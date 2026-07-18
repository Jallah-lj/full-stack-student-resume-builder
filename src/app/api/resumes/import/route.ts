import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { resumes, education, workExperiences, projects, extracurriculars, skills, certifications } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const backupData = await req.json();
    const sourceResume = backupData.resume || {};

    const newResumeId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const shareSlug = `${(sourceResume.title || "imported-resume").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.random().toString(36).substring(2, 6)}`;

    const [newResume] = await db.insert(resumes).values({
      id: newResumeId,
      userId: user.id,
      title: `${sourceResume.title || "Imported Resume"} (Imported)`,
      targetRole: sourceResume.targetRole || user.headline || "Applicant",
      template: sourceResume.template || "modern_tech",
      colorTheme: sourceResume.colorTheme || "navy",
      fontSize: sourceResume.fontSize || "md",
      fontFamily: sourceResume.fontFamily || "inter",
      showGpa: Boolean(sourceResume.showGpa),
      showCoursework: Boolean(sourceResume.showCoursework),
      showProjectsFirst: Boolean(sourceResume.showProjectsFirst),
      shareSlug,
      isPublic: true,
      atsScore: sourceResume.atsScore || 85,
    }).returning();

    // Import Education
    if (Array.isArray(backupData.education)) {
      for (const edu of backupData.education) {
        await db.insert(education).values({
          id: `edu_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          resumeId: newResumeId,
          userId: user.id,
          institution: edu.institution || "Institution",
          degree: edu.degree || "Degree",
          major: edu.major || "Major",
          minor: edu.minor || "",
          location: edu.location || "",
          startDate: edu.startDate || "",
          endDate: edu.endDate || "",
          gpa: edu.gpa || "",
          honors: edu.honors || "",
          coursework: edu.coursework || "",
          sortOrder: edu.sortOrder || 1,
        });
      }
    }

    // Import Work Experience
    if (Array.isArray(backupData.workExperiences)) {
      for (const w of backupData.workExperiences) {
        await db.insert(workExperiences).values({
          id: `work_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          resumeId: newResumeId,
          userId: user.id,
          company: w.company || "Company",
          role: w.role || "Role",
          location: w.location || "",
          startDate: w.startDate || "",
          endDate: w.endDate || "",
          isCurrent: Boolean(w.isCurrent),
          bullets: typeof w.bullets === "object" ? JSON.stringify(w.bullets) : (w.bullets || "[]"),
          sortOrder: w.sortOrder || 1,
        });
      }
    }

    // Import Projects
    if (Array.isArray(backupData.projects)) {
      for (const p of backupData.projects) {
        await db.insert(projects).values({
          id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          resumeId: newResumeId,
          userId: user.id,
          title: p.title || "Project",
          roleOrTechnologies: p.roleOrTechnologies || "",
          link: p.link || "",
          date: p.date || "",
          bullets: typeof p.bullets === "object" ? JSON.stringify(p.bullets) : (p.bullets || "[]"),
          sortOrder: p.sortOrder || 1,
        });
      }
    }

    // Import Skills
    if (Array.isArray(backupData.skills)) {
      for (const s of backupData.skills) {
        await db.insert(skills).values({
          id: `skill_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          resumeId: newResumeId,
          userId: user.id,
          category: s.category || "Skill Category",
          skillsList: s.skillsList || "",
          sortOrder: s.sortOrder || 1,
        });
      }
    }

    return NextResponse.json({ success: true, resume: newResume });
  } catch (error) {
    console.error("Import resume error:", error);
    return NextResponse.json({ error: "Failed to import resume backup" }, { status: 500 });
  }
}
