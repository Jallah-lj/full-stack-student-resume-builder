import { NextRequest } from "next/server";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { and, eq, ne } from "drizzle-orm";
import { cookies } from "next/headers";
import { route, ok, fail, requireUser, logActivity } from "@/lib/api";
import { toPublicUser, SESSION_COOKIE } from "@/lib/auth";
import { hashPassword, verifyPassword, validatePassword } from "@/lib/password";

export const dynamic = "force-dynamic";

/** Fields a user may edit about themselves. Email and id are intentionally excluded. */
const TEXT_FIELDS = [
  "name", "headline", "phone", "location", "linkedinUrl", "githubUrl",
  "websiteUrl", "bio", "profilePictureUrl", "university", "department",
  "graduationYear", "preferredJobRole", "themePreference",
] as const;

const BOOL_FIELDS = ["emailNotifications", "applicationAlerts", "weeklyDigest"] as const;

/** GET /api/users/profile — the signed-in student's profile. */
export const GET = route(async () => {
  const user = await requireUser();
  return ok({ user: toPublicUser(user) });
});

/** PUT /api/users/profile — update profile fields and/or change password. */
export const PUT = route(async (req: NextRequest) => {
  const user = await requireUser();
  const body = await req.json();

  const updates: Record<string, unknown> = { updatedAt: new Date() };

  for (const field of TEXT_FIELDS) {
    if (body[field] !== undefined) updates[field] = body[field] === null ? null : String(body[field]);
  }
  for (const field of BOOL_FIELDS) {
    if (body[field] !== undefined) updates[field] = Boolean(body[field]);
  }

  if (updates.name !== undefined && !String(updates.name).trim()) {
    return fail("Your name can't be empty.", 400);
  }

  // ── Password change ────────────────────────────────────────
  const { password, currentPassword } = body;
  let passwordChanged = false;

  if (password) {
    const policyError = validatePassword(String(password));
    if (policyError) return fail(policyError, 400);

    // Require the existing password so a hijacked tab can't silently
    // take over the account.
    const currentValid = await verifyPassword(String(currentPassword || ""), user.passwordHash);
    if (!currentValid) {
      return fail("Your current password is incorrect.", 403);
    }

    updates.passwordHash = await hashPassword(String(password));
    passwordChanged = true;
  }

  const [updated] = await db.update(users).set(updates).where(eq(users.id, user.id)).returning();

  if (passwordChanged) {
    // Revoke every other session so old devices are signed out.
    const cookieStore = await cookies();
    const currentToken = cookieStore.get(SESSION_COOKIE)?.value ?? "";
    await db.delete(sessions).where(and(eq(sessions.userId, user.id), ne(sessions.token, currentToken)));

    await logActivity({
      userId: user.id,
      type: "auth",
      action: "Password changed",
      target: user.email,
      result: "Other sessions signed out",
      status: "success",
    });
  } else {
    await logActivity({
      userId: user.id,
      type: "edit",
      action: "Profile updated",
      target: updated.name,
      status: "info",
    });
  }

  return ok({ success: true, user: toPublicUser(updated) });
});
