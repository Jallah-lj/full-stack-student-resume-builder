"use client";

import React, { useState } from "react";
import { Plus, Copy, ExternalLink, Trash2, Edit3, Sparkles, FileText, Check, Share2, Upload, Download, Search } from "lucide-react";

export function ResumesListTab({
  resumes,
  onSelectResume,
  onCreateResume,
  onDuplicateResume,
  onDeleteResume,
  onRefresh,
}: {
  resumes: any[];
  onSelectResume: (resumeId: string) => void;
  onCreateResume: (payload: { title: string; targetRole: string; template: string; colorTheme: string; copyFromResumeId?: string }) => Promise<void>;
  onDuplicateResume: (resumeId: string) => Promise<void>;
  onDeleteResume: (resumeId: string) => Promise<void>;
  onRefresh?: () => void;
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newTargetRole, setNewTargetRole] = useState("");
  const [newTemplate, setNewTemplate] = useState("modern_tech");
  const [newColorTheme, setNewColorTheme] = useState("navy");
  const [copyFromId, setCopyFromId] = useState("");
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await onCreateResume({
        title: newTitle || "New Resume",
        targetRole: newTargetRole || "Software Engineering Intern",
        template: newTemplate,
        colorTheme: newColorTheme,
        copyFromResumeId: copyFromId || undefined,
      });
      setShowCreateModal(false);
      setNewTitle("");
      setNewTargetRole("");
      setCopyFromId("");
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const copyShareLink = (slug: string) => {
    if (typeof window !== "undefined") {
      const fullUrl = `${window.location.origin}/r/${slug}`;
      navigator.clipboard.writeText(fullUrl);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2500);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const jsonContent = JSON.parse(event.target?.result as string);
          const res = await fetch("/api/resumes/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(jsonContent),
          });
          if (res.ok && onRefresh) {
            onRefresh();
          }
        } catch (err) {
          alert("Invalid JSON backup file format");
        } finally {
          setUploading(false);
        }
      };
      reader.readAsText(file);
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  };

  const filteredResumes = resumes.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.targetRole && r.targetRole.toLowerCase().includes(searchQuery.toLowerCase())) ||
    r.template.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const avgAts = resumes.length > 0
    ? Math.round(resumes.reduce((sum, r) => sum + (r.atsScore || 85), 0) / resumes.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Hero Banner & Stats */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-medium border border-indigo-400/20 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" /> AI-Powered Student Resume Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Your Internship & Career Resumes</h1>
            <p className="text-indigo-200 text-xs sm:text-sm mt-1 max-w-xl">
              Create tailored resumes for tech, research, finance, or consulting internships. Track live ATS scores and share exportable links.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-indigo-800 hover:bg-indigo-700/80 text-indigo-100 font-bold text-xs cursor-pointer border border-indigo-700 transition-all">
              <Upload className="w-4 h-4" />
              {uploading ? "Importing..." : "Import JSON"}
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-4 h-4 text-indigo-600" /> Create New Resume
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-indigo-700/50">
          <div>
            <span className="text-2xl font-black text-white">{resumes.length}</span>
            <p className="text-[11px] text-indigo-200 font-medium">Active Resumes</p>
          </div>
          <div>
            <span className="text-2xl font-black text-emerald-400">{avgAts}%</span>
            <p className="text-[11px] text-indigo-200 font-medium">Average ATS Score</p>
          </div>
          <div>
            <span className="text-2xl font-black text-indigo-300">
              {resumes.filter(r => r.isPublic).length}
            </span>
            <p className="text-[11px] text-indigo-200 font-medium">Public Share Links</p>
          </div>
          <div>
            <span className="text-2xl font-black text-amber-300">4</span>
            <p className="text-[11px] text-indigo-200 font-medium">Ready Templates</p>
          </div>
        </div>
      </div>

      {/* Filter / Search Control Bar */}
      {resumes.length > 0 && (
        <div className="flex justify-between items-center bg-white p-3.5 rounded-2xl border border-slate-200 gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search resumes by title, target role, or template..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Showing {filteredResumes.length} of {resumes.length}
          </div>
        </div>
      )}

      {/* Resumes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResumes.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
          >
            <div className="p-5">
              <div className="flex justify-between items-start gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  {r.template.replace("_", " ")}
                </span>
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  ATS {r.atsScore || 85}%
                </div>
              </div>

              <h2 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                {r.title}
              </h2>
              <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                Target: {r.targetRole || "General Application"}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                <div className="w-3 h-3 rounded-full border border-slate-300 bg-indigo-900" />
                <span className="capitalize">{r.colorTheme} Theme</span>
                <span className="text-slate-300">•</span>
                <span>Updated {new Date(r.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Card Actions Footer */}
            <div className="bg-slate-50/80 px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onSelectResume(r.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Builder
                </button>
                <a
                  href={`/r/${r.shareSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-slate-200 transition-colors"
                  title="View Public Share Page"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="flex items-center gap-1">
                <a
                  href={`/api/resumes/${r.id}/export`}
                  download
                  className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white transition-colors"
                  title="Export JSON Backup"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => copyShareLink(r.shareSlug)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white transition-colors"
                  title="Copy share link"
                >
                  {copiedSlug === r.shareSlug ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => onDuplicateResume(r.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white transition-colors"
                  title="Duplicate Resume"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteResume(r.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete Resume"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {resumes.length === 0 && (
        <div className="text-center py-12 px-4 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Resumes Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Create your first tailored student resume or clone an existing template to get started.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Resume
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Create Student Resume</h2>
            <p className="text-xs text-slate-500 mb-4">Set target position and select layout styling.</p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Resume Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quantitative Finance Intern 2026"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Job / Industry Role</label>
                <input
                  type="text"
                  placeholder="e.g. Investment Banking / SWE"
                  value={newTargetRole}
                  onChange={(e) => setNewTargetRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Template Style</label>
                  <select
                    value={newTemplate}
                    onChange={(e) => setNewTemplate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="modern_tech">Modern Tech</option>
                    <option value="ivy_league">Ivy League / Traditional</option>
                    <option value="minimal_corp">Minimal Corporate</option>
                    <option value="academic_research">Academic / Lab CV</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Color Theme</label>
                  <select
                    value={newColorTheme}
                    onChange={(e) => setNewColorTheme(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="navy">Navy Blue</option>
                    <option value="emerald">Emerald Green</option>
                    <option value="burgundy">Burgundy Rose</option>
                    <option value="slate">Charcoal Slate</option>
                    <option value="purple">Royal Purple</option>
                  </select>
                </div>
              </div>

              {resumes.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Copy Content From Existing Resume (Optional)</label>
                  <select
                    value={copyFromId}
                    onChange={(e) => setCopyFromId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Start Fresh with Sample Entry</option>
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>Copy from: {r.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                >
                  {creating ? "Creating..." : "Create Resume"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
