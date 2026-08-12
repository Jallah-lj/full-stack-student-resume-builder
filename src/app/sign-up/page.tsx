import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import AuthPage from "@/components/AuthPage";

export const metadata: Metadata = {
  title: "Create Account · ResuMate",
  description: "Create your free ResuMate student account.",
};
export const dynamic = "force-dynamic";

export default async function SignUpPage() {
  if (await getSessionUser()) redirect("/dashboard");
  return (
    <Suspense>
      <AuthPage mode="sign-up" />
    </Suspense>
  );
}
