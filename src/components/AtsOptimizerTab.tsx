"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Target, CheckCircle2, AlertTriangle, Building2, Plus, ArrowRight, Zap, Check, Trash2, Edit2, Briefcase } from "lucide-react";

export function AtsOptimizerTab({
  resumes,
  selectedResumeId,
}: {
  resumes: any[];
  selectedResumeId?: string;
}) {
  const [activeResumeId, setActiveResumeId] = useState(selectedResumeId || (resumes[0]?.id || ""));
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [savedApps, setSavedApps] = useState<any[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchSavedApplications();
  }, []);

  const fetchSavedApplications = async () => {
    try {
      const res = await fetch("/api/job-applications");
      if (res.ok) {
        const data = await res.json();
        setSavedApps(data.jobApplications || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const runAtsAnalysis = async () => {
    if (!activeResumeId) return;
    setAnalyzing(true);
    setResults(null);

    try {
      // 1. Fetch full resume content
      const fullRes = await fetch(`/api/resumes/${activeResumeId}`);
      const resumeData = await fullRes.json();

      // 2. Analyze
      const analyzeRes = await fetch("/api/ats-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData,
          jobDescription,
        }),
      });

      const resData = await analyzeRes.json();
      setResults(resData);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveMatch = async () => {
    if (!results) return;
    try {
      const res = await fetch("/api/job-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: activeResumeId,
          companyName: companyName || "Target Company",
          jobTitle: jobTitle || "Role Application",
          jobDescription,
          matchScore: results.atsScore,
          missingKeywords: results.missingKeywords,
          matchedKeywords: results.matchedKeywords,
          status: "applied",
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
        fetchSavedApplications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    try {
      await fetch(`/api/job-applications/${appId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchSavedApplications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteApp = async (appId: string) => {
    if (confirm("Remove this target application from tracker?")) {
      try {
        await fetch(`/api/job-applications/${appId}`, { method: "DELETE" });
        fetchSavedApplications();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "interviewing":
        return "bg-amber-100 text-amber-900 border-amber-200";
      case "offer":
        return "bg-emerald-100 text-emerald-900 border-emerald-200";
      case "rejected":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "applied":
      default:
        return "bg-indigo-100 text-indigo-900 border-indigo-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-400/20 mb-3">
          <Zap className="w-3.5 h-3.5 text-amber-300" /> Real-Time ATS Match Diagnosis & Application Tracker
        </div>
        <h1 className="text-2xl font-extrabold">Tailor Resume to Target Job</h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
          Paste a target internship or job posting description to scan keyword alignment, action verb density, and score ATS compliance before submitting.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Resume Selector & Job Description Input (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" /> Target Job Details
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Resume to Analyze</label>
            <select
              value={activeResumeId}
              onChange={(e) => setActiveResumeId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.targetRole || "General"})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                placeholder="e.g. Stripe, Goldman Sachs, NIH"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title / Role</label>
              <input
                type="text"
                placeholder="e.g. SWE Intern 2026"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Paste Job Description</label>
            <textarea
              rows={8}
              placeholder="Paste the full job description requirements here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full p-3 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
            />
          </div>

          <button
            onClick={runAtsAnalysis}
            disabled={analyzing}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <span>Running ATS Keyword Diagnostic...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" /> Analyze ATS Keyword Match
              </>
            )}
          </button>
        </div>

        {/* Right Results Breakdown (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {results ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              {/* Score Meter Header */}
              <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <div>
                  <span className="text-xs font-bold text-indigo-900">Calculated Match Index</span>
                  <div className="text-3xl font-black text-indigo-950 mt-0.5">{results.atsScore}%</div>
                </div>

                <div className="text-right">
                  <button
                    onClick={handleSaveMatch}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Plus className="w-4 h-4" />}
                    {savedSuccess ? "Saved to Tracker!" : "Save Application Match"}
                  </button>
                </div>
              </div>

              {/* Matched Keywords */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Matched Job Keywords ({results.matchedKeywords?.length || 0})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {results.matchedKeywords?.map((kw: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      ✓ {kw}
                    </span>
                  ))}
                  {results.matchedKeywords?.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No exact matches found.</p>
                  )}
                </div>
              </div>

              {/* Missing Keywords */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Missing Key Terms ({results.missingKeywords?.length || 0})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {results.missingKeywords?.map((kw: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Verbs Found */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 mb-1">High-Impact Power Verbs Detected</h4>
                <div className="flex flex-wrap gap-1">
                  {results.matchedVerbs?.map((v: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 text-[10px] font-mono bg-indigo-100 text-indigo-800 rounded font-bold">
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-2">Tailoring Recommendations</h3>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {results.recommendations?.map((rec: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
              <Target className="w-12 h-12 text-indigo-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Ready for Diagnostic</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select a resume on the left and paste any target job description to reveal your ATS match score and keyword gap analysis.
              </p>
            </div>
          )}

          {/* Saved Applications Application Tracker Table */}
          {savedApps.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-indigo-600" /> Target Application Tracker ({savedApps.length})
                </h3>
              </div>

              <div className="space-y-2.5">
                {savedApps.map((app) => (
                  <div key={app.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="font-bold text-sm text-slate-900">{app.companyName}</div>
                        <div className="text-xs text-slate-600 font-medium">{app.jobTitle}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                          {app.matchScore}% Match
                        </span>
                        <button
                          onClick={() => handleDeleteApp(app.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Delete application"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                      <span className="text-[10px] text-slate-400">Status:</span>
                      <select
                        value={app.status}
                        onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border cursor-pointer focus:outline-none ${getStatusBadgeClass(app.status)}`}
                      >
                        <option value="applied">Applied</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="offer">Offer Received 🎉</option>
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
