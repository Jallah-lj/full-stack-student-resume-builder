import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "DATABASE_URL is not configured." }, { status: 503 });
    }

    const body = await req.json();
    const { userId, email, password } = body;

    let targetUser = null;

    if (userId) {
      const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      targetUser = result[0] || null;
    } else if (email) {
      const result = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase())).limit(1);
      targetUser = result[0] || null;

      // Verify password only when explicitly provided (skip for demo switcher)
      if (targetUser && password && password !== "demo_password") {
        if (targetUser.passwordHash !== password) {
          return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }
      }
    }

    if (!targetUser) {
      return NextResponse.json({ error: "No account found with that email. Please sign up first." }, { status: 404 });
    }

    const response = NextResponse.json({ success: true, user: targetUser });
    response.cookies.set("resumate_user_id", targetUser.id, {
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
    return response;
  } catch (err: any) {
    console.error("Login error:", err?.message);
    return NextResponse.json({ error: err?.message || "Login failed" }, { status: 500 });
  }
}
