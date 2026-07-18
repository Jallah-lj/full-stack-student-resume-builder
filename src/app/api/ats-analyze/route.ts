import { NextRequest, NextResponse } from "next/server";

const ACTION_VERBS = [
  "engineered", "architected", "developed", "built", "implemented", "optimized",
  "spearheaded", "directed", "authored", "designed", "accelerated", "pioneered",
  "formulated", "led", "managed", "orchestrated", "transformed", "streamlined",
  "reduced", "increased", "boosted", "maximized", "curated", "published", "analyzed"
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeData, jobDescription } = body;

    let textContent = "";
    if (resumeData) {
      const user = resumeData.user || {};
      const edu = resumeData.education || [];
      const work = resumeData.workExperiences || [];
      const proj = resumeData.projects || [];
      const skills = resumeData.skills || [];

      textContent += ` ${user.name} ${user.headline} ${user.email} ${user.phone} ${user.location} ${user.linkedinUrl} ${user.githubUrl}`;
      edu.forEach((e: any) => textContent += ` ${e.institution} ${e.degree} ${e.major} ${e.coursework} ${e.honors}`);
      work.forEach((w: any) => textContent += ` ${w.company} ${w.role} ${w.bullets}`);
      proj.forEach((p: any) => textContent += ` ${p.title} ${p.roleOrTechnologies} ${p.bullets}`);
      skills.forEach((s: any) => textContent += ` ${s.category} ${s.skillsList}`);
    }

    const lowerText = textContent.toLowerCase();

    // 1. Action Verbs Evaluation
    const matchedVerbs = ACTION_VERBS.filter(verb => lowerText.includes(verb));
    const verbScore = Math.min(25, matchedVerbs.length * 5);

    // 2. Quantification Check (numbers, %, $, x)
    const numbersMatch = textContent.match(/(\d+%|\$\d+|\b\d+\b|\b\d+x\b)/g) || [];
    const quantScore = Math.min(25, numbersMatch.length * 5);

    // 3. Section Completeness Check
    let structureScore = 0;
    if (resumeData?.user?.email && (resumeData?.user?.phone || resumeData?.user?.linkedinUrl)) structureScore += 10;
    if (resumeData?.education?.length > 0) structureScore += 10;
    if (resumeData?.workExperiences?.length > 0 || resumeData?.projects?.length > 0) structureScore += 10;
    if (resumeData?.skills?.length > 0) structureScore += 10;

    // 4. Keyword Match against Job Description if provided
    let keywordScore = 15;
    let matchedKeywords: string[] = [];
    let missingKeywords: string[] = [];

    if (jobDescription && jobDescription.trim().length > 10) {
      // Extract candidate key terms from job description
      const stopWords = new Set(["and", "the", "with", "for", "you", "that", "this", "are", "have", "will", "from", "their", "our", "work", "team", "year", "years", "must", "with"]);
      const rawWords = jobDescription.toLowerCase().match(/\b[a-z0-9+#.-]{3,}\b/g) || [];
      const freqMap: Record<string, number> = {};
      
      rawWords.forEach((w: string) => {
        if (!stopWords.has(w)) {
          freqMap[w] = (freqMap[w] || 0) + 1;
        }
      });

      const sortedKeywords = Object.keys(freqMap).sort((a, b) => freqMap[b] - freqMap[a]).slice(0, 15);

      matchedKeywords = sortedKeywords.filter(kw => lowerText.includes(kw));
      missingKeywords = sortedKeywords.filter(kw => !lowerText.includes(kw));

      keywordScore = sortedKeywords.length > 0 
        ? Math.round((matchedKeywords.length / sortedKeywords.length) * 20)
        : 15;
    }

    const totalAtsScore = Math.min(100, Math.max(30, verbScore + quantScore + structureScore + keywordScore));

    const recommendations: string[] = [];
    if (matchedVerbs.length < 3) {
      recommendations.push("Use more high-impact action verbs (e.g. Engineered, Spearheaded, Accelerated, Formulated) at the start of bullet points.");
    }
    if (numbersMatch.length < 3) {
      recommendations.push("Quantify your results with metrics (e.g., 'Reduced load time by 35%', 'Managed $40K budget', 'Served 5,000+ users').");
    }
    if (!resumeData?.user?.linkedinUrl && !resumeData?.user?.githubUrl) {
      recommendations.push("Add portfolio/LinkedIn/GitHub links to make your profile stand out to recruiters.");
    }
    if (missingKeywords.length > 0) {
      recommendations.push(`Consider including missing key terms from target job: ${missingKeywords.slice(0, 5).join(", ")}`);
    }

    return NextResponse.json({
      atsScore: totalAtsScore,
      matchedVerbs,
      quantifiedMetricsCount: numbersMatch.length,
      matchedKeywords,
      missingKeywords,
      recommendations,
    });
  } catch (error) {
    console.error("ATS analyze error:", error);
    return NextResponse.json({ error: "Failed to run ATS analysis" }, { status: 500 });
  }
}
