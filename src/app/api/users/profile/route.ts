import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, headline, phone, location, linkedinUrl, githubUrl, websiteUrl, bio, profilePictureUrl, university, department, graduationYear, preferredJobRole, themePreference, emailNotifications, applicationAlerts, weeklyDigest, password } = body;

    const updateData: any = {
      name: name !== undefined ? name : currentUser.name,
      headline: headline !== undefined ? headline : currentUser.headline,
      phone: phone !== undefined ? phone : currentUser.phone,
      location: location !== undefined ? location : currentUser.location,
      linkedinUrl: linkedinUrl !== undefined ? linkedinUrl : currentUser.linkedinUrl,
      githubUrl: githubUrl !== undefined ? githubUrl : currentUser.githubUrl,
      websiteUrl: websiteUrl !== undefined ? websiteUrl : currentUser.websiteUrl,
      bio: bio !== undefined ? bio : currentUser.bio,
      profilePictureUrl: profilePictureUrl !== undefined ? profilePictureUrl : currentUser.profilePictureUrl,
      university: university !== undefined ? university : currentUser.university,
      department: department !== undefined ? department : currentUser.department,
      graduationYear: graduationYear !== undefined ? graduationYear : currentUser.graduationYear,
      preferredJobRole: preferredJobRole !== undefined ? preferredJobRole : currentUser.preferredJobRole,
      themePreference: themePreference !== undefined ? themePreference : currentUser.themePreference,
      emailNotifications: emailNotifications !== undefined ? emailNotifications : currentUser.emailNotifications,
      applicationAlerts: applicationAlerts !== undefined ? applicationAlerts : currentUser.applicationAlerts,
      weeklyDigest: weeklyDigest !== undefined ? weeklyDigest : currentUser.weeklyDigest,
      updatedAt: new Date(),
    };

    if (password && password.trim().length >= 6) {
      updateData.passwordHash = password.trim();
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, currentUser.id))
      .returning();

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
