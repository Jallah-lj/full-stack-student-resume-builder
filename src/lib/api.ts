import { NextResponse } from "next/server";
import { db } from "@/db";
import { resumes, activityLog } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser, type SessionUser } from "@/lib/auth";

/* ────────────────────────────────────────────────────────────
   Uniform JSON envelopes so the client never has to guess.
───────────────────────────────────────────────────────────── */

export function ok<T extends object>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(message: string, status = 400, extra?: object) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export const unauthorized = () => fail("You must be signed in to do that.", 401);
export const forbidden = () => fail("You don't have access to this resource.", 403);
export const notFound = (what = "Resource") => fail(`${what} not found.`, 404);

/** Thrown by guards to unwind straight to a response. */
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/**
 * Wraps a route handler with env validation, error translation and
 * guaranteed JSON output (never an HTML error page).
 */
export function route<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>
) {
  return async (...args: Args): Promise<Response> => {
    if (!process.env.DATABASE_URL) {
      return fail(
        "Server misconfiguration: DATABASE_URL is not set. Copy .env.example to .env, add your PostgreSQL connection string, then restart the server.",
        503
      );
    }
    try {
      return await handler(...args);
    } catch (err: unknown) {
      if (err instanceof HttpError) return fail(err.message, err.status);

      const message = err instanceof Error ? err.message : "Unexpected server error";
      console.error("[API]", message, err);

      if (/relation .* does not exist/i.test(message)) {
        return fail(
          "Database tables are missing. Run `npx drizzle-kit push` to create the schema, then reload.",
          503
        );
      }
      if (/ECONNREFUSED|ENOTFOUND|password authentication/i.test(message)) {
        return fail(
          "Cannot reach the database. Check that PostgreSQL is running and DATABASE_URL is correct.",
          503
        );
      }
      return fail(message || "Unexpected server error", 500);
    }
  };
}

/** Require a signed-in user or abort with 401. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new HttpError(401, "You must be signed in to do that.");
  return user;
}

/**
 * Require that the signed-in user actually owns the resume.
 * This is the check that was missing everywhere — without it any user
 * could read, edit or delete another student's resume by guessing an id.
 */
export async function requireOwnedResume(resumeId: string, userId: string) {
  const rows = await db.select().from(resumes).where(eq(resumes.id, resumeId)).limit(1);
  const resume = rows[0];
  if (!resume) throw new HttpError(404, "Resume not found.");
  if (resume.userId !== userId) throw new HttpError(403, "You don't have access to this resume.");
  return resume;
}

/* ────────────────────────────────────────────────────────────
   Activity log helper — best effort, never breaks the request.
───────────────────────────────────────────────────────────── */

export type ActivityType = "ats" | "ai" | "export" | "edit" | "auth" | "application" | "resume";

export async function logActivity(entry: {
  userId: string;
  type: ActivityType;
  action: string;
  target?: string;
  result?: string;
  status?: "success" | "info" | "warning";
  resumeId?: string | null;
}) {
  try {
    await db.insert(activityLog).values({
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId: entry.userId,
      resumeId: entry.resumeId ?? null,
      type: entry.type,
      action: entry.action,
      target: entry.target ?? "",
      result: entry.result ?? "",
      status: entry.status ?? "info",
    });
  } catch (err) {
    console.error("[activity-log] failed to record event", err);
  }
}

/** Short unique id with a readable prefix. */
export function newId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Build a URL-safe unique share slug. */
export function slugify(title: string) {
  const base = (title || "resume")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "resume";
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}
