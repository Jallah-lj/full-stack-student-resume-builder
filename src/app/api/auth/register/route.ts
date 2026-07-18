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
    const { name, email, headline, phone, location, linkedinUrl, githubUrl, websiteUrl, bio, password } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and Email are required." }, { status: 400 });
    }

    if (password && password.trim().length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 400 });
    }

    const newUserId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const [newUser] = await db.insert(users).values({
      id: newUserId,
      name: name.trim(),
      email: cleanEmail,
      passwordHash: password?.trim() || "demo_password",
      headline: headline || "Student",
      phone: phone || "",
      location: location || "",
      linkedinUrl: linkedinUrl || "",
      githubUrl: githubUrl || "",
      websiteUrl: websiteUrl || "",
      bio: bio || "",
      profilePictureUrl: "",
      university: "",
      department: "",
      graduationYear: "",
      preferredJobRole: "",
      themePreference: "light",
      emailNotifications: true,
      applicationAlerts: true,
      weeklyDigest: false,
    }).returning();

    const response = NextResponse.json({ success: true, user: newUser });
    response.cookies.set("resumate_user_id", newUser.id, {
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
    return response;
  } catch (err: any) {
    console.error("Register error:", err?.message);
    return NextResponse.json({ error: err?.message || "Failed to create account" }, { status: 500 });
  }
}
