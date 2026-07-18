import { NextResponse } from "next/server";
import { db } from "@/db";
import { resumes, jobApplications, education } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 503 });
    }
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [userResumes, userApps] = await Promise.all([
      db.select().from(resumes).where(eq(resumes.userId, user.id)).orderBy(desc(resumes.updatedAt)),
      db.select().from(jobApplications).where(eq(jobApplications.userId, user.id)).orderBy(desc(jobApplications.createdAt)),
    ]);

    const avgAts = userResumes.length > 0
      ? Math.round(userResumes.reduce((s, r) => s + (r.atsScore || 0), 0) / userResumes.length)
      : 0;

    const statusCounts = userApps.reduce((acc: Record<string, number>, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      totalResumes: userResumes.length,
      avgAtsScore: avgAts,
      totalApplications: userApps.length,
      interviewing: statusCounts["interviewing"] || 0,
      offers: statusCounts["offer"] || 0,
      applied: statusCounts["applied"] || 0,
      recentResumes: userResumes.slice(0, 3),
      recentApps: userApps.slice(0, 5),
    });
  } catch (err: any) {
    console.error("Dashboard stats error:", err?.message);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
