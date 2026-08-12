import { NextRequest } from "next/server";
import { db } from "@/db";
import { resumes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { route, ok, fail, requireUser, requireOwnedResume } from "@/lib/api";
import { SECTION_TABLES, isSectionType, pickSectionFields, type SectionType } from "@/lib/sections";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ type: string; sectionId: string }> };

/**
 * Fetch a section row and verify the signed-in user owns its parent resume.
 * Without this check any user could edit another student's resume by id.
 */
async function loadOwnedSection(type: SectionType, sectionId: string, userId: string) {
  const config = SECTION_TABLES[type];
  const rows = await db.select().from(config.table).where(eq(config.table.id, sectionId)).limit(1);
  const existing = rows[0];
  if (!existing) return null;

  await requireOwnedResume(existing.resumeId, userId);
  return existing;
}

/** PUT /api/sections/:type/:sectionId */
export const PUT = route(async (req: NextRequest, { params }: Ctx) => {
  const user = await requireUser();
  const { type, sectionId } = await params;

  if (!isSectionType(type)) return fail("Unknown section type.", 400);

  const existing = await loadOwnedSection(type, sectionId, user.id);
  if (!existing) return fail(`${SECTION_TABLES[type].label} entry not found.`, 404);

  const body = await req.json();
  const updates = pickSectionFields(type, body);

  if (Object.keys(updates).length === 0) {
    return fail("No editable fields were provided.", 400);
  }

  const config = SECTION_TABLES[type];
  const [record] = await db
    .update(config.table)
    .set(updates as any)
    .where(eq(config.table.id, sectionId))
    .returning();

  await db.update(resumes).set({ updatedAt: new Date() }).where(eq(resumes.id, existing.resumeId));

  return ok({ success: true, record });
});

/** DELETE /api/sections/:type/:sectionId */
export const DELETE = route(async (_req: NextRequest, { params }: Ctx) => {
  const user = await requireUser();
  const { type, sectionId } = await params;

  if (!isSectionType(type)) return fail("Unknown section type.", 400);

  const existing = await loadOwnedSection(type, sectionId, user.id);
  if (!existing) return fail(`${SECTION_TABLES[type].label} entry not found.`, 404);

  const config = SECTION_TABLES[type];
  await db.delete(config.table).where(eq(config.table.id, sectionId));
  await db.update(resumes).set({ updatedAt: new Date() }).where(eq(resumes.id, existing.resumeId));

  return ok({ success: true });
});
