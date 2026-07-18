import { NextResponse } from "next/server";
import { seedDatabase } from "@/db/seed";

export async function POST() {
  try {
    await seedDatabase();
    return NextResponse.json({ success: true, message: "Database seeded successfully" });
  } catch (error) {
    console.error("Failed to seed database:", error);
    return NextResponse.json({ success: false, error: "Database seed failed" }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
