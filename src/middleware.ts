import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "resumate_session";

/** Routes that never require a session. */
const PUBLIC_PATHS = ["/sign-in", "/sign-up", "/terms", "/privacy"];

/**
 * Route guard.
 *
 * Only checks for the presence of the session cookie — the cookie is opaque
 * and is fully validated against the sessions table on the server. This keeps
 * the middleware on the light Edge runtime while still preventing an
 * unauthenticated user from ever landing on an app shell.
 */
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value);

  const isPublic =
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    pathname.startsWith("/r/"); // public shared resumes

  // Signed-in users shouldn't sit on the auth screens.
  if (hasSession && (pathname === "/sign-in" || pathname === "/sign-up")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!hasSession && !isPublic) {
    const url = new URL("/sign-in", req.url);
    // Preserve where they were headed so we can bounce back after login.
    if (pathname !== "/") url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals, API routes and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
