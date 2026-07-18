import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { seedDatabase } from "@/db/seed";

export async function getSessionUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("resumate_user_id")?.value;

  if (!userId) {
    // Default to first user (Alex Chen) if no cookie is present
    const defaultUser = await db.select().from(users).where(eq(users.id, "user_alex_chen")).limit(1);
    if (defaultUser.length > 0) {
      return defaultUser[0];
    }
    const anyUser = await db.select().from(users).limit(1);
    return anyUser[0] || null;
  }

  const userMatch = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (userMatch.length > 0) {
    return userMatch[0];
  }

  // Fallback
  const fallback = await db.select().from(users).where(eq(users.id, "user_alex_chen")).limit(1);
  return fallback[0] || null;
}
