import type { Metadata } from "next";
import { ActivityHistoryTab } from "@/components/ActivityHistoryTab";

export const metadata: Metadata = { title: "Activity History · ResuMate" };

export default function ActivityPage() {
  return <ActivityHistoryTab />;
}
