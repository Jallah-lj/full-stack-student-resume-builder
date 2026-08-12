import type { Metadata } from "next";
import { AnalyticsTab } from "@/components/AnalyticsTab";

export const metadata: Metadata = { title: "Analytics · ResuMate" };

export default function AnalyticsPage() {
  return <AnalyticsTab />;
}
