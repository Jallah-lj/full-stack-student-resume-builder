import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { db } from "@/db";
import { resumes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Resume Studio · ResuMate" };
export const dynamic = "force-dynamic";

/**
 * /builder has no resume of its own — open the most recently edited one
 * so the nav item always lands somewhere useful.
 */
export default async function BuilderIndexPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");

  const [latest] = await db
    .select({ id: resumes.id })
    .from(resumes)
    .where(eq(resumes.userId, user.id))
    .orderBy(desc(resumes.updatedAt))
    .limit(1);

  if (latest) redirect(`/builder/${latest.id}`);

  return (
    <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center space-y-4">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
        <FileText className="w-8 h-8 text-slate-400" />
      </div>
      <h2 className="text-base font-bold text-slate-800">No resumes yet</h2>
      <p className="text-xs text-slate-500 max-w-xs mx-auto">
        Create your first resume and the studio will open automatically.
      </p>
      <Link
        href="/resumes"
        className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
      >
        Go to My Resumes
      </Link>
    </div>
  );
}
