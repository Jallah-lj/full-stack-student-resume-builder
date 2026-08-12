import { NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSession, sessionCookieOptions, SESSION_COOKIE, toPublicUser } from "@/lib/auth";
import { route, ok, fail, logActivity } from "@/lib/api";
import { verifyPassword, isLegacyHash, hashPassword } from "@/lib/password";
import { seedDatabase } from "@/db/seed";

export const dynamic = "force-dynamic";

export const POST = route(async (req: NextRequest) => {
  await seedDatabase();

  const { email, password } = await req.json();

  if (!email || !password) {
    return fail("Email and password are required.", 400);
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const found = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
  const user = found[0];

  // Same message for unknown email and wrong password so the endpoint
  // can't be used to enumerate which students have accounts.
  const invalid = () => fail("Invalid email or password.", 401);
  if (!user) return invalid();

  const valid = await verifyPassword(String(password), user.passwordHash);
  if (!valid) return invalid();

  // Transparently upgrade legacy plaintext credentials to scrypt on login.
  if (isLegacyHash(user.passwordHash)) {
    await db
      .update(users)
      .set({ passwordHash: await hashPassword(String(password)) })
      .where(eq(users.id, user.id));
  }

  const { token } = await createSession(user.id, req.headers.get("user-agent"));

  await logActivity({
    userId: user.id,
    type: "auth",
    action: "Signed in",
    target: user.email,
    status: "success",
  });

  const res = ok({ success: true, user: toPublicUser(user) });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
});
