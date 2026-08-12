import { NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSession, sessionCookieOptions, SESSION_COOKIE, toPublicUser } from "@/lib/auth";
import { route, ok, fail, logActivity, newId } from "@/lib/api";
import { hashPassword, validatePassword } from "@/lib/password";
import { seedDatabase } from "@/db/seed";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST = route(async (req: NextRequest) => {
  await seedDatabase();

  const body = await req.json();
  const { name, email, password, headline } = body;

  if (!name || !String(name).trim()) return fail("Please enter your full name.", 400);
  if (!email || !EMAIL_RE.test(String(email).trim())) {
    return fail("Please enter a valid email address.", 400);
  }

  const policyError = validatePassword(String(password || ""));
  if (policyError) return fail(policyError, 400);

  const cleanEmail = String(email).trim().toLowerCase();
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, cleanEmail)).limit(1);
  if (existing.length > 0) {
    return fail("An account with this email already exists. Try signing in instead.", 409);
  }

  const [newUser] = await db
    .insert(users)
    .values({
      id: newId("user"),
      name: String(name).trim(),
      email: cleanEmail,
      passwordHash: await hashPassword(String(password)),
      headline: headline?.trim() || "Student",
      phone: "",
      location: "",
      linkedinUrl: "",
      githubUrl: "",
      websiteUrl: "",
      bio: "",
      profilePictureUrl: "",
      university: "",
      department: "",
      graduationYear: "",
      preferredJobRole: "",
      themePreference: "light",
      emailNotifications: true,
      applicationAlerts: true,
      weeklyDigest: false,
    })
    .returning();

  const { token } = await createSession(newUser.id, req.headers.get("user-agent"));

  await logActivity({
    userId: newUser.id,
    type: "auth",
    action: "Account created",
    target: newUser.email,
    status: "success",
  });

  const res = ok({ success: true, user: toPublicUser(newUser) }, 201);
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
});
