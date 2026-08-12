import { cookies } from "next/headers";
import { destroySession, SESSION_COOKIE } from "@/lib/auth";
import { route, ok } from "@/lib/api";

export const dynamic = "force-dynamic";

export const POST = route(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  // Delete the server-side session so the token is dead even if the
  // cookie survives on the client.
  await destroySession(token);

  const res = ok({ success: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", expires: new Date(0) });
  return res;
});
