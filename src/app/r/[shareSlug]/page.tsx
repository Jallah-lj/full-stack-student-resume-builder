import { db } from "@/db";
import { resumes, users, education, workExperiences, projects, extracurriculars, skills, certifications } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { recordResumeView } from "@/lib/track-view";
import { ResumeTemplateDispatcher } from "@/components/resume-templates/ResumeTemplateDispatcher";
import { PublicResumeHeader } from "@/components/PublicResumeHeader";

// Every visit must hit the server so views are counted accurately.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ shareSlug: string }> }) {
  const { shareSlug } = await params;
  const match = await db.select().from(resumes).where(eq(resumes.shareSlug, shareSlug)).limit(1);
  if (match.length === 0) return { title: "Resume Not Found" };
  const r = match[0];
  const u = await db.select().from(users).where(eq(users.id, r.userId)).limit(1);
  const userName = u[0]?.name || "Student";
  return {
    title: `${userName} - ${r.title} | ResuMate`,
    description: `View public resume and portfolio for ${userName}`,
  };
}

export default async function PublicResumePage({ params }: { params: Promise<{ shareSlug: string }> }) {
  const { shareSlug } = await params;

  const match = await db.select().from(resumes).where(eq(resumes.shareSlug, shareSlug)).limit(1);
  if (match.length === 0) {
    notFound();
  }

  const resume = match[0];
  if (!resume.isPublic) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">This Resume is Private</h1>
        <p className="text-slate-600 max-w-md">The owner of this resume has set its visibility to private.</p>
      </div>
    );
  }

  // Count this visit before rendering. Never let analytics break the page.
  try {
    const h = await headers();
    await recordResumeView({
      resumeId: resume.id,
      userAgent: h.get("user-agent"),
      referer: h.get("referer"),
      ip: h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip"),
      country: h.get("x-vercel-ip-country"),
    });
  } catch (err) {
    console.error("Failed to record resume view:", err);
  }

  const ownerList = await db.select().from(users).where(eq(users.id, resume.userId)).limit(1);
  const user = ownerList[0];

  const eduList = await db.select().from(education).where(eq(education.resumeId, resume.id)).orderBy(asc(education.sortOrder));
  const workList = await db.select().from(workExperiences).where(eq(workExperiences.resumeId, resume.id)).orderBy(asc(workExperiences.sortOrder));
  const projList = await db.select().from(projects).where(eq(projects.resumeId, resume.id)).orderBy(asc(projects.sortOrder));
  const extraList = await db.select().from(extracurriculars).where(eq(extracurriculars.resumeId, resume.id)).orderBy(asc(extracurriculars.sortOrder));
  const skillList = await db.select().from(skills).where(eq(skills.resumeId, resume.id)).orderBy(asc(skills.sortOrder));
  const certList = await db.select().from(certifications).where(eq(certifications.resumeId, resume.id)).orderBy(asc(certifications.sortOrder));

  const resumeData = {
    resume,
    user,
    education: eduList,
    workExperiences: workList,
    projects: projList,
    extracurriculars: extraList,
    skills: skillList,
    certifications: certList,
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 print:py-0 print:px-0 print:bg-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <PublicResumeHeader resumeTitle={resume.title} userName={user?.name || "Student"} />
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 print:shadow-none print:border-none">
          <ResumeTemplateDispatcher data={resumeData} />
        </div>
      </div>
    </div>
  );
}
