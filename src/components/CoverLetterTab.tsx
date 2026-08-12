"use client";

import React, { useState } from "react";
import { Sparkles, FileText, Copy, Check, Download, RefreshCw, AlertTriangle } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { api, errorMessage } from "@/lib/client-api";
import { EmptyResumes } from "@/components/AtsOptimizerTab";

export function CoverLetterTab() {
  const { resumes, user } = useApp();

  const [chosenResumeId, setChosenResumeId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  // Derive the active resume so the first one is preselected without an effect.
  const selectedResumeId = chosenResumeId || resumes[0]?.id || "";

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeId) return;
    setGenerating(true);
    setError("");
    try {
      const data = await api.post<{ coverLetter: string }>("/api/ai/cover-letter", {
        resumeId: selectedResumeId,
        companyName,
        jobTitle,
        jobDescription,
      });
      setGeneratedLetter(data.coverLetter || "");
    } catch (err) {
      setError(errorMessage(err, "Couldn't generate the cover letter."));
    } finally {
      setGenerating(false);
    }
  };

  const copyLetter = async () => {
    if (!generatedLetter) return;
    try {
      await navigator.clipboard.writeText(generatedLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Clipboard access was blocked — select the text and copy manually.");
    }
  };

  /** Download the letter as a .txt file the student can attach or paste. */
  const downloadLetter = () => {
    const blob = new Blob([generatedLetter], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const slug = [user?.name, companyName, jobTitle]
      .filter(Boolean)
      .join("-")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    a.href = url;
    a.download = `${slug || "cover-letter"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (resumes.length === 0) {
    return (
      <EmptyResumes
        title="Create a resume first"
        body="The cover letter generator pulls your education, experience and skills from a saved resume."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold border border-indigo-400/20 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-indigo-300" /> AI internship cover letter generator
        </div>
        <h1 className="text-2xl font-extrabold">Tailored Cover Letter Generator</h1>
        <p className="text-indigo-200 text-xs sm:text-sm mt-1 max-w-xl">
          Draft professional cover letters built from your real resume content and the role you&apos;re targeting.
        </p>
      </div>

      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" /> Application context
          </h2>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label htmlFor="cl-resume" className="block text-xs font-semibold text-slate-700 mb-1">Source resume</label>
              <select id="cl-resume" value={selectedResumeId} onChange={(e) => setChosenResumeId(e.target.value)} className={INPUT}>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.targetRole || "General"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="cl-company" className="block text-xs font-semibold text-slate-700 mb-1">Target company *</label>
              <input
                id="cl-company"
                type="text"
                required
                placeholder="e.g. Google, McKinsey, Johns Hopkins Lab"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className={INPUT}
              />
            </div>

            <div>
              <label htmlFor="cl-role" className="block text-xs font-semibold text-slate-700 mb-1">Target role title *</label>
              <input
                id="cl-role"
                type="text"
                required
                placeholder="e.g. Software Engineering Intern, Summer 2026"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className={INPUT}
              />
            </div>

            <div>
              <label htmlFor="cl-jd" className="block text-xs font-semibold text-slate-700 mb-1">Job description snippet (optional)</label>
              <textarea
                id="cl-jd"
                rows={4}
                placeholder="Paste key responsibilities or requirements…"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full p-3 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-indigo-200" />}
              {generating ? "Drafting letter…" : "Generate cover letter"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs min-h-[500px] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b pb-3 mb-4 gap-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" /> Draft output
                </h3>

                {generatedLetter && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={downloadLetter}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" /> Download
                    </button>
                    <button
                      onClick={copyLetter}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                )}
              </div>

              {generatedLetter ? (
                <textarea
                  rows={16}
                  value={generatedLetter}
                  onChange={(e) => setGeneratedLetter(e.target.value)}
                  aria-label="Generated cover letter"
                  className="w-full p-4 text-xs font-serif leading-relaxed text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <div className="text-center py-20 text-slate-400 space-y-3">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-xs font-medium">Fill in the application context to generate your letter.</p>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 border-t pt-3 mt-4">
              Tip: edit the generated text directly above before copying or downloading.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const INPUT =
  "w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none";
