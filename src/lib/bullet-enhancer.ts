/**
 * Advanced AI Bullet Enhancement Engine
 * Parses raw student phrasing, identifies tech stacks/keywords, replaces weak verbs,
 * and generates 3 high-impact, ATS-optimized accomplishment bullets.
 *
 * Supports optional Gemini API calls if GEMINI_API_KEY is configured in process.env.
 */

export type EnhancementDomain = "tech" | "finance" | "healthcare" | "research" | "general";

export interface EnhancementResult {
  original: string;
  domain: EnhancementDomain;
  suggestions: string[];
  extractedTech: string[];
  detectedVerb: string;
}

// Tech Stack & Tool Dictionary for intelligent extraction
const TECH_DICTIONARY = [
  "React", "Next.js", "Vue", "Angular", "Node.js", "Express", "Python", "Java", "C++",
  "TypeScript", "JavaScript", "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Docker",
  "Kubernetes", "AWS", "GCP", "Azure", "PyTorch", "TensorFlow", "Pandas", "NumPy",
  "Scikit-Learn", "Tailwind", "Bootstrap", "Git", "CI/CD", "GraphQL", "REST API",
  "Flask", "Django", "FastAPI", "Spring Boot", "R", "MATLAB", "Tableau", "PowerBI",
  "Excel", "Figma", "Swift", "Kotlin", "Go", "Rust", "Linux", "JUnit", "Jest",
  "Selenium", "Spark", "Hadoop", "Kafka", "Postman", "Jira", "Chai", "Pytest"
];

// Weak passive verbs to detect and replace
const WEAK_VERBS_REGEX = /^(i\s+|we\s+|my\s+|responsible for\s+|helped to\s+|helped\s+|worked on\s+|was\s+|made a\s+|built a\s+|created a\s+|wrote a\s+|handled\s+|did\s+|assisted with\s+|used\s+)/i;

const DOMAIN_POWER_VERBS: Record<EnhancementDomain, string[]> = {
  tech: [
    "Architected", "Engineered", "Deployed", "Benchmarked", "Automated",
    "Refactored", "Optimized", "Scaled", "Containerized", "Integrated"
  ],
  finance: [
    "Formulated", "Modeled", "Valued", "Forecasted", "Structured",
    "Reconciled", "Quantified", "Underwrote", "Allocated", "Executed"
  ],
  healthcare: [
    "Assayed", "Synthesized", "Calibrated", "Formulated", "Documented",
    "Evaluated", "Standardized", "Audited", "Optimized", "Coordinated"
  ],
  research: [
    "Investigated", "Quantified", "Derived", "Correlated", "Validated",
    "Published", "Modeled", "Hypothesized", "Synthesized", "Evaluated"
  ],
  general: [
    "Spearheaded", "Directed", "Orchestrated", "Mobilized", "Championed",
    "Facilitated", "Restructured", "Coordinated", "Pioneered", "Elevated"
  ],
};

const METRIC_VARIATIONS = {
  tech: [
    "reducing execution latency by 38% and optimizing CPU utilization",
    "supporting 2,500+ active user requests with 99.9% uptime",
    "improving database query response time by 42% across 100k+ records",
    "cutting build & deployment cycle times by 30%"
  ],
  finance: [
    "improving forecast accuracy by 24% across $15M+ in portfolio assets",
    "saving 15+ hours weekly in manual data reconciliation",
    "identifying $120k in operational cost efficiencies",
    "enhancing valuation model precision across 8 target scenarios"
  ],
  healthcare: [
    "achieving 99.8% assay accuracy across 450+ patient samples",
    "reducing clinical sample processing turnaround time by 35%",
    "maintaining 100% adherence to IRB protocols and HIPAA guidelines",
    "accelerating diagnostic reporting speed by 28%"
  ],
  research: [
    "confirming statistical significance (p < 0.01) across 4 experimental cohorts",
    "reducing experimental data variance by 30%",
    "processing 50k+ raw data points using custom algorithmic scripts",
    "contributing key findings to a peer-reviewed academic publication"
  ],
  general: [
    "beating baseline project targets by 25% and finishing 2 weeks ahead of schedule",
    "boosting active member engagement by 45% across 200+ participants",
    "streamlining cross-functional operations and reducing administrative overhead by 30%",
    "delivering high-priority milestones to 1,500+ campus stakeholders"
  ]
};

/** Extract tech stack mentioned in student text */
function extractTech(text: string): string[] {
  const found: string[] = [];
  const lower = text.toLowerCase();
  for (const tech of TECH_DICTIONARY) {
    if (lower.includes(tech.toLowerCase())) {
      found.push(tech);
    }
  }
  return Array.from(new Set(found));
}

/** Clean raw input text */
function cleanInput(text: string): { cleaned: string; verb: string } {
  let cleaned = text.trim().replace(/\s+/g, " ").replace(/[.;]+$/, "");
  const match = cleaned.match(WEAK_VERBS_REGEX);
  const verb = match ? match[0].trim() : "Worked on";
  cleaned = cleaned.replace(WEAK_VERBS_REGEX, "").trim();
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
  }
  return { cleaned: cleaned || text, verb };
}

/** Attempt to call Gemini API if key is available */
async function callGeminiAPI(bulletText: string, domain: EnhancementDomain): Promise<string[] | null> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const prompt = `You are a professional resume bullet expert for top tech companies, investment banks, and research labs.
Enhance the following raw resume bullet into exactly 3 distinct, high-impact, quantified, ATS-optimized accomplishment bullets for a ${domain} resume.

Rules:
1. Start with strong action verbs (e.g. Architected, Engineered, Formulated, Spearheaded).
2. Quantify results with realistic metrics (e.g. percentages, user counts, latency reductions, time saved).
3. Seamlessly incorporate any tools/technologies mentioned in the original bullet.
4. Keep each bullet concise (15-28 words max).
5. Output ONLY a valid JSON array of 3 strings. No markdown formatting, no code blocks, no text before or after.

Original Bullet: "${bulletText}"`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 350 },
        }),
      }
    );

    if (!response.ok) return null;
    const resData = await response.json();
    const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const cleanedJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanedJson);
    if (Array.isArray(parsed) && parsed.length >= 3) {
      return parsed.slice(0, 3).map(s => String(s).trim());
    }
  } catch {
    // Graceful fallback to NLP engine
  }
  return null;
}

/** Rule-Based Rule NLP Enhancer (100% Reliable Fallback) */
function generateNlpEnhancements(
  bulletText: string,
  domain: EnhancementDomain,
  extractedTech: string[]
): string[] {
  const { cleaned } = cleanInput(bulletText);
  const verbs = DOMAIN_POWER_VERBS[domain] || DOMAIN_POWER_VERBS.general;
  const metrics = METRIC_VARIATIONS[domain] || METRIC_VARIATIONS.general;

  const techClause = extractedTech.length > 0
    ? ` using ${extractedTech.slice(0, 3).join(", ")}`
    : "";

  // Check if user already provided a metric (e.g., %, $, numbers)
  const hasUserMetric = /\b(\d+%|\$\d+|\d+\+|\d+k)\b/i.test(bulletText);

  if (hasUserMetric) {
    return [
      `${verbs[0]} ${cleaned}${techClause}, driving measurable outcomes and ensuring end-to-end reliability.`,
      `${verbs[1]} and optimized ${cleaned}${techClause}, adhering to industry best practices and quality standards.`,
      `${verbs[2]} ${cleaned}${techClause}, delivering high-precision results ahead of key deadlines.`,
    ];
  }

  // Generate 3 distinct, highly realistic bullet variations
  const var1 = `${verbs[0]} ${cleaned}${techClause}, ${metrics[0]}.`;
  const var2 = `${verbs[1]} ${cleaned}${techClause}, ${metrics[1]}.`;
  const var3 = `${verbs[2]} end-to-end implementation of ${cleaned}${techClause}, ${metrics[2]}.`;

  return [var1, var2, var3];
}

/** Main Entrypoint for Bullet Enhancement */
export async function enhanceBullet(
  bulletText: string,
  rawDomain: string = "tech"
): Promise<EnhancementResult> {
  const domain: EnhancementDomain = (
    ["tech", "finance", "healthcare", "research", "general"].includes(rawDomain.toLowerCase())
      ? rawDomain.toLowerCase()
      : "general"
  ) as EnhancementDomain;

  const extractedTech = extractTech(bulletText);
  const { verb } = cleanInput(bulletText);

  // 1. Attempt Gemini API call if key is available
  const aiSuggestions = await callGeminiAPI(bulletText, domain);

  // 2. Fall back to smart NLP engine if API is unconfigured/unavailable
  const finalSuggestions = aiSuggestions || generateNlpEnhancements(bulletText, domain, extractedTech);

  return {
    original: bulletText,
    domain,
    suggestions: finalSuggestions,
    extractedTech,
    detectedVerb: verb,
  };
}
