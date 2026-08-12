import { NextRequest } from "next/server";
import { db } from "@/db";
import { resumeViews, resumes } from "@/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";
import { route, ok, requireUser, requireOwnedResume } from "@/lib/api";

export const dynamic = "force-dynamic";

const PERIOD_DAYS: Record<string, number | null> = { "7d": 7, "30d": 30, all: null };

/**
 * GET /api/analytics?resumeId=...&period=30d
 * Real view analytics aggregated from the resume_views table.
 */
export const GET = route(async (req: NextRequest) => {
  const user = await requireUser();
  const { searchParams } = new URL(req.url);
  const resumeId = searchParams.get("resumeId");
  const period = searchParams.get("period") || "30d";

  if (!resumeId) {
    // Account-wide totals across every resume the student owns.
    const rows = await db
      .select({
        resumeId: resumeViews.resumeId,
        views: sql<number>`count(*)::int`,
        unique: sql<number>`count(distinct ${resumeViews.visitorHash})::int`,
      })
      .from(resumeViews)
      .innerJoin(resumes, eq(resumes.id, resumeViews.resumeId))
      .where(eq(resumes.userId, user.id))
      .groupBy(resumeViews.resumeId);

    return ok({
      totals: {
        views: rows.reduce((s, r) => s + r.views, 0),
        unique: rows.reduce((s, r) => s + r.unique, 0),
      },
      perResume: rows,
    });
  }

  await requireOwnedResume(resumeId, user.id);

  const days = PERIOD_DAYS[period] ?? 30;
  const since = days ? new Date(Date.now() - days * 86400_000) : null;
  const scope = since
    ? and(eq(resumeViews.resumeId, resumeId), gte(resumeViews.viewedAt, since))
    : eq(resumeViews.resumeId, resumeId);

  const [totals, byDevice, byReferrer, byCountry, timeline] = await Promise.all([
    db
      .select({
        views: sql<number>`count(*)::int`,
        unique: sql<number>`count(distinct ${resumeViews.visitorHash})::int`,
        lastViewedAt: sql<string | null>`max(${resumeViews.viewedAt})`,
      })
      .from(resumeViews)
      .where(scope),
    db
      .select({ device: resumeViews.device, count: sql<number>`count(*)::int` })
      .from(resumeViews)
      .where(scope)
      .groupBy(resumeViews.device),
    db
      .select({ referrer: resumeViews.referrer, count: sql<number>`count(*)::int` })
      .from(resumeViews)
      .where(scope)
      .groupBy(resumeViews.referrer)
      .orderBy(sql`count(*) desc`)
      .limit(6),
    db
      .select({ country: resumeViews.country, count: sql<number>`count(*)::int` })
      .from(resumeViews)
      .where(scope)
      .groupBy(resumeViews.country)
      .orderBy(sql`count(*) desc`)
      .limit(5),
    db
      .select({
        day: sql<string>`to_char(${resumeViews.viewedAt}, 'YYYY-MM-DD')`,
        count: sql<number>`count(*)::int`,
      })
      .from(resumeViews)
      .where(scope)
      .groupBy(sql`to_char(${resumeViews.viewedAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${resumeViews.viewedAt}, 'YYYY-MM-DD')`),
  ]);

  // Fill missing days so the chart has a continuous axis.
  const span = days ?? 30;
  const map = new Map(timeline.map((t) => [t.day, t.count]));
  const series = Array.from({ length: span }, (_, i) => {
    const d = new Date(Date.now() - (span - 1 - i) * 86400_000);
    const key = d.toISOString().slice(0, 10);
    return { day: key, count: map.get(key) ?? 0 };
  });

  return ok({
    period,
    totals: totals[0] ?? { views: 0, unique: 0, lastViewedAt: null },
    devices: byDevice,
    referrers: byReferrer,
    countries: byCountry.filter((c) => c.country),
    series,
  });
});
