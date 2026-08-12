import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { route, requireUser, requireOwnedResume, logActivity } from "@/lib/api";
import { toPublicUser } from "@/lib/auth";
import { loadResumeBundle } from "../route";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/resumes/:id/export — downloadable JSON backup, owner only. */
export const GET = route(async (_req: NextRequest, { params }: Ctx) => {
  const user = await requireUser();
  const { id: resumeId } = await params;

  const resume = await requireOwnedResume(resumeId, user.id);
  const ownerRows = await db.select().from(users).where(eq(users.id, resume.userId)).limit(1);
  const sections = await loadResumeBundle(resumeId);

  const backup = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    resume,
    // Never let a password hash end up inside a downloaded file.
    user: ownerRows[0] ? toPublicUser(ownerRows[0]) : null,
    ...sections,
  };

  await logActivity({
    userId: user.id,
    resumeId,
    type: "export",
    action: "Resume exported",
    target: `${resume.title}.json`,
    result: "JSON backup",
    status: "success",
  });

  const filename = `${resume.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "resume"}-backup.json`;

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
});
