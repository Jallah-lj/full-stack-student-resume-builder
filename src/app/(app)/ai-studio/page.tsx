import type { Metadata } from "next";
import { AiToolsTab } from "@/components/AiToolsTab";

export const metadata: Metadata = { title: "AI Bullet Studio · ResuMate" };

export default function AiStudioPage() {
  return <AiToolsTab />;
}
