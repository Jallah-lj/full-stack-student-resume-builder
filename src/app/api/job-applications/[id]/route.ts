import { NextRequest } from "next/server";
import { db } from "@/db";
import { jobApplications } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { route, ok, fail, requireUser, logActivity } from "@/lib/api";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const STATUSES = ["draft", "applied", "interviewing", "offer", "rejected"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_LABEL: Record<Status, string> = {
  draft: "Draft",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer received",
  rejected: "Rejected",
};

/** Scope every lookup by userId so one student can't touch another's tracker. */
async function loadOwnedApplication(id: string, userId: string) {
  const rows = await db
    .select()
    .from(jobApplications)
    .where(and(eq(jobApplications.id, id), eq(jobApplications.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

/** PUT /api/job-applications/:id — update status or score. */
export const PUT = route(async (req: NextRequest, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;

  const existing = await loadOwnedApplication(id, user.id);
  if (!existing) return fail("Application not found.", 404);

  const { status, matchScore } = await req.json();

  if (status !== undefined && !STATUSES.includes(status)) {
    return fail(`Status must be one of: ${STATUSES.join(", ")}.`, 400);
  }

  const [application] = await db
    .update(jobApplications)
    .set({
      ...(status !== undefined && { status }),
      ...(matchScore !== undefined && { matchScore: Number(matchScore) }),
    })
    .where(eq(jobApplications.id, id))
    .returning();

  if (status !== undefined && status !== existing.status) {
    await logActivity({
      userId: user.id,
      resumeId: existing.resumeId,
      type: "application",
      action: `Status → ${STATUS_LABEL[status as Status]}`,
      target: `${existing.jobTitle} · ${existing.companyName}`,
      status: status === "offer" ? "success" : status === "rejected" ? "warning" : "info",
    });
  }

  return ok({ success: true, application });
});

/** DELETE /api/job-applications/:id */
export const DELETE = route(async (_req: NextRequest, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;

  const existing = await loadOwnedApplication(id, user.id);
  if (!existing) return fail("Application not found.", 404);

  await db.delete(jobApplications).where(eq(jobApplications.id, id));

  await logActivity({
    userId: user.id,
    type: "application",
    action: "Application removed",
    target: `${existing.jobTitle} · ${existing.companyName}`,
    status: "warning",
  });

  return ok({ success: true });
});
