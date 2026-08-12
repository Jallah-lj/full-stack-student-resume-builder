import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSessionUser, toPublicUser } from "@/lib/auth";
import { AppProvider } from "@/components/providers/AppProvider";
import { AppShell } from "@/components/layout/AppShell";

export const dynamic = "force-dynamic";

/**
 * Authenticated application shell.
 *
 * The session is resolved on the server so the sidebar renders with the
 * right user on first paint (no auth flash), and an expired cookie is
 * redirected before any private UI is sent to the browser.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");

  return (
    <AppProvider initialUser={toPublicUser(user)}>
      <AppShell>{children}</AppShell>
    </AppProvider>
  );
}
