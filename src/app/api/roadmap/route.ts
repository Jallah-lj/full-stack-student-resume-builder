import { NextRequest } from "next/server";
import { db } from "@/db";
import { roadmapProgress } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { route, ok, fail, requireUser, logActivity } from "@/lib/api";

export const dynamic = "force-dynamic";

/** GET /api/roadmap — completed milestone ids for the signed-in student. */
export const GET = route(async () => {
  const user = await requireUser();

  const rows = await db
    .select({ itemId: roadmapProgress.itemId, completedAt: roadmapProgress.completedAt })
    .from(roadmapProgress)
    .where(eq(roadmapProgress.userId, user.id));

  return ok({ completed: rows.map((r) => r.itemId), items: rows });
});

/** POST /api/roadmap — toggle a milestone. Body: { itemId, completed }. */
export const POST = route(async (req: NextRequest) => {
  const user = await requireUser();
  const { itemId, completed, label } = await req.json();

  if (!itemId) return fail("Milestone id is required.", 400);

  if (completed) {
    await db
      .insert(roadmapProgress)
      .values({ userId: user.id, itemId: String(itemId) })
      .onConflictDoNothing();

    await logActivity({
      userId: user.id,
      type: "edit",
      action: "Milestone completed",
      target: label || String(itemId),
      status: "success",
    });
  } else {
    await db
      .delete(roadmapProgress)
      .where(and(eq(roadmapProgress.userId, user.id), eq(roadmapProgress.itemId, String(itemId))));
  }

  const rows = await db
    .select({ itemId: roadmapProgress.itemId })
    .from(roadmapProgress)
    .where(eq(roadmapProgress.userId, user.id));

  return ok({ success: true, completed: rows.map((r) => r.itemId) });
});
