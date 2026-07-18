"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, FileText, Edit3, Target, Sparkles,
  UserCheck, Menu, X, Wand2, User, TrendingUp, Briefcase,
  Map, Cpu, History, LogOut, ChevronRight,
} from "lucide-react";
import { UserSwitcherModal } from "./UserSwitcherModal";
import { DashboardHomeTab } from "./DashboardHomeTab";
import { ResumesListTab } from "./ResumesListTab";
import { ResumeBuilderTab } from "./ResumeBuilderTab";
import { AtsOptimizerTab } from "./AtsOptimizerTab";
import { AiToolsTab } from "./AiToolsTab";
import { CoverLetterTab } from "./CoverLetterTab";
import { AnalyticsTab } from "./AnalyticsTab";
import { JobBoardTab } from "./JobBoardTab";
import { RoadmapTab } from "./RoadmapTab";
import { TechStackTab } from "./TechStackTab";
import { ActivityHistoryTab } from "./ActivityHistoryTab";
import { ProfileTab } from "./ProfileTab";
import AuthPage from "./AuthPage";

type TabId = "home" | "resumes" | "builder" | "ats" | "ai" | "cover_letter" | "analytics" | "jobs" | "roadmap" | "tech_stack" | "activity" | "profile";

interface NavGroup {
  label: string;
  items: { id: TabId; label: string; icon: React.ElementType }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { id: "home",    label: "Dashboard",         icon: LayoutDashboard },
    ],
  },
  {
    label: "Resume Tools",
    items: [
      { id: "resumes",  label: "My Resumes",        icon: FileText },
      { id: "builder",  label: "Resume Studio",      icon: Edit3 },
      { id: "ats",      label: "ATS & Job Matcher",  icon: Target },
      { id: "cover_letter", label: "Cover Letter",   icon: FileText },
    ],
  },
  {
    label: "Career Center",
    items: [
      { id: "jobs",     label: "Job Board",          icon: Briefcase },
      { id: "roadmap",  label: "Career Roadmap",     icon: Map },
      { id: "ai",       label: "AI Bullet Studio",   icon: Wand2 },
      { id: "tech_stack", label: "Tech Stack",       icon: Cpu },
    ],
  },
  {
    label: "Insights",
    items: [
      { id: "analytics", label: "Analytics",         icon: TrendingUp },
      { id: "activity",  label: "Activity History",  icon: History },
    ],
  },
  {
    label: "Account",
    items: [
      { id: "profile", label: "Profile & Settings",  icon: User },
    ],
  },
];

const BOTTOM_NAV: { id: TabId; icon: React.ElementType; label: string }[] = [
  { id: "home",    icon: LayoutDashboard, label: "Home" },
  { id: "resumes", icon: FileText,        label: "Resumes" },
  { id: "builder", icon: Edit3,           label: "Studio" },
  { id: "jobs",    icon: Briefcase,       label: "Jobs" },
  { id: "profile", icon: User,            label: "Profile" },
];

export function DashboardLayout() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const meRes = await fetch("/api/auth/me");
      const ct = meRes.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        setIsAuthenticated(false);
        return;
      }
      const meData = await meRes.json();
      if (!meData.user) {
        setIsAuthenticated(false);
        setCurrentUser(null);
      } else {
        setIsAuthenticated(true);
        setCurrentUser(meData.user);
      }
      setAvailableUsers(meData.availableUsers || []);

      const rRes = await fetch("/api/resumes");
      const rData = await rRes.json();
      const loaded = rData.resumes || [];
      setResumes(loaded);
      if (loaded.length > 0 && !selectedResumeId) setSelectedResumeId(loaded[0].id);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Close sidebar on outside tap
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (isMobileMenuOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isMobileMenuOpen]);

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1024) setIsMobileMenuOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setIsAuthenticated(false);
    setCurrentUser(null);
    setResumes([]);
  };

  const handleSelectUser = async (userId: string) => {
    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    setSelectedResumeId(null);
    await loadData();
  };

  const handleCreateResume = async (payload: {
    title: string; targetRole: string; template: string; colorTheme: string; copyFromResumeId?: string;
  }) => {
    const res = await fetch("/api/resumes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.resume) {
      setSelectedResumeId(data.resume.id);
      setActiveTab("builder");
      await loadData();
    }
  };

  const handleDuplicateResume = async (resumeId: string) => {
    const source = resumes.find((r) => r.id === resumeId);
    if (!source) return;
    await handleCreateResume({ title: `${source.title} (Copy)`, targetRole: source.targetRole || "", template: source.template, colorTheme: source.colorTheme, copyFromResumeId: resumeId });
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (!confirm("Delete this resume? This cannot be undone.")) return;
    await fetch(`/api/resumes/${resumeId}`, { method: "DELETE" });
    if (selectedResumeId === resumeId) setSelectedResumeId(null);
    await loadData();
  };

  const handleResetSeed = async () => {
    await fetch("/api/seed", { method: "POST" });
    setSelectedResumeId(null);
    await loadData();
  };

  const navigate = (tab: string) => {
    setActiveTab(tab as TabId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isAuthenticated === false) return <AuthPage onAuthSuccess={loadData} />;

  const activeLabel = NAV_GROUPS.flatMap(g => g.items).find(i => i.id === activeTab)?.label || "Dashboard";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">

      {/* ── HEADER ────────────────────────────────────── */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">

          {/* Brand + Hamburger */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button onClick={() => navigate("home")} className="flex items-center gap-2 select-none">
              <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-black text-white text-base shadow-md">
                R
              </div>
              <div className="hidden sm:block">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  ResuMate
                </span>
                <span className="hidden md:inline ml-1.5 text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 px-1.5 py-0.5 rounded font-mono">
                  FOR STUDENTS
                </span>
              </div>
            </button>

            {/* Active breadcrumb — tablet only */}
            <div className="hidden sm:flex lg:hidden items-center gap-1.5 text-slate-500 text-xs ml-2">
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-300 font-semibold">{activeLabel}</span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setIsSwitcherOpen(true)}
              className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
            >
              <div className="w-7 h-7 shrink-0 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                {currentUser?.profilePictureUrl
                  ? <img src={currentUser.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                  : currentUser?.name?.charAt(0) || "?"}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-white font-bold text-xs leading-none truncate max-w-[120px]">{currentUser?.name || "..."}</div>
                <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{currentUser?.university || currentUser?.email}</div>
              </div>
              <span className="hidden sm:inline text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-bold">Switch</span>
            </button>

            <button onClick={handleLogout} title="Sign Out"
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/50 border border-slate-700 text-slate-400 hover:text-rose-400 transition-all">
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── MOBILE SIDEBAR BACKDROP ──────────────────── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* ── PAGE BODY ──────────────────────────────── */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 flex gap-4 sm:gap-6">

        {/* ── SIDEBAR ─────────────────────────────── */}
        <aside
          ref={sidebarRef}
          className={`
            fixed top-14 sm:top-16 left-0 bottom-0 w-64 sm:w-60 xl:w-64 bg-white border-r border-slate-200 shadow-2xl z-40
            overflow-y-auto thin-scrollbar transition-transform duration-300 ease-in-out
            lg:static lg:shadow-sm lg:rounded-2xl lg:border lg:border-slate-200 lg:translate-x-0 lg:self-start lg:sticky lg:top-20 lg:h-auto
            ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <div className="p-3 pb-20 lg:pb-3">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="mb-3">
                <div className="px-2 py-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">{group.label}</div>
                <div className="space-y-0.5">
                  {group.items.map(({ id, label, icon: Icon }) => {
                    const isActive = activeTab === id;
                    return (
                      <button
                        key={id}
                        onClick={() => navigate(id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left group ${
                          isActive
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${id === "ai" && !isActive ? "text-purple-500" : ""}`} />
                        <span className="truncate">{label}</span>
                        {id === "resumes" && resumes.length > 0 && (
                          <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-black ${isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}>
                            {resumes.length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Profile Card */}
            {currentUser && (
              <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 shrink-0 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                    {currentUser.profilePictureUrl
                      ? <img src={currentUser.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                      : currentUser.name?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 truncate">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{currentUser.university || currentUser.email}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {currentUser.graduationYear && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-100 text-indigo-800">'{currentUser.graduationYear.slice(-2)}</span>
                  )}
                  {currentUser.preferredJobRole && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 truncate max-w-[120px]">{currentUser.preferredJobRole}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ── MAIN CONTENT ──────────────────────────── */}
        <main className="flex-1 min-w-0 overflow-hidden">
          {loading ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <p className="text-sm font-bold text-slate-700">Loading ResuMate...</p>
                <p className="text-xs text-slate-400 mt-1">Connecting to database and bootstrapping your data</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === "home"         && <DashboardHomeTab currentUser={currentUser} onNavigate={navigate} />}
              {activeTab === "resumes"      && (
                <ResumesListTab
                  resumes={resumes}
                  onSelectResume={(id) => { setSelectedResumeId(id); setActiveTab("builder"); }}
                  onCreateResume={handleCreateResume}
                  onDuplicateResume={handleDuplicateResume}
                  onDeleteResume={handleDeleteResume}
                  onRefresh={loadData}
                />
              )}
              {activeTab === "builder" && (
                selectedResumeId ? (
                  <ResumeBuilderTab resumeId={selectedResumeId} onRefresh={loadData} />
                ) : (
                  <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                      <FileText className="w-8 h-8 text-slate-400" />
                    </div>
                    <h2 className="text-base font-bold text-slate-800">No Resume Selected</h2>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Go to My Resumes and click "Edit Builder" on any resume to open the studio.
                    </p>
                    <button onClick={() => setActiveTab("resumes")} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors">
                      Go to My Resumes
                    </button>
                  </div>
                )
              )}
              {activeTab === "ats"          && <AtsOptimizerTab resumes={resumes} selectedResumeId={selectedResumeId || undefined} />}
              {activeTab === "ai"           && <AiToolsTab />}
              {activeTab === "cover_letter" && <CoverLetterTab resumes={resumes} />}
              {activeTab === "analytics"    && <AnalyticsTab resumes={resumes} />}
              {activeTab === "jobs"         && <JobBoardTab />}
              {activeTab === "roadmap"      && <RoadmapTab />}
              {activeTab === "tech_stack"   && <TechStackTab />}
              {activeTab === "activity"     && <ActivityHistoryTab />}
              {activeTab === "profile"      && <ProfileTab currentUser={currentUser} onUserUpdated={loadData} onResetSeed={handleResetSeed} />}
            </>
          )}
        </main>
      </div>

      {/* ── MOBILE BOTTOM TAB BAR ─────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg">
        <div className="grid grid-cols-5 h-14 max-w-lg mx-auto">
          {BOTTOM_NAV.map(({ id, icon: Icon, label }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => navigate(id)}
                className={`flex flex-col items-center justify-center gap-0.5 text-[9px] font-bold transition-colors ${
                  isActive ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-colors ${isActive ? "bg-indigo-50" : ""}`}>
                  <Icon className={`w-5 h-5 ${isActive ? "text-indigo-600" : ""}`} />
                </div>
                {label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom spacer for mobile nav */}
      <div className="lg:hidden h-14" aria-hidden />

      <UserSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        currentUser={currentUser}
        availableUsers={availableUsers}
        onSelectUser={handleSelectUser}
        onUserRegistered={loadData}
      />
    </div>
  );
}
