import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { jobApplications } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { status, matchScore } = body;

    const [updated] = await db.update(jobApplications)
      .set({
        ...(status !== undefined && { status }),
        ...(matchScore !== undefined && { matchScore }),
      })
      .where(eq(jobApplications.id, id))
      .returning();

    return NextResponse.json({ success: true, application: updated });
  } catch (error) {
    console.error("Update job application error:", error);
    return NextResponse.json({ error: "Failed to update job application" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await db.delete(jobApplications).where(eq(jobApplications.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete job application error:", error);
    return NextResponse.json({ error: "Failed to delete job application" }, { status: 500 });
  }
}
