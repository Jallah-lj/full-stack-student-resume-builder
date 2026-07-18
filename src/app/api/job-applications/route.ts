import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { jobApplications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apps = await db.select().from(jobApplications).where(eq(jobApplications.userId, user.id)).orderBy(desc(jobApplications.createdAt));
    return NextResponse.json({ jobApplications: apps });
  } catch (error) {
    console.error("Fetch job applications error:", error);
    return NextResponse.json({ error: "Failed to fetch job applications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { resumeId, companyName, jobTitle, jobDescription, matchScore, missingKeywords, matchedKeywords, status } = body;

    const newAppId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const [newApp] = await db.insert(jobApplications).values({
      id: newAppId,
      userId: user.id,
      resumeId: resumeId || "",
      companyName: companyName || "Target Company",
      jobTitle: jobTitle || "Target Role",
      jobDescription: jobDescription || "",
      matchScore: matchScore || 75,
      missingKeywords: typeof missingKeywords === "object" ? JSON.stringify(missingKeywords) : (missingKeywords || "[]"),
      matchedKeywords: typeof matchedKeywords === "object" ? JSON.stringify(matchedKeywords) : (matchedKeywords || "[]"),
      status: status || "applied",
    }).returning();

    return NextResponse.json({ success: true, application: newApp });
  } catch (error) {
    console.error("Create job application error:", error);
    return NextResponse.json({ error: "Failed to save job application match" }, { status: 500 });
  }
}
