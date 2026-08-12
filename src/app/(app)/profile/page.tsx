import type { Metadata } from "next";
import { ProfileTab } from "@/components/ProfileTab";

export const metadata: Metadata = { title: "Profile & Settings · ResuMate" };

export default function ProfilePage() {
  return <ProfileTab />;
}
