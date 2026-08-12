"use client";

import React, { useState } from "react";
import { Sparkles, Wand2, Copy, Check, Search, BookOpen, Layers, Zap, RefreshCw } from "lucide-react";
import { api, errorMessage } from "@/lib/client-api";

const ACTION_VERB_CATEGORIES = [
  {
    category: "Software & Engineering",
    color: "bg-indigo-50 border-indigo-100 text-indigo-700",
    hover: "hover:bg-indigo-100 hover:border-indigo-300",
    verbs: ["Architected","Engineered","Optimized","Refactored","Deployed","Benchmarked","Automated","Containerized","Debugged","Integrated","Programmed","Migrated","Scaled","Modularized"],
  },
  {
    category: "Leadership & Strategy",
    color: "bg-purple-50 border-purple-100 text-purple-700",
    hover: "hover:bg-purple-100 hover:border-purple-300",
    verbs: ["Spearheaded","Orchestrated","Directed","Pioneered","Championed","Facilitated","Mobilized","Managed","Accelerated","Mentored","Established","Coordinated","Cultivated","Galvanized"],
  },
  {
    category: "Research & Analysis",
    color: "bg-emerald-50 border-emerald-100 text-emerald-700",
    hover: "hover:bg-emerald-100 hover:border-emerald-300",
    verbs: ["Formulated","Synthesized","Quantified","Published","Evaluated","Audited","Investigated","Extracted","Modeled","Discovered","Correlated","Validated","Simulated","Hypothesized"],
  },
  {
    category: "Finance & Quantitative",
    color: "bg-amber-50 border-amber-100 text-amber-700",
    hover: "hover:bg-amber-100 hover:border-amber-300",
    verbs: ["Valued","Forecasted","Structured","Negotiated","Allocated","Mitigated","Reconciled","Maximized","Underwrote","Projected","Modeled","Analyzed","Diversified","Hedged"],
  },
  {
    category: "Design & Communications",
    color: "bg-rose-50 border-rose-100 text-rose-700",
    hover: "hover:bg-rose-100 hover:border-rose-300",
    verbs: ["Conceptualized","Authored","Standardized","Redesigned","Illustrated","Presented","Drafted","Curated","Publicized","Tailored","Transformed","Storyboarded","Prototyped","Revamped"],
  },
  {
    category: "Operations & Management",
    color: "bg-slate-50 border-slate-200 text-slate-700",
    hover: "hover:bg-slate-100 hover:border-slate-300",
    verbs: ["Streamlined","Executed","Launched","Delivered","Oversaw","Supervised","Delegated","Implemented","Restructured","Administered","Tracked","Reduced","Improved","Achieved"],
  },
];

const DOMAINS = [
  { id: "tech",       label: "🖥️ Software / Tech" },
  { id: "finance",    label: "📈 Finance / Business" },
  { id: "healthcare", label: "🔬 Clinical / Pre-Med" },
  { id: "general",    label: "🎯 Leadership / General" },
];

export function AiToolsTab() {
  const [inputText, setInputText] = useState("");
  const [domain, setDomain] = useState("tech");
  const [suggestions, setSuggestions] = useState<{
    original: string;
    suggestions: string[];
    extractedTech?: string[];
    detectedVerb?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedVerb, setCopiedVerb] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleEnhance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.post<{
        original: string;
        suggestions: string[];
        extractedTech?: string[];
        detectedVerb?: string;
      }>("/api/ai/enhance-bullet", {
        bulletText: inputText,
        domain,
      });
      setSuggestions(data);
    } catch (err) {
      setError(errorMessage(err, "Couldn't enhance that bullet."));
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyVerb = (verb: string) => {
    navigator.clipboard.writeText(verb);
    setCopiedVerb(verb);
    setTimeout(() => setCopiedVerb(null), 2000);
  };

  const filteredCategories = ACTION_VERB_CATEGORIES.map(cat => ({
    ...cat,
    verbs: cat.verbs.filter(v =>
      v.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (activeCategory === null || activeCategory === cat.category)
    ),
  })).filter(cat => cat.verbs.length > 0);

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-400/20 text-purple-200 text-xs font-bold border border-purple-300/20 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-purple-200" /> AI Bullet Enhancement Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Bullet Point Power-Up</h1>
          <p className="text-purple-100 text-xs sm:text-sm mt-1.5 max-w-lg leading-relaxed">
            Transform weak resume statements into high-impact, ATS-optimized accomplishment bullets in seconds.
          </p>
        </div>
      </div>

      {/* Enhancer Tool */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <Wand2 className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Interactive Bullet Enhancer
        </h2>

        <form onSubmit={handleEnhance} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1.5">Your Draft Bullet</label>
            <textarea
              rows={2}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="e.g. Built a React website for campus club members to track attendance with Python backend"
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 outline-none resize-none transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1.5">Target Domain</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DOMAINS.map(d => (
                <button key={d.id} type="button" onClick={() => setDomain(d.id)}
                  className={`py-2.5 px-3 rounded-xl border text-[11px] font-bold transition-all ${domain === d.id ? "bg-purple-600 text-white border-purple-600 shadow-sm" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-300"}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-xs font-semibold rounded-xl border border-rose-200 dark:border-rose-900/60">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading || !inputText.trim()}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2">
            {loading ? <><RefreshCw className="w-4 h-4 animate-spin" />Enhancing...</> : <><Wand2 className="w-4 h-4" />Enhance Bullet</>}
          </button>
        </form>

        {/* Output */}
        {suggestions && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">AI-Generated Power Variations</h3>
              </div>
              {suggestions.extractedTech && suggestions.extractedTech.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Detected Tech:</span>
                  {suggestions.extractedTech.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Original */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Original Draft</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 italic">{suggestions.original}</p>
            </div>

            {/* Enhanced Versions */}
            <div className="space-y-2">
              {suggestions.suggestions.map((sug, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 group">
                  <div className="w-5 h-5 shrink-0 rounded-full bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-[10px] font-black text-purple-700 dark:text-purple-300 mt-0.5">{i + 1}</div>
                  <p className="flex-1 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">{sug}</p>
                  <button onClick={() => copyText(sug, i)}
                    className="shrink-0 p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors opacity-0 group-hover:opacity-100">
                    {copiedIndex === i ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Verb Dictionary */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> 150+ Power Verbs Dictionary
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Click any verb to copy instantly to clipboard.</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-52">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input type="text" placeholder="Search verbs..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            {activeCategory && (
              <button onClick={() => setActiveCategory(null)} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap">Clear</button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5">
          {ACTION_VERB_CATEGORIES.map(cat => (
            <button key={cat.category} onClick={() => setActiveCategory(activeCategory === cat.category ? null : cat.category)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${activeCategory === cat.category ? "bg-indigo-600 text-white border-indigo-600" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300"}`}>
              {cat.category}
            </button>
          ))}
        </div>

        {copiedVerb && (
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-xl border border-emerald-200 dark:border-emerald-900/60 text-center animate-fade-in-up">
            ✓ Copied &quot;{copiedVerb}&quot; to clipboard!
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredCategories.map((cat, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <h3 className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">{cat.category}</h3>
              <div className="flex flex-wrap gap-1.5">
                {cat.verbs.map((verb, vIdx) => (
                  <button key={vIdx} onClick={() => copyVerb(verb)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all shadow-2xs ${cat.color} ${cat.hover}`}>
                    {verb}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-medium">No verbs match &quot;{searchTerm}&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
}
