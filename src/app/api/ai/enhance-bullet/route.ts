import { NextRequest } from "next/server";
import { route, ok, fail, requireUser, logActivity } from "@/lib/api";
import { enhanceBullet } from "@/lib/bullet-enhancer";

export const dynamic = "force-dynamic";

export const POST = route(async (req: NextRequest) => {
  const user = await requireUser();
  const { bulletText, domain = "tech" } = await req.json();

  if (!bulletText || !String(bulletText).trim()) {
    return fail("Write a few words about what you did, then run the enhancer.", 400);
  }
  if (String(bulletText).length > 600) {
    return fail("That bullet is too long to enhance — keep it under 600 characters.", 400);
  }

  const result = await enhanceBullet(String(bulletText), String(domain));

  await logActivity({
    userId: user.id,
    type: "ai",
    action: "Bullet enhanced",
    target: String(bulletText).slice(0, 60),
    result: `${result.suggestions.length} suggestions`,
    status: "success",
  });

  return ok({
    original: result.original,
    domain: result.domain,
    suggestions: result.suggestions,
    extractedTech: result.extractedTech,
    detectedVerb: result.detectedVerb,
  });
});

