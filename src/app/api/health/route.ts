import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Lazy import so a missing DATABASE_URL doesn't crash the module at import time
    const { db } = await import("@/db");
    const { sql } = await import("drizzle-orm");
    await db.execute(sql`select 1`);
    return NextResponse.json({ ok: true, message: "ResuMate is healthy", timestamp: new Date().toISOString() });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: "Database connection failed", detail: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
