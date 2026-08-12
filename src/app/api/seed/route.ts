import { cookies } from "next/headers";
import { resetDatabase } from "@/db/seed";
import { route, ok } from "@/lib/api";
import { SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/seed — wipe and re-seed the demo dataset.
 *
 * This is destructive, so it is POST-only (a GET handler here meant any
 * crawler or prefetch could nuke the database). Every user row is deleted,
 * which cascades to sessions, so we also clear the caller's cookie.
 */
export const POST = route(async () => {
  await resetDatabase();

  const res = ok({
    success: true,
    message: "Demo data has been reset. Sign in again with demo1234.",
  });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", expires: new Date(0) });
  void (await cookies());
  return res;
});
