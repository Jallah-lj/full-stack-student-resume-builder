"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles, Target, CheckCircle2, AlertTriangle, Plus, ArrowRight,
  Zap, Check, Trash2, Briefcase, FileText,
} from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { api, errorMessage } from "@/lib/client-api";

interface AtsResult {
  atsScore: number;
  breakdown: { actionVerbs: number; quantification: number; structure: number; keywords: number };
  matchedVerbs: string[];
  quantifiedMetricsCount: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  recommendations: string[];
}

interface JobApp {
  id: string;
  companyName: string;
  jobTitle: string;
  matchScore: number;
  status: string;
  resumeTitle: string | null;
  createdAt: string;
}

const STATUS_CLASS: Record<string, string> = {
  interviewing: "bg-amber-100 text-amber-900 border-amber-200",
  offer: "bg-emerald-100 text-emerald-900 border-emerald-200",
  rejected: "bg-rose-100 text-rose-800 border-rose-200",
  applied: "bg-indigo-100 text-indigo-900 border-indigo-200",
  draft: "bg-slate-100 text-slate-700 border-slate-200",
};

export function AtsOptimizerTab() {
  const { resumes, refreshResumes } = useApp();

  const [chosenResumeId, setChosenResumeId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<AtsResult | null>(null);
  const [savedApps, setSavedApps] = useState<JobApp[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState("");

  // Derive the active resume so the first one is preselected without an effect.
  const activeResumeId = chosenResumeId || resumes[0]?.id || "";

  const fetchSavedApplications = useCallback(async () => {
    const data = await api.get<{ jobApplications: JobApp[] }>("/api/job-applications");
    setSavedApps(data.jobApplications || []);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await api.get<{ jobApplications: JobApp[] }>("/api/job-applications");
        if (!cancelled) setSavedApps(data.jobApplications || []);
      } catch (err) {
        if (!cancelled) setError(errorMessage(err, "Couldn't load your application tracker."));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const runAtsAnalysis = async () => {
    if (!activeResumeId) return;
    setAnalyzing(true);
    setResults(null);
    setError("");
    try {
      // The server loads the resume itself, so the score always reflects saved data.
      const data = await api.post<AtsResult>("/api/ats-analyze", {
        resumeId: activeResumeId,
        jobDescription,
        companyName,
        jobTitle,
      });
      setResults(data);
      // The scan persists a new score — keep the sidebar/cards in sync.
      await refreshResumes();
    } catch (err) {
      setError(errorMessage(err, "ATS analysis failed."));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveMatch = async () => {
    if (!results) return;
    setSaving(true);
    setError("");
    try {
      await api.post("/api/job-applications", {
        resumeId: activeResumeId,
        companyName: companyName || "Target Company",
        jobTitle: jobTitle || "Role Application",
        jobDescription,
        matchScore: results.atsScore,
        missingKeywords: results.missingKeywords,
        matchedKeywords: results.matchedKeywords,
        status: "applied",
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
      await fetchSavedApplications();
    } catch (err) {
      setError(errorMessage(err, "Couldn't save this application."));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    // Optimistic update, rolled back on failure.
    const prev = savedApps;
    setSavedApps((apps) => apps.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)));
    try {
      await api.put(`/api/job-applications/${appId}`, { status: newStatus });
    } catch (err) {
      setSavedApps(prev);
      setError(errorMessage(err, "Couldn't update the status."));
    }
  };

  const handleDeleteApp = async (appId: string) => {
    const prev = savedApps;
    setSavedApps((apps) => apps.filter((a) => a.id !== appId));
    try {
      await api.del(`/api/job-applications/${appId}`);
    } catch (err) {
      setSavedApps(prev);
      setError(errorMessage(err, "Couldn't remove the application."));
    }
  };

  if (resumes.length === 0) {
    return <EmptyResumes />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-400/20 mb-3">
          <Zap className="w-3.5 h-3.5 text-amber-300" /> Real-time ATS diagnosis &amp; application tracker
        </div>
        <h1 className="text-2xl font-extrabold">Tailor Resume to Target Job</h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
          Paste a target internship or job description to scan keyword alignment, action-verb density and ATS
          compliance before you submit.
        </p>
      </div>

      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Target Job Details
          </h2>

          <div>
            <label htmlFor="ats-resume" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select resume to analyze
            </label>
            <select id="ats-resume" value={activeResumeId} onChange={(e) => setChosenResumeId(e.target.value)} className={INPUT}>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.targetRole || "General"})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ats-company" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Company name</label>
              <input id="ats-company" type="text" placeholder="e.g. Stripe, Goldman Sachs" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={INPUT} />
            </div>
            <div>
              <label htmlFor="ats-title" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Job title / role</label>
              <input id="ats-title" type="text" placeholder="e.g. SWE Intern 2026" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className={INPUT} />
            </div>
          </div>

          <div>
            <label htmlFor="ats-jd" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Paste job description</label>
            <textarea
              id="ats-jd"
              rows={8}
              placeholder="Paste the full job requirements here…"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full p-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
            />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              Optional — without it you still get a structure and impact score.
            </p>
          </div>

          <button
            onClick={runAtsAnalysis}
            disabled={analyzing || !activeResumeId}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Running ATS diagnostic…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" /> Analyze ATS keyword match
              </>
            )}
          </button>
        </div>

        {/* Results */}
        <div className="lg:col-span-6 space-y-4">
          {results ? (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-100 dark:border-indigo-900/60 gap-3">
                <div>
                  <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">Calculated match index</span>
                  <div className="text-3xl font-black text-indigo-950 dark:text-white mt-0.5">{results.atsScore}%</div>
                </div>
                <button
                  onClick={handleSaveMatch}
                  disabled={saving}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-60"
                >
                  {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Plus className="w-4 h-4" />}
                  {savedSuccess ? "Saved to tracker!" : saving ? "Saving…" : "Save application match"}
                </button>
              </div>

              {/* Score breakdown */}
              <div className="grid grid-cols-4 gap-2">
                <Breakdown label="Verbs" value={results.breakdown.actionVerbs} max={25} />
                <Breakdown label="Metrics" value={results.breakdown.quantification} max={25} />
                <Breakdown label="Structure" value={results.breakdown.structure} max={30} />
                <Breakdown label="Keywords" value={results.breakdown.keywords} max={20} />
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Matched keywords ({results.matchedKeywords.length})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {results.matchedKeywords.map((kw) => (
                    <span key={kw} className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                      ✓ {kw}
                    </span>
                  ))}
                  {results.matchedKeywords.length === 0 && <p className="text-xs text-slate-400 dark:text-slate-500 italic">No exact matches found.</p>}
                </div>
              </div>

              {results.missingKeywords.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Missing key terms ({results.missingKeywords.length})
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {results.missingKeywords.map((kw) => (
                      <span key={kw} className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {results.matchedVerbs.length > 0 && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">High-impact power verbs detected</h4>
                  <div className="flex flex-wrap gap-1">
                    {results.matchedVerbs.map((v) => (
                      <span key={v} className="px-2 py-0.5 text-[10px] font-mono bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 rounded font-bold">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2">Tailoring recommendations</h3>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {results.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-700">
                      <ArrowRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <Target className="w-12 h-12 text-indigo-300 dark:text-indigo-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Ready for diagnostic</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Select a resume and paste any target job description to reveal your ATS match score and keyword gaps.
              </p>
            </div>
          )}

          {/* Tracker */}
          {savedApps.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Application tracker ({savedApps.length})
              </h3>

              <div className="space-y-2.5">
                {savedApps.map((app) => (
                  <div key={app.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{app.companyName}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate">{app.jobTitle}</div>
                        {app.resumeTitle && <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">via {app.resumeTitle}</div>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 px-2 py-0.5 rounded">
                          {app.matchScore}% match
                        </span>
                        <button onClick={() => handleDeleteApp(app.id)} className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1" title="Delete application">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700 text-xs">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">Status</span>
                      <select
                        value={app.status}
                        onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                        aria-label={`Status for ${app.companyName}`}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border cursor-pointer focus:outline-none ${STATUS_CLASS[app.status] || STATUS_CLASS.applied}`}
                      >
                        <option value="applied">Applied</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="offer">Offer received 🎉</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const INPUT =
  "w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none";

function Breakdown({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
      <div className="text-sm font-black text-slate-900 dark:text-white">
        {value}
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">/{max}</span>
      </div>
      <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">{label}</div>
    </div>
  );
}

export function EmptyResumes({
  title = "You need a resume first",
  body = "Create a resume and this tool will have something to work with.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 p-10 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto">
        <FileText className="w-8 h-8 text-slate-400 dark:text-slate-500" />
      </div>
      <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">{title}</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">{body}</p>
      <Link href="/resumes" className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors">
        Go to My Resumes
      </Link>
    </div>
  );
}
