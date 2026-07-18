import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyName, jobTitle, jobDescription, user, education, workExperiences, skills } = body;

    const studentName = user?.name || "Student Applicant";
    const university = education?.[0]?.institution || "University";
    const major = education?.[0]?.major || "Degree Program";
    const expectedGrad = education?.[0]?.endDate || "Expected Graduation";
    const topCompany = workExperiences?.[0]?.company ? `my recent experience at ${workExperiences[0].company}` : "my hands-on project portfolio";
    const primarySkills = skills?.[0]?.skillsList || "full-stack engineering, quantitative problem solving, and analytical research";

    const letter = `Dear Hiring Team at ${companyName || "Target Organization"},

I am writing to express my strong interest in the ${jobTitle || "Internship / Full-Time"} position at ${companyName || "your organization"}. As a current undergraduate studying ${major} at ${university} (${expectedGrad}), I have built a solid foundation in ${primarySkills}. ${companyName ? `${companyName}'s mission and engineering standard deeply align with my career aspiration to solve high-impact technical problems.` : ""}

Through ${topCompany}, I have demonstrated my capability to engineer scalable solutions, collaborate across cross-functional teams, and translate theoretical coursework into production-ready results. ${jobDescription ? `Given your focus on ${jobDescription.slice(0, 120)}..., I am confident my background renders me a strong match for your engineering and analytical objectives.` : "I thrive in dynamic, fast-paced environments where I can take ownership of technical initiatives."}

I am eager to contribute my technical skills and enthusiasm to the team at ${companyName || "your team"}. Thank you for your time and consideration, and I look forward to the opportunity to discuss how my background fits your upcoming cohort.

Sincerely,
${studentName}
${user?.email || ""}
${user?.phone || ""}
${user?.linkedinUrl || ""}`;

    return NextResponse.json({ coverLetter: letter });
  } catch (error) {
    console.error("Cover letter error:", error);
    return NextResponse.json({ error: "Failed to generate cover letter" }, { status: 500 });
  }
}
