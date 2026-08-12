"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus, Copy, ExternalLink, Trash2, Edit3, Sparkles, FileText,
  Check, Share2, Upload, Download, Search, AlertTriangle, Lock,
} from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { api, errorMessage } from "@/lib/client-api";

const TEMPLATES = [
  { value: "modern_tech", label: "Modern Tech" },
  { value: "ivy_league", label: "Ivy League / Traditional" },
  { value: "minimal_corp", label: "Minimal Corporate" },
  { value: "academic_research", label: "Academic / Lab CV" },
];

const THEMES = [
  { value: "navy", label: "Navy Blue", swatch: "bg-indigo-900" },
  { value: "emerald", label: "Emerald Green", swatch: "bg-emerald-800" },
  { value: "burgundy", label: "Burgundy Rose", swatch: "bg-rose-900" },
  { value: "slate", label: "Charcoal Slate", swatch: "bg-slate-800" },
  { value: "purple", label: "Royal Purple", swatch: "bg-purple-900" },
];

const THEME_SWATCH: Record<string, string> = Object.fromEntries(THEMES.map((t) => [t.value, t.swatch]));

export function ResumesListTab() {
  const router = useRouter();
  const { resumes, refreshResumes, loading } = useApp();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    targetRole: "",
    template: "modern_tech",
    colorTheme: "navy",
    copyFromResumeId: "",
  });
  const [creating, setCreating] = useState(false);

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 3000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const data = await api.post<{ resume: { id: string } }>("/api/resumes", {
        title: form.title.trim(),
        targetRole: form.targetRole.trim(),
        template: form.template,
        colorTheme: form.colorTheme,
        copyFromResumeId: form.copyFromResumeId || undefined,
      });
      await refreshResumes();
      setShowCreateModal(false);
      setForm({ title: "", targetRole: "", template: "modern_tech", colorTheme: "navy", copyFromResumeId: "" });
      // Take the student straight into the studio for the new resume.
      router.push(`/builder/${data.resume.id}`);
    } catch (err) {
      setError(errorMessage(err, "Couldn't create the resume."));
    } finally {
      setCreating(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    const source = resumes.find((r) => r.id === id);
    if (!source) return;
    setBusyId(id);
    setError("");
    try {
      await api.post("/api/resumes", {
        title: `${source.title} (Copy)`,
        targetRole: source.targetRole || "",
        template: source.template,
        colorTheme: source.colorTheme,
        copyFromResumeId: id,
      });
      await refreshResumes();
      flash("Resume duplicated.");
    } catch (err) {
      setError(errorMessage(err, "Couldn't duplicate the resume."));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setBusyId(confirmDelete.id);
    setError("");
    try {
      await api.del(`/api/resumes/${confirmDelete.id}`);
      await refreshResumes();
      flash("Resume deleted.");
      setConfirmDelete(null);
    } catch (err) {
      setError(errorMessage(err, "Couldn't delete the resume."));
    } finally {
      setBusyId(null);
    }
  };

  const copyShareLink = async (slug: string) => {
    const url = `${window.location.origin}/r/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this link:", url);
      return;
    }
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const text = await file.text();
      let payload: unknown;
      try {
        payload = JSON.parse(text);
      } catch {
        throw new Error("That file isn't valid JSON. Choose a ResuMate backup export.");
      }
      const data = await api.post<{ importedEntries: number }>("/api/resumes/import", payload);
      await refreshResumes();
      flash(`Imported successfully — ${data.importedEntries} entries restored.`);
    } catch (err) {
      setError(errorMessage(err, "Import failed."));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const q = searchQuery.toLowerCase();
  const filtered = resumes.filter(
    (r) =>
      r.title.toLowerCase().includes(q) ||
      (r.targetRole || "").toLowerCase().includes(q) ||
      r.template.toLowerCase().includes(q)
  );

  const avgAts = resumes.length
    ? Math.round(resumes.reduce((s, r) => s + (r.atsScore || 0), 0) / resumes.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-medium border border-indigo-400/20 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" /> AI-Powered Student Resume Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Your Internship &amp; Career Resumes</h1>
            <p className="text-indigo-200 text-xs sm:text-sm mt-1 max-w-xl">
              Create tailored resumes for tech, research, finance, or consulting internships. Track live ATS scores and
              share exportable links.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-indigo-800 hover:bg-indigo-700/80 text-indigo-100 font-bold text-xs cursor-pointer border border-indigo-700 transition-all">
              <Upload className="w-4 h-4" />
              {uploading ? "Importing…" : "Import JSON"}
              <input ref={fileRef} type="file" accept="application/json,.json" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-4 h-4 text-indigo-600" /> Create New Resume
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-indigo-700/50">
          <Stat value={resumes.length} label="Active Resumes" className="text-white" />
          <Stat value={`${avgAts}%`} label="Average ATS Score" className="text-emerald-400" />
          <Stat value={resumes.filter((r) => r.isPublic).length} label="Public Share Links" className="text-indigo-300" />
          <Stat value={TEMPLATES.length} label="Ready Templates" className="text-amber-300" />
        </div>
      </div>

      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
        </div>
      )}
      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-start gap-2">
          <Check className="w-4 h-4 shrink-0 mt-0.5" /> {notice}
        </div>
      )}

      {/* Search */}
      {resumes.length > 0 && (
        <div className="flex justify-between items-center bg-white p-3.5 rounded-2xl border border-slate-200 gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="search"
              placeholder="Search by title, target role, or template…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="text-xs font-semibold text-slate-500 shrink-0">
            Showing {filtered.length} of {resumes.length}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((r) => (
          <div
            key={r.id}
            className={`bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group ${
              busyId === r.id ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            <div className="p-5">
              <div className="flex justify-between items-start gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  {r.template.replace(/_/g, " ")}
                </span>
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  ATS {r.atsScore}%
                </div>
              </div>

              <Link href={`/builder/${r.id}`} className="block">
                <h2 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {r.title}
                </h2>
              </Link>
              <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                Target: {r.targetRole || "General Application"}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                <div className={`w-3 h-3 rounded-full border border-slate-300 ${THEME_SWATCH[r.colorTheme] || "bg-indigo-900"}`} />
                <span className="capitalize">{r.colorTheme} theme</span>
                <span className="text-slate-300">•</span>
                <span>Updated {new Date(r.updatedAt).toLocaleDateString()}</span>
                {!r.isPublic && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                    <Lock className="w-3 h-3" /> Private
                  </span>
                )}
              </div>
            </div>

            <div className="bg-slate-50/80 px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/builder/${r.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Builder
                </Link>
                {r.isPublic && (
                  <a
                    href={`/r/${r.shareSlug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-slate-200 transition-colors"
                    title="View public share page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-1">
                <a
                  href={`/api/resumes/${r.id}/export`}
                  download
                  className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white transition-colors"
                  title="Export JSON backup"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => copyShareLink(r.shareSlug)}
                  disabled={!r.isPublic}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title={r.isPublic ? "Copy share link" : "Enable the public link in the studio first"}
                >
                  {copiedSlug === r.shareSlug ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleDuplicate(r.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white transition-colors"
                  title="Duplicate resume"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setConfirmDelete({ id: r.id, title: r.title })}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete resume"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty states */}
      {!loading && resumes.length === 0 && (
        <div className="text-center py-12 px-4 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No resumes yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Create your first tailored student resume, or import a JSON backup to get started.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Resume
          </button>
        </div>
      )}

      {resumes.length > 0 && filtered.length === 0 && (
        <div className="text-center py-10 bg-white rounded-2xl border border-slate-200">
          <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No resumes match “{searchQuery}”</p>
          <button onClick={() => setSearchQuery("")} className="mt-2 text-xs font-bold text-indigo-600 hover:underline">
            Clear search
          </button>
        </div>
      )}

      {/* Create modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div role="dialog" aria-modal="true" className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Create Student Resume</h2>
            <p className="text-xs text-slate-500 mb-4">Set the target position and pick a layout.</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Resume Title *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Quantitative Finance Intern 2026"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={INPUT}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Job / Industry Role</label>
                <input
                  type="text"
                  placeholder="e.g. Investment Banking / SWE"
                  value={form.targetRole}
                  onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                  className={INPUT}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Template Style</label>
                  <select value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })} className={INPUT}>
                    {TEMPLATES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Color Theme</label>
                  <select value={form.colorTheme} onChange={(e) => setForm({ ...form, colorTheme: e.target.value })} className={INPUT}>
                    {THEMES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {resumes.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Copy content from an existing resume</label>
                  <select
                    value={form.copyFromResumeId}
                    onChange={(e) => setForm({ ...form, copyFromResumeId: e.target.value })}
                    className={INPUT}
                  >
                    <option value="">Start fresh with a sample entry</option>
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        Copy from: {r.title}
                      </option>
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
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors disabled:opacity-60"
                >
                  {creating ? "Creating…" : "Create Resume"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div role="alertdialog" aria-modal="true" className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Delete this resume?</h2>
              <p className="text-xs text-slate-500 mt-1">
                <span className="font-semibold">{confirmDelete.title}</span> and all of its sections will be permanently
                removed. This can&apos;t be undone.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={busyId === confirmDelete.id}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-60"
              >
                {busyId === confirmDelete.id ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const INPUT =
  "w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500";

function Stat({ value, label, className }: { value: React.ReactNode; label: string; className?: string }) {
  return (
    <div>
      <span className={`text-2xl font-black ${className}`}>{value}</span>
      <p className="text-[11px] text-indigo-200 font-medium">{label}</p>
    </div>
  );
}
