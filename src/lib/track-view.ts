import { createHash } from "crypto";
import { db } from "@/db";
import { resumes, resumeViews } from "@/db/schema";
import { eq } from "drizzle-orm";
import { newId } from "@/lib/api";

export function detectDevice(ua: string): "mobile" | "tablet" | "desktop" {
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
  return "desktop";
}

export function normalizeReferrer(ref: string | null): string {
  if (!ref) return "direct";
  try {
    const host = new URL(ref).hostname.replace(/^www\./, "");
    if (host.includes("linkedin")) return "LinkedIn";
    if (host.includes("google")) return "Google";
    if (host.includes("github")) return "GitHub";
    if (host.includes("mail") || host.includes("outlook")) return "Email";
    return host;
  } catch {
    return "direct";
  }
}

/** Obvious crawlers shouldn't pollute a student's visitor numbers. */
function isBot(ua: string): boolean {
  return /bot|crawler|spider|crawling|facebookexternalhit|slurp|bingpreview|headlesschrome/i.test(ua);
}

interface TrackInput {
  resumeId: string;
  userAgent: string | null;
  referer: string | null;
  ip: string | null;
  country?: string | null;
}

/**
 * Record a hit on a public resume.
 *
 * Visitors are identified by a salted daily hash of IP + user-agent, so unique
 * visitor counts work without ever storing a raw IP address. Views on missing,
 * private or bot-requested resumes are silently ignored.
 */
export async function recordResumeView({
  resumeId,
  userAgent,
  referer,
  ip,
  country,
}: TrackInput): Promise<boolean> {
  const ua = userAgent || "";
  if (isBot(ua)) return false;

  const rows = await db
    .select({ id: resumes.id, isPublic: resumes.isPublic })
    .from(resumes)
    .where(eq(resumes.id, resumeId))
    .limit(1);

  if (!rows[0] || !rows[0].isPublic) return false;

  const day = new Date().toISOString().slice(0, 10);
  const visitorHash = createHash("sha256")
    .update(`${ip || "unknown"}|${ua}|${resumeId}|${day}`)
    .digest("hex")
    .slice(0, 32);

  await db.insert(resumeViews).values({
    id: newId("view"),
    resumeId,
    visitorHash,
    referrer: normalizeReferrer(referer),
    device: detectDevice(ua),
    country: country || null,
  });

  return true;
}
