"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2, Circle, Rocket, Calendar, Target, BookOpen,
  Users2, Sparkles, ArrowRight, ClipboardList, Lock,
  Trophy, Flame, Star, ChevronDown, ChevronUp,
} from "lucide-react";

const MILESTONES = [
  {
    phase: "Phase 1",
    title: "Foundation",
    subtitle: "Set up your professional identity",
    icon: Target,
    color: "indigo",
    items: [
      { id: "m1", label: "Complete your student profile",      detail: "Add university, department, graduation year, and profile picture",           points: 10 },
      { id: "m2", label: "Create your first resume",           detail: "Use any template and add your education, skills, and at least one role",      points: 15 },
      { id: "m3", label: "Add 3+ bullet points to experience", detail: "Use action verbs and quantify results with numbers and percentages",          points: 10 },
      { id: "m4", label: "Set your preferred job role",        detail: "Helps the AI tailor your resume matches and career recommendations",          points: 5  },
    ],
  },
  {
    phase: "Phase 2",
    title: "Professional Branding",
    subtitle: "Optimize and differentiate your resume",
    icon: Rocket,
    color: "purple",
    items: [
      { id: "m5", label: "Run your first ATS scan",            detail: "Paste a job description and analyze keyword gaps in the ATS Optimizer",       points: 20 },
      { id: "m6", label: "Enhance 3 bullets with AI",          detail: "Use the AI Bullet Studio to rewrite weak statements into strong impact lines", points: 15 },
      { id: "m7", label: "Enable your public portfolio link",  detail: "Share your resume URL so recruiters can view your live portfolio",            points: 10 },
      { id: "m8", label: "Add LinkedIn and GitHub URLs",        detail: "Complete your online presence to boost recruiter callback rates by 30%",     points: 10 },
    ],
  },
  {
    phase: "Phase 3",
    title: "Outreach & Applications",
    subtitle: "Start applying strategically",
    icon: Users2,
    color: "emerald",
    items: [
      { id: "m9",  label: "Generate a tailored cover letter",  detail: "Use the Cover Letter Studio to create a personalized letter for any role",    points: 15 },
      { id: "m10", label: "Apply to 3 matched internships",    detail: "Select roles from the Job Board with 80%+ ATS match score",                  points: 25 },
      { id: "m11", label: "Track applications in the tracker", detail: "Add applied roles and update statuses as you hear back",                      points: 10 },
      { id: "m12", label: "Duplicate resume for a new role",   detail: "Clone your best resume and tailor the new version for a different company",   points: 10 },
    ],
  },
  {
    phase: "Phase 4",
    title: "Master & Scale",
    subtitle: "Land the interview and win the offer",
    icon: Trophy,
    color: "amber",
    items: [
      { id: "m13", label: "Achieve 90%+ ATS score",            detail: "Fine-tune your resume until you hit 90% or above on a target role",          points: 30 },
      { id: "m14", label: "Create resumes for 3 different roles", detail: "Demonstrate versatility by building Finance, Tech, and Research variants",  points: 20 },
      { id: "m15", label: "Receive an interview invitation",    detail: "Update an application status to 'Interviewing' — you're on your way!",       points: 50 },
      { id: "m16", label: "Log an offer received",             detail: "Mark an application as 'Offer' — celebrate, you earned it!",                 points: 100 },
    ],
  },
];

const COLOR_MAP: Record<string, { ring: string; bg: string; text: string; badge: string; light: string; dot: string }> = {
  indigo:  { ring: "ring-indigo-200",  bg: "bg-indigo-600",  text: "text-indigo-600",  badge: "bg-indigo-100 text-indigo-800",  light: "bg-indigo-50",  dot: "bg-indigo-600" },
  purple:  { ring: "ring-purple-200",  bg: "bg-purple-600",  text: "text-purple-600",  badge: "bg-purple-100 text-purple-800",  light: "bg-purple-50",  dot: "bg-purple-600" },
  emerald: { ring: "ring-emerald-200", bg: "bg-emerald-600", text: "text-emerald-600", badge: "bg-emerald-100 text-emerald-800", light: "bg-emerald-50", dot: "bg-emerald-600" },
  amber:   { ring: "ring-amber-200",   bg: "bg-amber-500",   text: "text-amber-600",   badge: "bg-amber-100 text-amber-800",    light: "bg-amber-50",   dot: "bg-amber-500" },
};

const STORAGE_KEY = "resumate_roadmap_completed";

export function RoadmapTab() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>(["Phase 1"]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCompleted(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const toggleItem = (id: string) => {
    setCompleted(prev => {
      const updated = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  };

  const togglePhase = (phase: string) =>
    setExpanded(prev => prev.includes(phase) ? prev.filter(p => p !== phase) : [...prev, phase]);

  const allItems = MILESTONES.flatMap(m => m.items);
  const totalPoints = allItems.reduce((s, i) => s + i.points, 0);
  const earnedPoints = allItems.filter(i => completed.includes(i.id)).reduce((s, i) => s + i.points, 0);
  const progress = Math.round((completed.length / allItems.length) * 100);
  const level = earnedPoints >= 200 ? "Career Champion" : earnedPoints >= 100 ? "Rising Pro" : earnedPoints >= 50 ? "On Track" : "Getting Started";
  const levelIcon = earnedPoints >= 200 ? "🏆" : earnedPoints >= 100 ? "⭐" : earnedPoints >= 50 ? "🚀" : "🌱";

  const nextUnfinished = allItems.find(i => !completed.includes(i.id));

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-400/20 text-indigo-200 text-xs font-bold border border-indigo-300/20 mb-3">
              <Flame className="w-4 h-4 text-orange-300" /> Internship Readiness Track
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Your Career Roadmap</h1>
            <p className="text-indigo-200 text-sm mt-1.5 max-w-md leading-relaxed">
              Complete milestones, earn points, and level up from student to offer-holder.
            </p>
          </div>

          {/* Progress Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 text-center min-w-[180px]">
            <div className="text-3xl mb-1">{levelIcon}</div>
            <div className="text-xl font-black text-white">{earnedPoints}<span className="text-sm text-indigo-300 font-medium">/{totalPoints} pts</span></div>
            <div className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider mb-3">{level}</div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-400 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-[10px] text-indigo-300 mt-1.5">{completed.length}/{allItems.length} milestones</div>
          </div>
        </div>
      </div>

      {/* Progress Summary Row */}
      <div className="grid grid-cols-4 gap-3">
        {MILESTONES.map(m => {
          const c = COLOR_MAP[m.color];
          const done = m.items.filter(i => completed.includes(i.id)).length;
          const total = m.items.length;
          const pct = Math.round((done / total) * 100);
          return (
            <div key={m.phase} className={`bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 space-y-2 ${done === total ? `ring-2 ${c.ring}` : ""}`}>
              <div className="flex justify-between items-center">
                <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider">{m.phase}</span>
                {done === total && <Trophy className="w-3.5 h-3.5 text-amber-400" />}
              </div>
              <div className={`text-base sm:text-xl font-black ${c.text}`}>{pct}%</div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${c.bg} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
              </div>
              <div className="text-[9px] text-slate-400 font-medium hidden sm:block">{done}/{total} done</div>
            </div>
          );
        })}
      </div>

      {/* Next Action Card */}
      {nextUnfinished && (
        <div className="bg-indigo-600 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <ArrowRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-indigo-200">Next Milestone</p>
              <p className="font-bold text-sm">{nextUnfinished.label}</p>
              <p className="text-[11px] text-indigo-200 mt-0.5">{nextUnfinished.detail}</p>
            </div>
          </div>
          <button
            onClick={() => toggleItem(nextUnfinished.id)}
            className="w-full sm:w-auto shrink-0 px-5 py-2.5 bg-white text-indigo-600 rounded-xl font-black text-xs hover:bg-indigo-50 transition-all shadow-md active:scale-95"
          >
            Mark Complete ✓
          </button>
        </div>
      )}

      {/* Milestone Phases */}
      <div className="space-y-4">
        {MILESTONES.map(milestone => {
          const c = COLOR_MAP[milestone.color];
          const done = milestone.items.filter(i => completed.includes(i.id)).length;
          const isExpanded = expanded.includes(milestone.phase);
          const isComplete = done === milestone.items.length;

          return (
            <div key={milestone.phase} className={`bg-white rounded-2xl border shadow-xs overflow-hidden transition-all ${isComplete ? `border-current ${c.text} ring-1 ring-current/20` : "border-slate-200"}`}>
              {/* Phase Header */}
              <button
                onClick={() => togglePhase(milestone.phase)}
                className="w-full flex items-center gap-4 p-4 sm:p-5 hover:bg-slate-50 transition-colors text-left"
              >
                <div className={`w-10 h-10 shrink-0 rounded-xl ${c.bg} flex items-center justify-center text-white shadow-sm`}>
                  <milestone.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${c.text}`}>{milestone.phase}</span>
                    {isComplete && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-black">Complete 🎉</span>}
                  </div>
                  <div className="font-black text-slate-900 text-sm sm:text-base">{milestone.title}</div>
                  <div className="text-[11px] text-slate-500 hidden sm:block">{milestone.subtitle}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className={`font-black text-sm ${c.text}`}>{done}/{milestone.items.length}</div>
                    <div className="text-[9px] text-slate-400 font-medium">done</div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {/* Items */}
              {isExpanded && (
                <div className="border-t border-slate-100 divide-y divide-slate-50">
                  {milestone.items.map((item, idx) => {
                    const isDone = completed.includes(item.id);
                    const prevDone = idx === 0 || completed.includes(milestone.items[idx - 1].id);
                    const locked = !prevDone && !isDone;
                    return (
                      <button
                        key={item.id}
                        onClick={() => !locked && toggleItem(item.id)}
                        disabled={locked}
                        className={`w-full flex items-start gap-3 p-4 transition-all text-left ${isDone ? `${c.light}` : locked ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50"}`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isDone
                            ? <CheckCircle2 className={`w-5 h-5 ${c.text}`} />
                            : locked
                            ? <Lock className="w-5 h-5 text-slate-300" />
                            : <Circle className="w-5 h-5 text-slate-300" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold leading-tight ${isDone ? "line-through text-slate-400" : "text-slate-900"}`}>{item.label}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{item.detail}</p>
                        </div>
                        <span className={`shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full ${isDone ? "bg-emerald-100 text-emerald-700" : `${c.badge}`}`}>
                          +{item.points}pts
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
