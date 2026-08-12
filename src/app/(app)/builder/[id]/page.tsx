import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { resumes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { ResumeBuilderTab } from "@/components/ResumeBuilderTab";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return { title: "Resume Studio · ResuMate" };

  const [resume] = await db
    .select({ title: resumes.title, userId: resumes.userId })
    .from(resumes)
    .where(eq(resumes.id, id))
    .limit(1);

  if (!resume || resume.userId !== user.id) return { title: "Resume Studio · ResuMate" };
  return { title: `${resume.title} · Resume Studio` };
}

export default async function BuilderPage({ params }: Props) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");

  // Verify ownership on the server so a guessed id 404s before any
  // private data is fetched by the client component.
  const [resume] = await db
    .select({ id: resumes.id, userId: resumes.userId })
    .from(resumes)
    .where(eq(resumes.id, id))
    .limit(1);

  if (!resume || resume.userId !== user.id) notFound();

  return <ResumeBuilderTab resumeId={id} />;
}
