import React from "react";

export interface ResumeData {
  resume: {
    id: string;
    title: string;
    targetRole?: string | null;
    template: string;
    colorTheme: string;
    fontSize: string;
    fontFamily: string;
    showGpa: boolean;
    showCoursework: boolean;
    showProjectsFirst: boolean;
    shareSlug: string;
    isPublic: boolean;
    atsScore: number;
  };
  user: {
    name: string;
    email: string;
    headline?: string | null;
    phone?: string | null;
    location?: string | null;
    linkedinUrl?: string | null;
    githubUrl?: string | null;
    websiteUrl?: string | null;
    bio?: string | null;
  };
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    major: string;
    minor?: string | null;
    location?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    gpa?: string | null;
    honors?: string | null;
    coursework?: string | null;
  }>;
  workExperiences: Array<{
    id: string;
    company: string;
    role: string;
    location?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    isCurrent: boolean;
    bullets: string; // JSON string
  }>;
  projects: Array<{
    id: string;
    title: string;
    roleOrTechnologies?: string | null;
    link?: string | null;
    date?: string | null;
    bullets: string; // JSON string
  }>;
  extracurriculars: Array<{
    id: string;
    organization: string;
    role: string;
    date?: string | null;
    bullets: string; // JSON string
  }>;
  skills: Array<{
    id: string;
    category: string;
    skillsList: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer?: string | null;
    issueDate?: string | null;
    credentialUrl?: string | null;
  }>;
}

export function parseBullets(bulletString: string): string[] {
  try {
    if (!bulletString) return [];
    if (bulletString.startsWith("[")) {
      const parsed = JSON.parse(bulletString);
      return Array.isArray(parsed) ? parsed : [bulletString];
    }
    return bulletString.split("\n").filter(b => b.trim().length > 0);
  } catch {
    return [bulletString];
  }
}

export function getColorClass(theme: string) {
  switch (theme) {
    case "emerald":
      return {
        text: "text-emerald-800 dark:text-emerald-400",
        bg: "bg-emerald-800",
        border: "border-emerald-800",
        lightBg: "bg-emerald-50 text-emerald-900",
        badgeBg: "bg-emerald-100 text-emerald-800",
      };
    case "burgundy":
      return {
        text: "text-rose-900 dark:text-rose-400",
        bg: "bg-rose-900",
        border: "border-rose-900",
        lightBg: "bg-rose-50 text-rose-900",
        badgeBg: "bg-rose-100 text-rose-900",
      };
    case "slate":
      return {
        text: "text-slate-800 dark:text-slate-300",
        bg: "bg-slate-800",
        border: "border-slate-800",
        lightBg: "bg-slate-100 text-slate-900",
        badgeBg: "bg-slate-200 text-slate-800",
      };
    case "purple":
      return {
        text: "text-purple-900 dark:text-purple-400",
        bg: "bg-purple-900",
        border: "border-purple-900",
        lightBg: "bg-purple-50 text-purple-900",
        badgeBg: "bg-purple-100 text-purple-800",
      };
    case "navy":
    default:
      return {
        text: "text-indigo-900 dark:text-indigo-400",
        bg: "bg-indigo-900",
        border: "border-indigo-900",
        lightBg: "bg-indigo-50 text-indigo-900",
        badgeBg: "bg-indigo-100 text-indigo-900",
      };
  }
}

export function getFontFamilyClass(font: string) {
  switch (font) {
    case "serif":
      return "font-serif";
    case "garamond":
      return "font-serif tracking-tight";
    case "roboto":
      return "font-sans";
    case "inter":
    default:
      return "font-sans";
  }
}

export function getFontSizeClass(size: string) {
  switch (size) {
    case "sm":
      return "text-xs";
    case "lg":
      return "text-sm leading-relaxed";
    case "md":
    default:
      return "text-xs leading-normal";
  }
}
