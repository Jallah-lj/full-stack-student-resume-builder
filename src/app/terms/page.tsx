import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service · ResuMate",
  description: "The terms governing your use of ResuMate.",
};

export default function TermsPage() {
  return <LegalPage type="terms" />;
}
