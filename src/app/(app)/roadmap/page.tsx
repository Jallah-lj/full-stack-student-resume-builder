import type { Metadata } from "next";
import { RoadmapTab } from "@/components/RoadmapTab";

export const metadata: Metadata = { title: "Career Roadmap · ResuMate" };

export default function RoadmapPage() {
  return <RoadmapTab />;
}
