import { NextRequest } from "next/server";
import { route, ok } from "@/lib/api";
import { recordResumeView } from "@/lib/track-view";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/resumes/:id/view — record a hit on a public resume page.
 *
 * Public by design: recruiters viewing a shared link are not signed in.
 */
export const POST = route(async (req: NextRequest, { params }: Ctx) => {
  const { id: resumeId } = await params;

  const recorded = await recordResumeView({
    resumeId,
    userAgent: req.headers.get("user-agent"),
    referer: req.headers.get("referer"),
    ip:
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip"),
    country: req.headers.get("x-vercel-ip-country"),
  });

  return ok({ recorded });
});
