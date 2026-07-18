"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText, Target, Briefcase, Star, Plus, ArrowRight,
  Sparkles, CheckCircle2, AlertTriangle, Zap, Edit3,
  Map, TrendingUp, ChevronRight, ArrowUpRight, Flame,
  BookOpen, LayoutDashboard, Eye,
} from "lucide-react";

interface Stats {
  totalResumes: number;
  avgAtsScore: number;
  totalApplications: number;
  interviewing: number;
  offers: number;
  applied: number;
  recentResumes: any[];
  recentApps: any[];
}

const TIPS = [
  "Start every bullet with a strong verb — Engineered, Spearheaded, Optimized.",
  "Quantify impact: '3× faster', '$40K budget', '10K+ users' wins recruiter attention.",
  "Tailor resume keywords to each role using the ATS Optimizer.",
  "Keep it to 1 page unless you have 10+ years of experience.",
  "LinkedIn, GitHub, and portfolio links increase callbacks by 40%.",
];

export function DashboardHomeTab({ currentUser, onNavigate }: { currentUser: any; onNavigate: (t: string) => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const now = new Date();
  const hr = now.getHours();
  const greeting = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
  const tip = TIPS[now.getDay() % TIPS.length];

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then(r => r.json()).then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Animated sparkline canvas for ATS score
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    const points = [55, 62, 58, 70, 75, 80, stats?.avgAtsScore ?? 85];
    ctx.clearRect(0, 0, W, H);
    const step = W / (points.length - 1);
    const min = Math.min(...points) - 5;
    const max = Math.max(...points) + 5;
    const toY = (v: number) => H - ((v - min) / (max - min)) * H;

    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "rgba(16,185,129,0.25)");
    grad.addColorStop(1, "rgba(16,185,129,0)");
    ctx.beginPath();
    ctx.moveTo(0, toY(points[0]));
    points.forEach((p, i) => { if (i > 0) ctx.lineTo(i * step, toY(p)); });
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(0, toY(points[0]));
    points.forEach((p, i) => { if (i > 0) ctx.lineTo(i * step, toY(p)); });
    ctx.strokeStyle = "#10b981"; ctx.lineWidth = 2.5;
    ctx.lineJoin = "round"; ctx.stroke();

    // Dot at end
    const lx = (points.length - 1) * step;
    const ly = toY(points[points.length - 1]);
    ctx.beginPath(); ctx.arc(lx, ly, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#10b981"; ctx.fill();
    ctx.beginPath(); ctx.arc(lx, ly, 7, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(16,185,129,0.25)"; ctx.fill();
  }, [stats]);

  const completionItems = [
    { label: "Profile Picture",  done: !!currentUser?.profilePictureUrl },
    { label: "University Set",   done: !!currentUser?.university },
    { label: "Preferred Role",   done: !!currentUser?.preferredJobRole },
    { label: "LinkedIn URL",     done: !!currentUser?.linkedinUrl },
  ];
  const completionPct = Math.round((completionItems.filter(i => i.done).length / 4) * 100);

  const STATUS_MAP: Record<string, { label: string; color: string }> = {
    applied:      { label: "Applied",      color: "#6366f1" },
    interviewing: { label: "Interviewing", color: "#f59e0b" },
    offer:        { label: "Offer 🎉",     color: "#10b981" },
    rejected:     { label: "Rejected",     color: "#f43f5e" },
  };

  return (
    <div className="space-y-5 pb-8">

      {/* ═══════════════════════════════════════════════════════
          HERO — Full-bleed editorial banner with mesh gradient
      ═══════════════════════════════════════════════════════ */}
      <div className="relative rounded-3xl overflow-hidden min-h-[200px] sm:min-h-[220px]"
        style={{ background: "linear-gradient(135deg, #0d0d1a 0%, #130d35 40%, #0d1f3c 100%)" }}>

        {/* Mesh orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-[380px] h-[380px] rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)", top: "-120px", right: "-80px" }} />
          <div className="absolute w-[280px] h-[280px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)", bottom: "-100px", left: "20%" }} />
          <div className="absolute w-[200px] h-[200px] rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)", top: "10px", left: "60%" }} />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Left */}
          <div className="flex items-center gap-5">
            {/* Avatar with glow ring */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-2xl blur-md opacity-60"
                style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)", transform: "scale(1.1)" }} />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-white/20">
                {currentUser?.profilePictureUrl
                  ? <img src={currentUser.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl font-black text-white"
                      style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
                      {currentUser?.name?.charAt(0) || "S"}
                    </div>
                }
              </div>
              {/* Live dot */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#0d0d1a] shadow" />
            </div>

            <div>
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-cyan-400/80 mb-0.5">{greeting}</p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-none">
                {currentUser?.name?.split(" ")[0] || "Student"} <span className="text-3xl">👋</span>
              </h1>
              {currentUser?.university && (
                <p className="text-white/50 text-xs sm:text-sm mt-1.5 font-medium">
                  {currentUser.university}
                  {currentUser.department && <span className="text-white/30"> · {currentUser.department}</span>}
                </p>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {currentUser?.graduationYear && (
              <div className="px-5 py-4 rounded-2xl text-center border border-white/10 backdrop-blur-sm"
                style={{ background: "rgba(255,255,255,0.05)" }}>
                <div className="text-2xl sm:text-3xl font-black text-white leading-none">
                  {Math.max(0, parseInt(currentUser.graduationYear) - now.getFullYear())}yr
                </div>
                <div className="text-[9px] font-black tracking-[0.2em] uppercase text-white/40 mt-1">to grad</div>
              </div>
            )}
            <button onClick={() => onNavigate("resumes")}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm transition-all active:scale-95"
              style={{ background: "rgba(255,255,255,0.95)", color: "#0d0d1a" }}>
              <Plus className="w-4 h-4" style={{ color: "#7c3aed" }} />
              New Resume
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          STATS — Horizontal scrollable mosaic (not grid boxes)
      ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card 1: Total Resumes — dark card with counter */}
        <div
          onClick={() => onNavigate("resumes")}
          onMouseEnter={() => setHovered("resumes")}
          onMouseLeave={() => setHovered(null)}
          className="relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group"
          style={{
            background: hovered === "resumes"
              ? "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)"
              : "linear-gradient(135deg, #0f0c29 0%, #1a1760 100%)",
            transform: hovered === "resumes" ? "translateY(-3px)" : "none",
            boxShadow: hovered === "resumes" ? "0 20px 40px rgba(99,102,241,0.3)" : "0 4px 20px rgba(0,0,0,0.15)",
          }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #818cf8, transparent)", transform: "translate(30%, -30%)" }} />
          <div className="p-5 sm:p-6 relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(129,140,248,0.2)" }}>
                <FileText className="w-5 h-5 text-indigo-300" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Active</span>
            </div>
            <div className="text-5xl sm:text-6xl font-black text-white leading-none mb-1">
              {loading ? <div className="w-10 h-12 bg-white/10 rounded-lg animate-pulse" /> : stats?.totalResumes ?? 0}
            </div>
            <p className="text-indigo-300 text-xs font-semibold mt-2">Total Resumes</p>
          </div>
        </div>

        {/* Card 2: ATS Score — with live sparkline chart */}
        <div
          onClick={() => onNavigate("ats")}
          onMouseEnter={() => setHovered("ats")}
          onMouseLeave={() => setHovered(null)}
          className="relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
          style={{
            background: "#f0fdf4",
            transform: hovered === "ats" ? "translateY(-3px)" : "none",
            boxShadow: hovered === "ats" ? "0 20px 40px rgba(16,185,129,0.25)" : "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <div className="p-5 sm:p-6">
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                {stats?.avgAtsScore && stats.avgAtsScore >= 80 ? "Strong ↑" : "Optimize"}
              </span>
            </div>
            <div className="text-5xl sm:text-6xl font-black text-emerald-900 leading-none">
              {loading ? <div className="w-16 h-12 bg-emerald-100 rounded-lg animate-pulse" /> : `${stats?.avgAtsScore ?? 0}%`}
            </div>
            <p className="text-emerald-700 text-xs font-semibold mt-2 mb-3">Avg ATS Score</p>
            {/* Sparkline */}
            <div className="h-10 w-full">
              <canvas ref={canvasRef} className="w-full h-full" />
            </div>
          </div>
        </div>

        {/* Card 3: Applications — warm gradient */}
        <div
          onClick={() => onNavigate("ats")}
          onMouseEnter={() => setHovered("apps")}
          onMouseLeave={() => setHovered(null)}
          className="relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
          style={{
            background: hovered === "apps"
              ? "linear-gradient(135deg, #78350f, #92400e)"
              : "linear-gradient(135deg, #fffbeb, #fef3c7)",
            transform: hovered === "apps" ? "translateY(-3px)" : "none",
            boxShadow: hovered === "apps" ? "0 20px 40px rgba(245,158,11,0.3)" : "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <div className="absolute bottom-0 right-0 w-28 h-28 rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, #f59e0b, transparent)", transform: "translate(30%, 30%)" }} />
          <div className="p-5 sm:p-6 relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hovered === "apps" ? "bg-white/20" : "bg-amber-200"}`}>
                <Briefcase className={`w-5 h-5 ${hovered === "apps" ? "text-amber-200" : "text-amber-700"}`} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${hovered === "apps" ? "text-amber-200" : "text-amber-700"}`}>Tracked</span>
            </div>
            <div className={`text-5xl sm:text-6xl font-black leading-none ${hovered === "apps" ? "text-white" : "text-amber-900"}`}>
              {loading ? <div className="w-10 h-12 bg-amber-200 rounded-lg animate-pulse" /> : stats?.totalApplications ?? 0}
            </div>
            <p className={`text-xs font-semibold mt-2 ${hovered === "apps" ? "text-amber-200" : "text-amber-700"}`}>Applications</p>
          </div>
        </div>

        {/* Card 4: Interviewing — minimal white with accent line */}
        <div
          onClick={() => onNavigate("ats")}
          onMouseEnter={() => setHovered("interviews")}
          onMouseLeave={() => setHovered(null)}
          className="relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 bg-white"
          style={{
            transform: hovered === "interviews" ? "translateY(-3px)" : "none",
            boxShadow: hovered === "interviews" ? "0 20px 40px rgba(244,63,94,0.2)" : "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          {/* Top accent strip */}
          <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #f43f5e, #ec4899, #a855f7)" }} />
          <div className="p-5 sm:p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <Star className="w-5 h-5 text-rose-500" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: stats?.offers ? "#10b981" : "#f43f5e" }}>
                {stats?.offers ? `${stats.offers} Offer 🎉` : "Keep going!"}
              </span>
            </div>
            <div className="text-5xl sm:text-6xl font-black text-slate-900 leading-none">
              {loading ? <div className="w-8 h-12 bg-slate-100 rounded-lg animate-pulse" /> : stats?.interviewing ?? 0}
            </div>
            <p className="text-slate-500 text-xs font-semibold mt-2">Interviewing</p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          QUICK ACTIONS — Horizontal pill-strip, not grid
      ═══════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl p-5 sm:p-6" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-black text-slate-900 tracking-tight">Jump Back In</h2>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Access</span>
        </div>
        <div className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1">
          {[
            { label: "Resume Studio",   icon: Edit3,     tab: "builder",      bg: "#f5f3ff", color: "#7c3aed", ring: "hover:ring-2 hover:ring-violet-300" },
            { label: "ATS Scanner",     icon: Zap,       tab: "ats",          bg: "#fffbeb", color: "#d97706", ring: "hover:ring-2 hover:ring-amber-300" },
            { label: "AI Bullets",      icon: Sparkles,  tab: "ai",           bg: "#fdf4ff", color: "#a855f7", ring: "hover:ring-2 hover:ring-purple-300" },
            { label: "Job Board",       icon: Briefcase, tab: "jobs",         bg: "#f0fdf4", color: "#059669", ring: "hover:ring-2 hover:ring-emerald-300" },
            { label: "Cover Letter",    icon: FileText,  tab: "cover_letter", bg: "#fff1f2", color: "#e11d48", ring: "hover:ring-2 hover:ring-rose-300" },
            { label: "Career Roadmap",  icon: Map,       tab: "roadmap",      bg: "#f0f9ff", color: "#0284c7", ring: "hover:ring-2 hover:ring-sky-300" },
            { label: "Analytics",       icon: TrendingUp,tab: "analytics",    bg: "#f8fafc", color: "#475569", ring: "hover:ring-2 hover:ring-slate-300" },
          ].map(({ label, icon: Icon, tab, bg, color, ring }) => (
            <button
              key={tab}
              onClick={() => onNavigate(tab)}
              className={`shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-2xl font-bold text-xs transition-all active:scale-95 ${ring}`}
              style={{ background: bg, color }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          MAIN CONTENT ROW — editorial 3-col layout
      ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">

        {/* Recent Resumes — 5 cols */}
        <div className="lg:col-span-5 bg-white rounded-3xl overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-50">
            <h2 className="text-sm font-black text-slate-900">Recent Resumes</h2>
            <button onClick={() => onNavigate("resumes")} className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 uppercase tracking-wider">
              All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {loading ? (
            <div className="p-5 space-y-4">
              {[1,2,3].map(i => <div key={i} className="flex gap-3"><div className="w-12 h-12 bg-slate-50 rounded-2xl animate-pulse shrink-0" /><div className="flex-1 space-y-2"><div className="h-3 bg-slate-50 rounded animate-pulse w-3/4" /><div className="h-2.5 bg-slate-50 rounded animate-pulse w-1/2" /></div></div>)}
            </div>
          ) : stats?.recentResumes.length ? (
            <div>
              {stats.recentResumes.map((r, i) => (
                <button key={r.id} onClick={() => onNavigate("builder")}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0 group">
                  {/* Number accent */}
                  <div className="w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center font-black text-base"
                    style={{ background: i === 0 ? "#ede9fe" : i === 1 ? "#f0fdf4" : "#fef3c7", color: i === 0 ? "#7c3aed" : i === 1 ? "#059669" : "#d97706" }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black text-slate-900 truncate group-hover:text-indigo-700 transition-colors">{r.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-medium capitalize">
                      {r.template?.replace(/_/g, " ")} · {new Date(r.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-black" style={{ color: r.atsScore >= 90 ? "#10b981" : r.atsScore >= 75 ? "#6366f1" : "#f59e0b" }}>
                      {r.atsScore}%
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium">ATS</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-14 px-6 text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-3">
                <FileText className="w-8 h-8 text-indigo-300" />
              </div>
              <p className="text-sm font-bold text-slate-600 mb-1">No resumes yet</p>
              <p className="text-xs text-slate-400 mb-4">Build your first tailored resume</p>
              <button onClick={() => onNavigate("resumes")} className="text-xs font-black text-indigo-600 hover:underline flex items-center gap-1 mx-auto">
                Create now <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Application Tracker — 4 cols */}
        <div className="lg:col-span-4 bg-white rounded-3xl overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <div className="flex justify-between items-center px-5 py-4 border-b border-slate-50">
            <h2 className="text-sm font-black text-slate-900">Applications</h2>
            <button onClick={() => onNavigate("ats")} className="text-[11px] font-black text-indigo-600 uppercase tracking-wider flex items-center gap-0.5">
              Track <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {loading ? (
            <div className="p-5 space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-14 bg-slate-50 rounded-2xl animate-pulse" />)}
            </div>
          ) : stats?.recentApps.length ? (
            <div className="p-3 space-y-2">
              {stats.recentApps.map((app) => {
                const s = STATUS_MAP[app.status] || STATUS_MAP.applied;
                return (
                  <div key={app.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center font-black text-sm text-white"
                      style={{ background: `${s.color}22`, color: s.color }}>
                      {app.companyName?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-black text-slate-900 truncate">{app.companyName}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                        <span className="text-[10px] font-bold" style={{ color: s.color }}>{s.label}</span>
                      </div>
                    </div>
                    <div className="text-sm font-black" style={{ color: s.color }}>{app.matchScore}%</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-14 px-5 text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-3">
                <Target className="w-8 h-8 text-emerald-300" />
              </div>
              <p className="text-sm font-bold text-slate-600 mb-1">No applications yet</p>
              <button onClick={() => onNavigate("ats")} className="text-xs font-black text-emerald-600 hover:underline flex items-center gap-1 mx-auto mt-3">
                Run ATS scan <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right Panel: Tip + Completion — 3 cols */}
        <div className="lg:col-span-3 flex flex-col gap-4">

          {/* Daily Tip — dark editorial card */}
          <div className="flex-1 rounded-3xl p-5 relative overflow-hidden"
            style={{ background: "linear-gradient(150deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)", minHeight: "180px" }}>
            <div className="absolute top-0 right-0 w-28 h-28 opacity-20"
              style={{ background: "radial-gradient(circle, #a78bfa, transparent)", transform: "translate(20%, -20%)" }} />
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Daily tip</span>
              </div>
              <p className="text-white/80 text-xs leading-relaxed font-medium flex-1">{tip}</p>
              <button onClick={() => onNavigate("ai")} className="mt-4 self-start text-[10px] font-black text-violet-400 hover:text-violet-300 flex items-center gap-1 uppercase tracking-wider">
                Open AI Studio <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Profile Completion — clean minimal */}
          <div className="rounded-3xl p-5 bg-white" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wide">Profile</span>
              <span className="text-xs font-black" style={{ color: completionPct === 100 ? "#10b981" : "#7c3aed" }}>{completionPct}%</span>
            </div>
            {/* Segmented progress bar */}
            <div className="flex gap-1 mb-4">
              {completionItems.map((item, i) => (
                <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-700"
                  style={{ background: item.done ? "linear-gradient(90deg, #7c3aed, #06b6d4)" : "#f1f5f9" }} />
              ))}
            </div>
            <div className="space-y-2">
              {completionItems.map(({ label, done }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${done ? "" : "border border-slate-200"}`}
                    style={done ? { background: "linear-gradient(135deg, #7c3aed, #06b6d4)" } : {}}>
                    {done && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <span className={`text-[10px] font-semibold flex-1 ${done ? "text-slate-400 line-through" : "text-slate-700"}`}>{label}</span>
                  {!done && <button onClick={() => onNavigate("profile")} className="text-[9px] font-black text-violet-600 hover:underline">Add</button>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
