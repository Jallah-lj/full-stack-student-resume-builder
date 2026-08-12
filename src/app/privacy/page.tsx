import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy · ResuMate",
  description: "How ResuMate handles your student data.",
};

export default function PrivacyPage() {
  return <LegalPage type="privacy" />;
}
