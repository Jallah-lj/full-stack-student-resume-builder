import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq, lt } from "drizzle-orm";

export const SESSION_COOKIE = "resumate_session";
const SESSION_DAYS = 30;

export type SessionUser = typeof users.$inferSelect;

/** A user object safe to send to the browser — never includes the password hash. */
export type PublicUser = Omit<SessionUser, "passwordHash">;

export function toPublicUser<T extends { passwordHash?: string }>(user: T): Omit<T, "passwordHash"> {
  if (!user) return user;
  const { passwordHash: _omit, ...rest } = user;
  void _omit;
  return rest;
}

/**
 * Resolve the signed-in user from the session cookie.
 *
 * Returns null when there is no valid session. There is deliberately NO
 * fallback to a default demo user — that made sign-out a no-op and let any
 * anonymous visitor read a real account.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const rows = await db
    .select({ user: users, expiresAt: sessions.expiresAt })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(eq(sessions.token, token))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  if (row.expiresAt.getTime() < Date.now()) {
    await db.delete(sessions).where(eq(sessions.token, token));
    return null;
  }

  return row.user;
}

/** Create a session row and return the opaque token to set as a cookie. */
export async function createSession(userId: string, userAgent?: string | null) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(sessions).values({
    token,
    userId,
    userAgent: userAgent?.slice(0, 255) || null,
    expiresAt,
  });

  // Opportunistic cleanup of expired sessions.
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));

  return { token, expiresAt };
}

export async function destroySession(token: string | undefined) {
  if (!token) return;
  await db.delete(sessions).where(eq(sessions.token, token));
}

export const sessionCookieOptions = {
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: SESSION_DAYS * 24 * 60 * 60,
};
