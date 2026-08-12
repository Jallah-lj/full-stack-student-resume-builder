import type { Metadata } from "next";
import { TechStackTab } from "@/components/TechStackTab";

export const metadata: Metadata = { title: "Tech Stack · ResuMate" };

export default function TechStackPage() {
  return <TechStackTab />;
}
