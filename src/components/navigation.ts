import {
  LayoutDashboard, FileText, Edit3, Target, Wand2, User,
  TrendingUp, Briefcase, Map, Cpu, History, type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Extra path prefixes that should light this item up. */
  match?: string[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** Single source of truth for the sidebar, breadcrumbs and page titles. */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Resume Tools",
    items: [
      { href: "/resumes", label: "My Resumes", icon: FileText },
      { href: "/builder", label: "Resume Studio", icon: Edit3, match: ["/builder"] },
      { href: "/ats", label: "ATS & Job Matcher", icon: Target },
      { href: "/cover-letter", label: "Cover Letter", icon: FileText },
    ],
  },
  {
    label: "Career Center",
    items: [
      { href: "/jobs", label: "Job Board", icon: Briefcase },
      { href: "/roadmap", label: "Career Roadmap", icon: Map },
      { href: "/ai-studio", label: "AI Bullet Studio", icon: Wand2 },
      { href: "/tech-stack", label: "Tech Stack", icon: Cpu },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/analytics", label: "Analytics", icon: TrendingUp },
      { href: "/activity", label: "Activity History", icon: History },
    ],
  },
  {
    label: "Account",
    items: [{ href: "/profile", label: "Profile & Settings", icon: User }],
  },
];

export const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

export const BOTTOM_NAV: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/resumes", label: "Resumes", icon: FileText },
  { href: "/builder", label: "Studio", icon: Edit3, match: ["/builder"] },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/profile", label: "Profile", icon: User },
];

/** True when `pathname` belongs to the given nav item. */
export function isActive(item: NavItem, pathname: string): boolean {
  if (pathname === item.href) return true;
  if (pathname.startsWith(`${item.href}/`)) return true;
  return (item.match ?? []).some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Human label for the current route, used in the header breadcrumb. */
export function titleForPath(pathname: string): string {
  const match = ALL_NAV_ITEMS.find((i) => isActive(i, pathname));
  return match?.label ?? "Dashboard";
}
