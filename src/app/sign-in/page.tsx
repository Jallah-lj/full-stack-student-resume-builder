import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import AuthPage from "@/components/AuthPage";

export const metadata: Metadata = {
  title: "Sign In · ResuMate",
  description: "Sign in to build ATS-optimized student resumes.",
};
export const dynamic = "force-dynamic";

export default async function SignInPage() {
  if (await getSessionUser()) redirect("/dashboard");
  return (
    <Suspense>
      <AuthPage mode="sign-in" />
    </Suspense>
  );
}
