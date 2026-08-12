import { NextRequest } from "next/server";
import { db } from "@/db";
import { resumes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { route, ok, fail, requireUser, requireOwnedResume, newId } from "@/lib/api";
import { SECTION_TABLES, isSectionType, pickSectionFields, serializeBullets } from "@/lib/sections";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** POST /api/resumes/:id/sections — add an entry to any resume section. */
export const POST = route(async (req: NextRequest, { params }: Ctx) => {
  const user = await requireUser();
  const { id: resumeId } = await params;
  await requireOwnedResume(resumeId, user.id);

  const { sectionType, data = {} } = await req.json();

  if (!sectionType || !isSectionType(sectionType)) {
    return fail(
      `Unknown section type. Expected one of: ${Object.keys(SECTION_TABLES).join(", ")}.`,
      400
    );
  }

  const config = SECTION_TABLES[sectionType];

  // Merge caller values over the section defaults, then whitelist.
  const merged: Record<string, unknown> = { ...config.defaults, ...data };
  const values = pickSectionFields(sectionType, merged);

  // Guarantee NOT NULL bullet columns are always present on insert.
  for (const field of config.bulletFields as readonly string[]) {
    if (values[field] === undefined) values[field] = serializeBullets([]);
  }
  if (values.sortOrder === undefined) values.sortOrder = 10;

  const [record] = await db
    .insert(config.table)
    .values({ id: newId(config.idPrefix), resumeId, userId: user.id, ...values } as any)
    .returning();

  await db.update(resumes).set({ updatedAt: new Date() }).where(eq(resumes.id, resumeId));

  return ok({ success: true, sectionType, record }, 201);
});
