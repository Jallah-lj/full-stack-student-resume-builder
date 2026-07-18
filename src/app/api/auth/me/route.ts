import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { seedDatabase } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "DATABASE_URL is not configured. Copy .env.example to .env and set your database connection string, then restart the server." },
        { status: 503 }
      );
    }

    // Auto-seed on empty DB
    const count = await db.select().from(users).limit(1);
    if (count.length === 0) {
      await seedDatabase();
    }

    const { getSessionUser } = await import("@/lib/auth");
    const currentUser = await getSessionUser();

    const allUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      headline: users.headline,
      profilePictureUrl: users.profilePictureUrl,
      university: users.university,
    }).from(users);

    return NextResponse.json({ user: currentUser, availableUsers: allUsers });
  } catch (err: any) {
    console.error("Auth /me error:", err?.message);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch session user" },
      { status: 500 }
    );
  }
}
