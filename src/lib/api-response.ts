import { NextResponse } from "next/server";

/**
 * Wraps an async route handler so that any uncaught error returns
 * a proper JSON { error: string } response instead of the Next.js
 * HTML error page – which causes "Unexpected token '<'" in the client.
 */
export function apiHandler(
  fn: (...args: any[]) => Promise<NextResponse | Response>
) {
  return async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (err: any) {
      console.error("[API Error]", err);
      return NextResponse.json(
        { error: err?.message || "Internal server error" },
        { status: 500 }
      );
    }
  };
}

/** Always return JSON even when DATABASE_URL is not set */
export function missingEnvResponse(variable: string) {
  return NextResponse.json(
    {
      error: `Server misconfiguration: ${variable} is not set. ` +
        `Create a .env file with ${variable}=<your-connection-string> and restart.`,
    },
    { status: 503 }
  );
}
