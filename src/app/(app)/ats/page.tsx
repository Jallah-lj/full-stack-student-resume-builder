import type { Metadata } from "next";
import { AtsOptimizerTab } from "@/components/AtsOptimizerTab";

export const metadata: Metadata = { title: "ATS & Job Matcher · ResuMate" };

export default function AtsPage() {
  return <AtsOptimizerTab />;
}
