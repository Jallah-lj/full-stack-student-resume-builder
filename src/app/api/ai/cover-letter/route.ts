import { NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { route, ok, fail, requireUser, requireOwnedResume, logActivity } from "@/lib/api";
import { loadResumeBundle } from "../../resumes/[id]/route";

export const dynamic = "force-dynamic";

/**
 * POST /api/ai/cover-letter
 *
 * Builds the letter server-side from the stored resume the user owns,
 * so the output always reflects real saved data.
 */
export const POST = route(async (req: NextRequest) => {
  const user = await requireUser();
  const { resumeId, companyName, jobTitle, jobDescription } = await req.json();

  if (!resumeId) return fail("Select a resume to base the letter on.", 400);
  if (!companyName?.trim()) return fail("Enter the company name.", 400);
  if (!jobTitle?.trim()) return fail("Enter the role you're applying for.", 400);

  const resume = await requireOwnedResume(resumeId, user.id);
  const ownerRows = await db.select().from(users).where(eq(users.id, resume.userId)).limit(1);
  const owner = ownerRows[0];
  const { education, workExperiences, projects, skills } = await loadResumeBundle(resumeId);

  const company = companyName.trim();
  const role = jobTitle.trim();

  const edu = education[0];
  const university = edu?.institution || owner?.university || "my university";
  const major = edu?.major || owner?.department || "my field";
  const gradLine = edu?.endDate ? ` (${edu.endDate})` : "";

  const primarySkills =
    skills[0]?.skillsList ||
    "full-stack engineering, quantitative problem solving, and analytical research";

  // Prefer real experience, fall back to a real project, then to coursework.
  const experience = workExperiences[0];
  const project = projects[0];
  const proofPoint = experience
    ? `my ${experience.role} experience at ${experience.company}`
    : project
      ? `building ${project.title}`
      : "my hands-on project portfolio";

  const jdLine = jobDescription?.trim()
    ? `Your posting emphasizes ${jobDescription.trim().replace(/\s+/g, " ").slice(0, 140)}… — an area I have deliberately built depth in.`
    : "I thrive in fast-moving environments where I can take ownership of technical work end to end.";

  const contactLines = [owner?.email, owner?.phone, owner?.linkedinUrl].filter(Boolean).join("\n");

  const letter = `Dear Hiring Team at ${company},

I am writing to express my strong interest in the ${role} position at ${company}. As an undergraduate studying ${major} at ${university}${gradLine}, I have built a solid foundation in ${primarySkills}.

Through ${proofPoint}, I have shown I can ship scalable solutions, collaborate across teams, and turn coursework into production-ready results. ${jdLine}

I would welcome the chance to bring that same energy to ${company}. Thank you for your time and consideration — I look forward to discussing how my background fits your team's goals.

Sincerely,
${owner?.name || "Student Applicant"}
${contactLines}`;

  await logActivity({
    userId: user.id,
    resumeId,
    type: "ai",
    action: "Cover letter drafted",
    target: `${role} · ${company}`,
    result: "Ready to send",
    status: "success",
  });

  return ok({ coverLetter: letter });
});
