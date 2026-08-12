import type { Metadata } from "next";
import { ResumesListTab } from "@/components/ResumesListTab";

export const metadata: Metadata = { title: "My Resumes · ResuMate" };

export default function ResumesPage() {
  return <ResumesListTab />;
}
