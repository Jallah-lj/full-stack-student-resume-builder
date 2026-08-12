import { NextRequest } from "next/server";
import { db } from "@/db";
import { activityLog } from "@/db/schema";
import { and, eq, desc, sql } from "drizzle-orm";
import { route, ok, requireUser } from "@/lib/api";

export const dynamic = "force-dynamic";

/** GET /api/activity?type=ats&limit=50 — the signed-in user's audit trail. */
export const GET = route(async (req: NextRequest) => {
  const user = await requireUser();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const limit = Math.min(Number(searchParams.get("limit")) || 100, 200);

  const scope = type && type !== "all"
    ? and(eq(activityLog.userId, user.id), eq(activityLog.type, type))
    : eq(activityLog.userId, user.id);

  const [events, counts] = await Promise.all([
    db.select().from(activityLog).where(scope).orderBy(desc(activityLog.createdAt)).limit(limit),
    db
      .select({ type: activityLog.type, count: sql<number>`count(*)::int` })
      .from(activityLog)
      .where(eq(activityLog.userId, user.id))
      .groupBy(activityLog.type),
  ]);

  return ok({
    events,
    counts: Object.fromEntries(counts.map((c) => [c.type, c.count])),
    total: counts.reduce((s, c) => s + c.count, 0),
  });
});
