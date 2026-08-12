import { NextRequest } from "next/server";
import { db } from "@/db";
import { resumes, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { route, ok, fail, requireUser, requireOwnedResume, logActivity } from "@/lib/api";
import { loadResumeBundle } from "../resumes/[id]/route";

export const dynamic = "force-dynamic";

const ACTION_VERBS = [
  "engineered", "architected", "developed", "built", "implemented", "optimized",
  "spearheaded", "directed", "authored", "designed", "accelerated", "pioneered",
  "formulated", "led", "managed", "orchestrated", "transformed", "streamlined",
  "reduced", "increased", "boosted", "maximized", "curated", "published", "analyzed",
];

const STOP_WORDS = new Set([
  "and", "the", "with", "for", "you", "that", "this", "are", "have", "will", "from",
  "their", "our", "work", "team", "year", "years", "must", "your", "who", "all", "any",
  "can", "not", "but", "was", "has", "his", "her", "its", "job", "role", "about", "into",
  "such", "than", "them", "they", "what", "when", "where", "which", "while", "would",
  "should", "could", "other", "were", "been", "more", "most", "some", "also", "how",
  // Generic job-posting filler — matching these tells a student nothing useful.
  "looking", "seeking", "candidate", "candidates", "applicant", "applicants",
  "ideal", "strong", "excellent", "great", "good", "ability", "able", "skills",
  "experience", "experienced", "required", "requirements", "preferred", "plus",
  "responsibilities", "including", "include", "includes", "etc", "position",
  "opportunity", "company", "join", "help", "using", "used", "well", "new",
  "within", "across", "through", "both", "each", "may", "one", "two", "per",
  "hiring", "apply", "applications", "benefits", "salary", "please", "email",
]);

/**
 * POST /api/ats-analyze
 *
 * Takes a resume id (not client-supplied resume content) so the score is
 * always computed from the real stored record the user owns.
 */
export const POST = route(async (req: NextRequest) => {
  const user = await requireUser();
  const { resumeId, jobDescription = "", companyName, jobTitle, persist = true } = await req.json();

  if (!resumeId) return fail("Select a resume to analyze.", 400);
  const resume = await requireOwnedResume(resumeId, user.id);

  const ownerRows = await db.select().from(users).where(eq(users.id, resume.userId)).limit(1);
  const owner = ownerRows[0];
  const sections = await loadResumeBundle(resumeId);

  // ── Flatten the resume into searchable text ──────────────────
  const parts: string[] = [
    owner?.name, owner?.headline, owner?.email, owner?.phone,
    owner?.location, owner?.linkedinUrl, owner?.githubUrl, owner?.websiteUrl, owner?.bio,
  ].filter(Boolean) as string[];

  sections.education.forEach((e) => parts.push(e.institution, e.degree, e.major, e.minor ?? "", e.coursework ?? "", e.honors ?? ""));
  sections.workExperiences.forEach((w) => parts.push(w.company, w.role, w.bullets));
  sections.projects.forEach((p) => parts.push(p.title, p.roleOrTechnologies ?? "", p.bullets));
  sections.extracurriculars.forEach((x) => parts.push(x.organization, x.role, x.bullets));
  sections.skills.forEach((s) => parts.push(s.category, s.skillsList));
  sections.certifications.forEach((c) => parts.push(c.name, c.issuer ?? ""));

  const textContent = parts.join(" ");
  const lowerText = textContent.toLowerCase();

  // ── 1. Action verbs (max 25) ─────────────────────────────────
  const matchedVerbs = ACTION_VERBS.filter((verb) => lowerText.includes(verb));
  const verbScore = Math.min(25, matchedVerbs.length * 5);

  // ── 2. Quantified achievements (max 25) ──────────────────────
  const numbersMatch = textContent.match(/(\d+%|\$[\d,]+|\b\d+x\b|\b\d[\d,]*\b)/g) || [];
  const quantScore = Math.min(25, numbersMatch.length * 5);

  // ── 3. Structural completeness (max 30) ──────────────────────
  let structureScore = 0;
  const gaps: string[] = [];
  if (owner?.email && (owner?.phone || owner?.linkedinUrl)) structureScore += 8;
  else gaps.push("Add a phone number or LinkedIn URL alongside your email.");
  if (sections.education.length > 0) structureScore += 8;
  else gaps.push("Add your education — it's the first thing recruiters look for.");
  if (sections.workExperiences.length > 0 || sections.projects.length > 0) structureScore += 8;
  else gaps.push("Add at least one work experience or project.");
  if (sections.skills.length > 0) structureScore += 6;
  else gaps.push("Add a skills section with your languages and tools.");

  // ── 4. Keyword overlap with the job description (max 20) ─────
  let keywordScore = 12;
  let matchedKeywords: string[] = [];
  let missingKeywords: string[] = [];
  const hasJd = typeof jobDescription === "string" && jobDescription.trim().length > 10;

  if (hasJd) {
    const rawWords = jobDescription.toLowerCase().match(/\b[a-z0-9+#.]{3,}\b/g) || [];
    const freq: Record<string, number> = {};
    for (const w of rawWords) if (!STOP_WORDS.has(w)) freq[w] = (freq[w] || 0) + 1;

    const ranked = Object.keys(freq).sort((a, b) => freq[b] - freq[a]).slice(0, 15);
    matchedKeywords = ranked.filter((kw) => lowerText.includes(kw));
    missingKeywords = ranked.filter((kw) => !lowerText.includes(kw));
    keywordScore = ranked.length > 0 ? Math.round((matchedKeywords.length / ranked.length) * 20) : 12;
  }

  const atsScore = Math.min(100, Math.max(30, verbScore + quantScore + structureScore + keywordScore));

  // ── Recommendations ──────────────────────────────────────────
  const recommendations: string[] = [...gaps];
  if (matchedVerbs.length < 3) {
    recommendations.push("Start bullets with high-impact verbs — Engineered, Spearheaded, Accelerated, Formulated.");
  }
  if (numbersMatch.length < 3) {
    recommendations.push("Quantify results with metrics: 'Reduced load time by 35%', 'Served 5,000+ users'.");
  }
  if (!owner?.linkedinUrl && !owner?.githubUrl) {
    recommendations.push("Add LinkedIn and GitHub links — they measurably increase recruiter callbacks.");
  }
  if (missingKeywords.length > 0) {
    recommendations.push(`Weave in missing terms from the posting: ${missingKeywords.slice(0, 5).join(", ")}.`);
  }
  if (!hasJd) {
    recommendations.push("Paste a job description to unlock keyword gap analysis against a specific role.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Strong resume. Keep tailoring keywords per application to stay above 90%.");
  }

  // Persist the freshly computed score so cards and dashboards agree.
  if (persist && atsScore !== resume.atsScore) {
    await db.update(resumes).set({ atsScore }).where(eq(resumes.id, resumeId));
  }

  await logActivity({
    userId: user.id,
    resumeId,
    type: "ats",
    action: "ATS scan run",
    target: [jobTitle, companyName].filter(Boolean).join(" · ") || resume.title,
    result: `${atsScore}% match`,
    status: atsScore >= 80 ? "success" : "warning",
  });

  return ok({
    atsScore,
    breakdown: {
      actionVerbs: verbScore,
      quantification: quantScore,
      structure: structureScore,
      keywords: keywordScore,
    },
    matchedVerbs,
    quantifiedMetricsCount: numbersMatch.length,
    matchedKeywords,
    missingKeywords,
    recommendations,
  });
});
