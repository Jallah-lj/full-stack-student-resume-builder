import type { Metadata } from "next";
import { DashboardHomeTab } from "@/components/DashboardHomeTab";

export const metadata: Metadata = { title: "Dashboard · ResuMate" };

export default function DashboardPage() {
  return <DashboardHomeTab />;
}
