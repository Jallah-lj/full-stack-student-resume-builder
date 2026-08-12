import { NextRequest } from "next/server";
import { route, ok, fail, requireUser, logActivity } from "@/lib/api";

export const dynamic = "force-dynamic";

type Domain = "tech" | "finance" | "healthcare" | "research" | "general";

const DOMAIN_ALIASES: Record<string, Domain> = {
  tech: "tech", cs: "tech", software: "tech", engineering: "tech",
  finance: "finance", business: "finance", consulting: "finance",
  healthcare: "healthcare", premed: "healthcare", bio: "healthcare",
  research: "research", academic: "research", lab: "research",
  general: "general",
};

/**
 * Rewrite templates per domain. Each takes the student's raw phrasing and
 * returns a stronger, quantified variant. Deterministic and offline —
 * no external AI key required for the app to work.
 */
const TEMPLATES: Record<Domain, ((s: string) => string)[]> = {
  tech: [
    (s) => `Engineered ${s} using modern full-stack practices, cutting execution latency by 35% and improving responsiveness.`,
    (s) => `Architected and deployed ${s}, supporting 4,500+ monthly active users at 99.8% uptime.`,
    (s) => `Spearheaded development of ${s}, adding automated tests and query optimization to boost throughput 40%.`,
  ],
  finance: [
    (s) => `Pioneered ${s}, running comparative valuation and financial modeling to sharpen client decision-making.`,
    (s) => `Formulated an analytical framework for ${s}, surfacing growth opportunities across $25M+ in assets.`,
    (s) => `Executed ${s} ahead of schedule, streamlining forecasting and cutting audit overhead by 28%.`,
  ],
  healthcare: [
    (s) => `Directed ${s} under strict laboratory protocols, producing high-accuracy assay datasets for clinical review.`,
    (s) => `Synthesized and analyzed clinical sample data for ${s}, presenting findings at a research symposium.`,
    (s) => `Optimized the data logging procedure for ${s}, accelerating sample processing 30% at 100% compliance.`,
  ],
  research: [
    (s) => `Investigated ${s}, designing controlled experiments and validating results across 3 independent trials.`,
    (s) => `Quantified outcomes for ${s}, applying statistical modeling in Python and R to confirm significance (p < 0.05).`,
    (s) => `Authored and published findings on ${s}, contributing to a peer-reviewed undergraduate research journal.`,
  ],
  general: [
    (s) => `Spearheaded ${s}, coordinating cross-functional efforts to beat baseline efficiency goals by 25%.`,
    (s) => `Optimized the workflow for ${s}, delivering measurable outcomes for 1,200+ stakeholders.`,
    (s) => `Directed end-to-end implementation of ${s}, using a data-driven approach to finish 2 weeks early.`,
  ],
};

/** Strip a leading weak verb/pronoun so the rewrite reads naturally. */
function normalize(text: string): string {
  let s = text.trim().replace(/\s+/g, " ").replace(/[.;]+$/, "");
  s = s.replace(/^(i\s+|we\s+|my\s+|responsible for\s+|helped to\s+|helped\s+|worked on\s+|was\s+)/i, "");
  return s.charAt(0).toLowerCase() + s.slice(1);
}

export const POST = route(async (req: NextRequest) => {
  const user = await requireUser();
  const { bulletText, domain = "tech" } = await req.json();

  if (!bulletText || !String(bulletText).trim()) {
    return fail("Write a few words about what you did, then run the enhancer.", 400);
  }
  if (String(bulletText).length > 600) {
    return fail("That bullet is too long to enhance — keep it under 600 characters.", 400);
  }

  const key = DOMAIN_ALIASES[String(domain).toLowerCase()] ?? "general";
  const normalized = normalize(String(bulletText));
  const suggestions = TEMPLATES[key].map((fn) => fn(normalized));

  await logActivity({
    userId: user.id,
    type: "ai",
    action: "Bullet enhanced",
    target: String(bulletText).slice(0, 60),
    result: `${suggestions.length} suggestions`,
    status: "success",
  });

  return ok({ original: bulletText, domain: key, suggestions });
});
