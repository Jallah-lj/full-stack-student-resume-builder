"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  GraduationCap, Briefcase, FolderKanban, Award, Sparkles, Layers,
  Printer, Share2, Trash2, Plus, Wand2, Settings, Eye, Check,
  ExternalLink, RefreshCw, AlertTriangle, Download,
} from "lucide-react";
import { ResumeTemplateDispatcher } from "./resume-templates/ResumeTemplateDispatcher";
import { useApp } from "@/components/providers/AppProvider";
import { api, errorMessage } from "@/lib/client-api";

const SUB_TABS = [
  { id: "settings",   label: "Design",    icon: Settings },
  { id: "education",  label: "Education", icon: GraduationCap },
  { id: "work",       label: "Work",      icon: Briefcase },
  { id: "projects",   label: "Projects",  icon: FolderKanban },
  { id: "extra",      label: "Leadership",icon: Award },
  { id: "skills",     label: "Skills",    icon: Layers },
];

export function ResumeBuilderTab({ resumeId }: { resumeId: string }) {
  const { refreshResumes } = useApp();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeSubTab, setActiveSubTab] = useState("settings");
  const [copiedLink, setCopiedLink] = useState(false);
  const [savingStatus, setSavingStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [enhancingBullet, setEnhancingBullet] = useState<{ id: string; index: number } | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const fetchResumeData = useCallback(async () => {
    if (!resumeId) return;
    try {
      const payload = await api.get<any>(`/api/resumes/${resumeId}`);
      setData(payload);
      setLoadError("");
    } catch (err) {
      setLoadError(errorMessage(err, "Couldn't load this resume."));
    } finally {
      setLoading(false);
    }
  }, [resumeId]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const payload = await api.get<any>(`/api/resumes/${resumeId}`);
        if (cancelled) return;
        setData(payload);
        setLoadError("");
      } catch (err) {
        if (!cancelled) setLoadError(errorMessage(err, "Couldn't load this resume."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [resumeId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-2xl border border-slate-200">
      <RefreshCw className="w-7 h-7 text-indigo-600 animate-spin mb-2" />
      <p className="text-xs text-slate-500">Loading Resume Studio...</p>
    </div>
  );

  if (loadError || !data) return (
    <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-2xl border border-slate-200 text-center p-8 gap-3">
      <AlertTriangle className="w-8 h-8 text-rose-500" />
      <p className="text-sm font-bold text-slate-800">{loadError || "Resume unavailable."}</p>
      <button onClick={() => { setLoading(true); void fetchResumeData(); }} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700">
        Try again
      </button>
    </div>
  );

  const { resume, user, education, workExperiences, projects, extracurriculars, skills } = data;

  const updateSettings = async (updates: any) => {
    setSavingStatus("saving");
    setData((prev: any) => ({ ...prev, resume: { ...prev.resume, ...updates } }));
    try {
      await api.put(`/api/resumes/${resumeId}`, updates);
      setSavingStatus("saved");
      setTimeout(() => setSavingStatus("idle"), 1500);
      await refreshResumes();
    } catch { setSavingStatus("idle"); }
  };

  const handleAddSection = async (type: string) => {
    const defaults: Record<string, any> = {
      education:       { institution: "New University", degree: "Bachelor of Science", major: "Computer Science", endDate: "Expected 2026" },
      work:            { company: "Company Name", role: "Intern / Specialist", startDate: "May 2025", endDate: "Aug 2025", bullets: ["Key contribution"] },
      projects:        { title: "New Project", roleOrTechnologies: "React, Node.js", bullets: ["Built full-stack prototype"] },
      extracurriculars:{ organization: "Campus Club", role: "Officer", date: "2024 - Present", bullets: ["Led events and members"] },
      skills:          { category: "New Skills", skillsList: "Tool 1, Tool 2, Tool 3" },
    };
    await api.post(`/api/resumes/${resumeId}/sections`, { sectionType: type, data: defaults[type] || {} });
    await fetchResumeData();
  };

  const handleUpdateItem = async (type: string, itemId: string, updates: any) => {
    setSavingStatus("saving");
    const keyMap: Record<string, string> = { education: "education", work: "workExperiences", projects: "projects", extracurriculars: "extracurriculars", skills: "skills" };
    setData((prev: any) => {
      const listKey = keyMap[type];
      return listKey ? { ...prev, [listKey]: prev[listKey].map((i: any) => i.id === itemId ? { ...i, ...updates } : i) } : prev;
    });
    try {
      await api.put(`/api/sections/${type}/${itemId}`, updates);
      setSavingStatus("saved");
      setTimeout(() => setSavingStatus("idle"), 1500);
    } catch { setSavingStatus("idle"); }
  };

  const handleDeleteItem = async (type: string, itemId: string) => {
    await api.del(`/api/sections/${type}/${itemId}`);
    await fetchResumeData();
  };

  const parseBulletsArr = (b: string) => { try { return JSON.parse(b); } catch { return [b]; } };

  const triggerAi = async (text: string, id: string, idx: number) => {
    setEnhancingBullet({ id, index: idx }); setAiLoading(true);
    try {
      const res = await api.post<{ suggestions: string[] }>("/api/ai/enhance-bullet", {
        bulletText: text,
        domain: resume?.targetRole?.toLowerCase().includes("data") ? "data" : "tech",
      });
      setAiSuggestions(res.suggestions || []);
    } catch { setAiSuggestions([]); } finally { setAiLoading(false); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/r/${resume.shareSlug}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const BulletEditor = ({ type, item }: { type: string; item: any }) => {
    const bullets = parseBulletsArr(item.bullets);
    const updateBullet = (idx: number, val: string) => {
      const updated = [...bullets]; updated[idx] = val;
      handleUpdateItem(type, item.id, { bullets: updated });
    };
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Bullet Points</label>
          <button type="button" onClick={() => handleUpdateItem(type, item.id, { bullets: [...bullets, "New achievement"] })} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">+ Add</button>
        </div>
        {bullets.map((b: string, idx: number) => (
          <div key={idx} className="space-y-1">
            <div className="flex gap-1.5">
              <textarea rows={2} value={b} onChange={(e) => updateBullet(idx, e.target.value)}
                className="flex-1 text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500 outline-none resize-none" />
              <div className="flex flex-col gap-1">
                <button type="button" onClick={() => triggerAi(b, item.id, idx)} title="AI Enhance"
                  className="p-1.5 rounded bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
                  <Wand2 className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => handleUpdateItem(type, item.id, { bullets: bullets.filter((_: any, i: number) => i !== idx) })}
                  className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            {enhancingBullet?.id === item.id && enhancingBullet?.index === idx && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-100 dark:border-indigo-900/60 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-200 flex items-center gap-1"><Sparkles className="w-3 h-3" />AI Suggestions</span>
                  <button type="button" onClick={() => setEnhancingBullet(null)} className="text-[10px] text-slate-400 dark:text-slate-500">Close</button>
                </div>
                {aiLoading ? <p className="text-[10px] text-slate-400 dark:text-slate-500 animate-pulse">Generating...</p> : (
                  <div className="space-y-1">
                    {aiSuggestions.map((s, i) => (
                      <button key={i} type="button" onClick={() => { updateBullet(idx, s); setEnhancingBullet(null); }}
                        className="w-full text-left p-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/60 border border-indigo-100 dark:border-indigo-900/60 text-[10px] text-slate-800 dark:text-slate-200">
                        💡 {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-none">{resume.title}</h1>
              {savingStatus === "saving" && <span className="text-[9px] bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">Saving...</span>}
              {savingStatus === "saved"  && <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">Saved ✓</span>}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{user.name} · {resume.targetRole}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Mobile preview toggle */}
            <button onClick={() => setShowPreview(!showPreview)}
              className="lg:hidden px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> {showPreview ? "Editor" : "Preview"}
            </button>
            <a href={`/r/${resume.shareSlug}`} target="_blank" rel="noreferrer"
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> <span className="hidden sm:inline">View</span>
            </a>
            <button onClick={copyLink} className="px-3 py-2 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5">
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? "Copied!" : "Share"}</span>
            </button>
            <a href={`/api/resumes/${resumeId}/export`} download
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Backup JSON</span>
            </a>
            <button onClick={() => window.print()}
              className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5">
              <Printer className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Editor Panel */}
        <div className={`lg:col-span-6 space-y-4 ${showPreview ? "hidden lg:block" : "block"}`}>
          {/* Sub-tabs (scrollable on mobile) */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto no-scrollbar border border-slate-200/80 dark:border-slate-700">
            {SUB_TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveSubTab(id)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg whitespace-nowrap text-[11px] font-bold transition-all ${
                  activeSubTab === id ? "bg-white dark:bg-slate-900 text-indigo-900 dark:text-indigo-300 shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"}`}>
                <Icon className="w-3.5 h-3.5 shrink-0" />{label}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">

            {/* SETTINGS */}
            {activeSubTab === "settings" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Design & Formatting</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">Resume Title</label>
                    <input type="text" value={resume.title} onChange={(e) => updateSettings({ title: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">Target Position</label>
                    <input type="text" value={resume.targetRole || ""} onChange={(e) => updateSettings({ targetRole: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">Template</label>
                    <select value={resume.template} onChange={(e) => updateSettings({ template: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option value="modern_tech">Modern Tech</option>
                      <option value="ivy_league">Ivy League</option>
                      <option value="minimal_corp">Minimal Corp</option>
                      <option value="academic_research">Academic CV</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">Color Theme</label>
                    <select value={resume.colorTheme} onChange={(e) => updateSettings({ colorTheme: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option value="navy">Navy Blue</option>
                      <option value="emerald">Emerald</option>
                      <option value="burgundy">Burgundy</option>
                      <option value="slate">Slate</option>
                      <option value="purple">Purple</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">Font Family</label>
                    <select value={resume.fontFamily} onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option value="inter">Inter</option>
                      <option value="serif">Serif</option>
                      <option value="garamond">Garamond</option>
                      <option value="roboto">Roboto</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {[
                    { key: "showGpa", label: "Show GPA", val: resume.showGpa },
                    { key: "showCoursework", label: "Show Coursework", val: resume.showCoursework },
                    { key: "showProjectsFirst", label: "Projects Before Experience", val: resume.showProjectsFirst },
                  ].map(({ key, label, val }) => (
                    <label key={key} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{label}</span>
                      <input type="checkbox" checked={val} onChange={(e) => updateSettings({ [key]: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* EDUCATION */}
            {activeSubTab === "education" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Education</h3>
                  <button onClick={() => handleAddSection("education")} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1"><Plus className="w-3.5 h-3.5" />Add</button>
                </div>
                {education.map((edu: any) => (
                  <div key={edu.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-3 relative">
                    <button onClick={() => handleDeleteItem("education", edu.id)} className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                    {[
                      { label: "Institution", field: "institution", val: edu.institution },
                      { label: "Degree", field: "degree", val: edu.degree },
                      { label: "Major", field: "major", val: edu.major },
                      { label: "End Date", field: "endDate", val: edu.endDate },
                      { label: "GPA", field: "gpa", val: edu.gpa },
                      { label: "Coursework", field: "coursework", val: edu.coursework },
                    ].map(({ label, field, val }) => (
                      <div key={field}>
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">{label}</label>
                        <input type="text" value={val || ""} onChange={(e) => handleUpdateItem("education", edu.id, { [field]: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* WORK */}
            {activeSubTab === "work" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Work & Internships</h3>
                  <button onClick={() => handleAddSection("work")} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1"><Plus className="w-3.5 h-3.5" />Add</button>
                </div>
                {workExperiences.map((w: any) => (
                  <div key={w.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-3 relative">
                    <button onClick={() => handleDeleteItem("work", w.id)} className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[["Company", "company", w.company], ["Role", "role", w.role], ["Start Date", "startDate", w.startDate], ["End Date", "endDate", w.endDate]].map(([label, field, val]) => (
                        <div key={field as string}>
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">{label as string}</label>
                          <input type="text" value={(val as string) || ""} onChange={(e) => handleUpdateItem("work", w.id, { [field as string]: e.target.value })}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" />
                        </div>
                      ))}
                    </div>
                    <BulletEditor type="work" item={w} />
                  </div>
                ))}
              </div>
            )}

            {/* PROJECTS */}
            {activeSubTab === "projects" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Projects</h3>
                  <button onClick={() => handleAddSection("projects")} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1"><Plus className="w-3.5 h-3.5" />Add</button>
                </div>
                {projects.map((p: any) => (
                  <div key={p.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-3 relative">
                    <button onClick={() => handleDeleteItem("projects", p.id)} className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                    {[["Title", "title", p.title], ["Tech Stack", "roleOrTechnologies", p.roleOrTechnologies], ["Link", "link", p.link], ["Date", "date", p.date]].map(([label, field, val]) => (
                      <div key={field as string}>
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">{label as string}</label>
                        <input type="text" value={(val as string) || ""} onChange={(e) => handleUpdateItem("projects", p.id, { [field as string]: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" />
                      </div>
                    ))}
                    <BulletEditor type="projects" item={p} />
                  </div>
                ))}
              </div>
            )}

            {/* LEADERSHIP */}
            {activeSubTab === "extra" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Leadership</h3>
                  <button onClick={() => handleAddSection("extracurriculars")} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1"><Plus className="w-3.5 h-3.5" />Add</button>
                </div>
                {extracurriculars.map((ex: any) => (
                  <div key={ex.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-3 relative">
                    <button onClick={() => handleDeleteItem("extracurriculars", ex.id)} className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                    {[["Organization", "organization", ex.organization], ["Role", "role", ex.role], ["Date", "date", ex.date]].map(([label, field, val]) => (
                      <div key={field as string}>
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">{label as string}</label>
                        <input type="text" value={(val as string) || ""} onChange={(e) => handleUpdateItem("extracurriculars", ex.id, { [field as string]: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* SKILLS */}
            {activeSubTab === "skills" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Skills</h3>
                  <button onClick={() => handleAddSection("skills")} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1"><Plus className="w-3.5 h-3.5" />Add</button>
                </div>
                {skills.map((s: any) => (
                  <div key={s.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-2 relative">
                    <button onClick={() => handleDeleteItem("skills", s.id)} className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">Category</label>
                      <input type="text" value={s.category} onChange={(e) => handleUpdateItem("skills", s.id, { category: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">Skills List</label>
                      <input type="text" value={s.skillsList} onChange={(e) => handleUpdateItem("skills", s.id, { skillsList: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className={`lg:col-span-6 ${!showPreview ? "hidden lg:block" : "block"}`}>
          <div className="bg-slate-900 p-3 sm:p-4 rounded-2xl shadow-lg border border-slate-800 sticky top-20">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" /> Live Preview
              </span>
              <span className="text-[10px] text-slate-500 font-mono hidden sm:block">Real-Time Sync</span>
            </div>
            <div className="bg-slate-200/30 p-2 sm:p-3 rounded-xl overflow-y-auto max-h-[60vh] sm:max-h-[70vh] thin-scrollbar">
              <div className="transform scale-[0.6] sm:scale-[0.75] lg:scale-[0.85] origin-top">
                <ResumeTemplateDispatcher data={data} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
