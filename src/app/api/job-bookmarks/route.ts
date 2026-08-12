import { NextRequest } from "next/server";
import { db } from "@/db";
import { jobBookmarks } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { route, ok, fail, requireUser } from "@/lib/api";

export const dynamic = "force-dynamic";

/** GET /api/job-bookmarks — saved job ids for the signed-in student. */
export const GET = route(async () => {
  const user = await requireUser();

  const rows = await db
    .select({ jobId: jobBookmarks.jobId })
    .from(jobBookmarks)
    .where(eq(jobBookmarks.userId, user.id))
    .orderBy(desc(jobBookmarks.createdAt));

  return ok({ bookmarks: rows.map((r) => r.jobId) });
});

/** POST /api/job-bookmarks — toggle a saved job. Body: { jobId, saved }. */
export const POST = route(async (req: NextRequest) => {
  const user = await requireUser();
  const { jobId, saved } = await req.json();

  if (!jobId) return fail("Job id is required.", 400);

  if (saved) {
    await db
      .insert(jobBookmarks)
      .values({ userId: user.id, jobId: String(jobId) })
      .onConflictDoNothing();
  } else {
    await db
      .delete(jobBookmarks)
      .where(and(eq(jobBookmarks.userId, user.id), eq(jobBookmarks.jobId, String(jobId))));
  }

  const rows = await db
    .select({ jobId: jobBookmarks.jobId })
    .from(jobBookmarks)
    .where(eq(jobBookmarks.userId, user.id));

  return ok({ success: true, bookmarks: rows.map((r) => r.jobId) });
});
