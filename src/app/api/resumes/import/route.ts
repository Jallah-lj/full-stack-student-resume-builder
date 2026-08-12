import { NextRequest } from "next/server";
import { db } from "@/db";
import { resumes } from "@/db/schema";
import { route, ok, fail, requireUser, logActivity, newId, slugify } from "@/lib/api";
import { SECTION_TABLES, type SectionType, pickSectionFields, serializeBullets } from "@/lib/sections";

export const dynamic = "force-dynamic";

const IMPORTABLE: SectionType[] = ["education", "work", "projects", "extracurriculars", "skills", "certifications"];

/** Backups store work rows under `workExperiences`, keyed by section config. */
const BUNDLE_KEY: Record<SectionType, string> = {
  education: "education",
  work: "workExperiences",
  projects: "projects",
  extracurriculars: "extracurriculars",
  skills: "skills",
  certifications: "certifications",
};

/** POST /api/resumes/import — restore a resume from an exported JSON backup. */
export const POST = route(async (req: NextRequest) => {
  const user = await requireUser();

  let backup: Record<string, unknown>;
  try {
    backup = await req.json();
  } catch {
    return fail("That file isn't valid JSON.", 400);
  }

  const source = (backup?.resume ?? {}) as Record<string, unknown>;
  if (!source || typeof source !== "object" || !source.title) {
    return fail(
      "This doesn't look like a ResuMate backup. Expected a JSON file with a `resume` object — export one from My Resumes to see the format.",
      400
    );
  }

  const title = `${String(source.title)} (Imported)`;
  const newResumeId = newId("res");

  const [newResume] = await db
    .insert(resumes)
    .values({
      id: newResumeId,
      userId: user.id,
      title,
      targetRole: (source.targetRole as string) || user.headline || "Applicant",
      template: (source.template as string) || "modern_tech",
      colorTheme: (source.colorTheme as string) || "navy",
      fontSize: (source.fontSize as string) || "md",
      fontFamily: (source.fontFamily as string) || "inter",
      showGpa: source.showGpa !== false,
      showCoursework: source.showCoursework !== false,
      showProjectsFirst: Boolean(source.showProjectsFirst),
      shareSlug: slugify(title),
      // Imported resumes start private — the user opts in to sharing.
      isPublic: false,
      atsScore: Number(source.atsScore) || 85,
    })
    .returning();

  // Import every section type, not just the four the old route handled.
  let imported = 0;
  for (const type of IMPORTABLE) {
    const rows = backup[BUNDLE_KEY[type]];
    if (!Array.isArray(rows) || rows.length === 0) continue;

    const config = SECTION_TABLES[type];
    const values = rows.map((row: Record<string, unknown>) => {
      const picked = pickSectionFields(type, { ...config.defaults, ...row });
      for (const field of config.bulletFields as readonly string[]) {
        if (picked[field] === undefined) picked[field] = serializeBullets([]);
      }
      if (picked.sortOrder === undefined) picked.sortOrder = 1;
      return { id: newId(config.idPrefix), resumeId: newResumeId, userId: user.id, ...picked };
    });

    await db.insert(config.table).values(values as any);
    imported += values.length;
  }

  await logActivity({
    userId: user.id,
    resumeId: newResumeId,
    type: "resume",
    action: "Resume imported",
    target: newResume.title,
    result: `${imported} entries restored`,
    status: "success",
  });

  return ok({ success: true, resume: newResume, importedEntries: imported }, 201);
});
