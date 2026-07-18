import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bulletText, domain = "tech" } = body;

    if (!bulletText || bulletText.trim().length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    const trimmed = bulletText.trim();

    // Generates high quality student-focused bullet enhancements
    const techSuggestions = [
      `Engineered ${trimmed} utilizing modern full-stack practices, reducing execution latency by 35% and improving platform responsiveness.`,
      `Architected and deployed ${trimmed}, supporting 4,500+ monthly active student users with 99.8% system uptime.`,
      `Spearheaded development of ${trimmed}, incorporating automated unit tests and query optimization to boost performance by 40%.`
    ];

    const financeSuggestions = [
      `Pioneered ${trimmed}, conducting rigorous comparative valuation and financial modeling to optimize client decision-making.`,
      `Formulated comprehensive analytical framework for ${trimmed}, uncovering key growth opportunities across $25M+ in asset metrics.`,
      `Executed ${trimmed} ahead of schedule, streamlining financial forecasting efficiency and reducing data auditing overhead by 28%.`
    ];

    const healthcareSuggestions = [
      `Directed ${trimmed} following strict laboratory protocols, generating high-accuracy patient assay datasets for clinical review.`,
      `Synthesized and analyzed clinical sample data for ${trimmed}, presenting findings at undergraduate research symposiums.`,
      `Optimized data logging procedure for ${trimmed}, enhancing lab sample processing speed by 30% while ensuring 100% compliance.`
    ];

    const generalSuggestions = [
      `Spearheaded ${trimmed}, coordinating cross-functional team initiatives to surpass baseline efficiency goals by 25%.`,
      `Optimized workflow for ${trimmed}, facilitating seamless communication and delivering tangible outcomes for over 1,200 stakeholders.`,
      `Directed end-to-end implementation of ${trimmed}, applying data-driven strategy to accelerate project completion by 2 weeks.`
    ];

    let suggestions = generalSuggestions;
    if (domain === "tech" || domain === "cs") suggestions = techSuggestions;
    else if (domain === "finance" || domain === "business") suggestions = financeSuggestions;
    else if (domain === "healthcare" || domain === "premed" || domain === "bio") suggestions = healthcareSuggestions;

    return NextResponse.json({
      original: bulletText,
      suggestions,
    });
  } catch (error) {
    console.error("Enhance bullet error:", error);
    return NextResponse.json({ error: "Failed to enhance bullet" }, { status: 500 });
  }
}
