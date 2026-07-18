"use client";

import React, { useState } from "react";
import { Sparkles, FileText, Copy, Check, Send, Download, RefreshCw } from "lucide-react";

export function CoverLetterTab({ resumes }: { resumes: any[] }) {
  const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id || "");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeId) return;
    setGenerating(true);

    try {
      const fullRes = await fetch(`/api/resumes/${selectedResumeId}`);
      const resumeData = await fullRes.json();

      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          jobTitle,
          jobDescription,
          user: resumeData.user,
          education: resumeData.education,
          workExperiences: resumeData.workExperiences,
          skills: resumeData.skills,
        }),
      });

      const data = await res.json();
      setGeneratedLetter(data.coverLetter || "");
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const copyLetter = () => {
    if (typeof window !== "undefined" && generatedLetter) {
      navigator.clipboard.writeText(generatedLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold border border-indigo-400/20 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-indigo-300" /> AI Internship Cover Letter Generator
        </div>
        <h1 className="text-2xl font-extrabold">Tailored Cover Letter Generator</h1>
        <p className="text-indigo-200 text-xs sm:text-sm mt-1 max-w-xl">
          Instantly draft professional cover letters aligned with your resume content and targeted role requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Form (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" /> Application Context
          </h2>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Source Student Resume</label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.targetRole || "General"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Company / Organization</label>
              <input
                type="text"
                placeholder="e.g. Google, McKinsey, Johns Hopkins Lab"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Job / Role Title</label>
              <input
                type="text"
                placeholder="e.g. Software Engineering Intern Summer 2026"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Description Snippet (Optional)</label>
              <textarea
                rows={4}
                placeholder="Paste key responsibilities or requirements..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full p-3 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-indigo-200" />}
              {generating ? "Drafting Letter..." : "Generate Cover Letter"}
            </button>
          </form>
        </div>

        {/* Right Preview Output (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs min-h-[500px] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" /> Draft Cover Letter Output
                </h3>

                {generatedLetter && (
                  <button
                    onClick={copyLetter}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    {copied ? "Copied!" : "Copy Full Text"}
                  </button>
                )}
              </div>

              {generatedLetter ? (
                <textarea
                  rows={16}
                  value={generatedLetter}
                  onChange={(e) => setGeneratedLetter(e.target.value)}
                  className="w-full p-4 text-xs font-serif leading-relaxed text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <div className="text-center py-20 text-slate-400 space-y-3">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-xs font-medium">Fill in application context on the left to generate your letter.</p>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 border-t pt-3 mt-4">
              Tip: You can edit the generated cover letter text directly in the box above before copying or submitting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
