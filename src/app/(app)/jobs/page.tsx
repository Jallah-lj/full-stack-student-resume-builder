import type { Metadata } from "next";
import { JobBoardTab } from "@/components/JobBoardTab";

export const metadata: Metadata = { title: "Job Board · ResuMate" };

export default function JobsPage() {
  return <JobBoardTab />;
}
