import type { Metadata } from "next";
import { CoverLetterTab } from "@/components/CoverLetterTab";

export const metadata: Metadata = { title: "Cover Letter · ResuMate" };

export default function CoverLetterPage() {
  return <CoverLetterTab />;
}
