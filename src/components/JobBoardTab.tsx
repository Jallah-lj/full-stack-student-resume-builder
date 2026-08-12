"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Briefcase, MapPin, Search, Building2, ArrowRight,
  Bookmark, BookmarkCheck, Zap, Clock, X,
  DollarSign, SlidersHorizontal, Star,
  Sparkles, CheckCircle2, AlertTriangle, Check,
} from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { api, errorMessage } from "@/lib/client-api";

const ALL_JOBS = [
  { id: "job-1",  company: "Stripe",          logo: "https://logo.clearbit.com/stripe.com",          title: "Software Engineering Intern – Summer 2026",    location: "San Francisco, CA",   remote: "Hybrid",  salary: "$9,000/mo",  tags: ["React", "Go", "Infrastructure", "TypeScript"],    category: "Engineering", match: 94, postedAt: "2d ago",  description: "Build internal infrastructure and developer tools used by millions of businesses worldwide. Stripe offers mentorship, real ownership, and impact from day one." },
  { id: "job-2",  company: "Goldman Sachs",   logo: "https://logo.clearbit.com/goldmansachs.com",   title: "Investment Banking Summer Analyst",              location: "New York, NY",        remote: "On-site", salary: "$8,500/mo",  tags: ["Financial Modeling", "Excel", "M&A", "DCF"],      category: "Finance",     match: 88, postedAt: "1d ago",  description: "Rotational analyst program across M&A, leveraged finance, and equity capital markets. Gain exposure to Fortune 500 deal teams and live transactions." },
  { id: "job-3",  company: "SpaceX",          logo: "https://logo.clearbit.com/spacex.com",          title: "Flight Software Engineering Intern",            location: "Hawthorne, CA",       remote: "On-site", salary: "$7,800/mo",  tags: ["C++", "Linux", "Real-time", "Embedded"],          category: "Engineering", match: 91, postedAt: "4d ago",  description: "Write code that runs in space. Work alongside world-class engineers building flight-critical software for Falcon 9, Dragon, and Starship launch vehicles." },
  { id: "job-4",  company: "OpenAI",          logo: "https://logo.clearbit.com/openai.com",          title: "Research Engineer Intern – LLM Infrastructure", location: "San Francisco, CA",   remote: "Hybrid",  salary: "$12,000/mo", tags: ["Python", "PyTorch", "ML", "CUDA", "Research"],    category: "AI / ML",     match: 82, postedAt: "6h ago",  description: "Work on training infrastructure and model evaluation frameworks for frontier AI models. Collaborate directly with researchers on cutting-edge AI safety and capabilities research." },
  { id: "job-5",  company: "Robinhood",       logo: "https://logo.clearbit.com/robinhood.com",       title: "Product Design Intern",                         location: "Menlo Park, CA",      remote: "Hybrid",  salary: "$7,500/mo",  tags: ["Figma", "Design Systems", "Product", "UX"],       category: "Design",      match: 95, postedAt: "3d ago",  description: "Design experiences that democratize finance. Work on the core trading, crypto, and retirement product flows used by 22M+ customers." },
  { id: "job-6",  company: "Notion",          logo: "https://logo.clearbit.com/notion.so",           title: "Software Engineering Intern – Web Platform",    location: "San Francisco, CA",   remote: "Remote",  salary: "$8,200/mo",  tags: ["TypeScript", "React", "Node.js", "PostgreSQL"],   category: "Engineering", match: 89, postedAt: "1d ago",  description: "Contribute to the Notion web editor and platform infrastructure. Collaborate with product engineers on features used by 30M+ users daily." },
  { id: "job-7",  company: "McKinsey & Co.",  logo: "https://logo.clearbit.com/mckinsey.com",        title: "Business Analyst Intern",                       location: "Chicago, IL",         remote: "Hybrid",  salary: "$10,000/mo", tags: ["Strategy", "PowerPoint", "Research", "Analytics"], category: "Consulting",  match: 78, postedAt: "2d ago",  description: "Solve complex business problems across industries from healthcare to tech. Business Analyst Interns drive workstreams on real client engagements from week one." },
  { id: "job-8",  company: "NIH",             logo: "https://logo.clearbit.com/nih.gov",             title: "Clinical Research Intern – Oncology Lab",       location: "Bethesda, MD",        remote: "On-site", salary: "$4,200/mo",  tags: ["ELISA", "PCR", "Cell Culture", "R", "SPSS"],      category: "Research",    match: 87, postedAt: "5d ago",  description: "Contribute to translational oncology research in a world-leading NIH institute. Gain experience with clinical samples, bioinformatics, and research publication." },
  { id: "job-9",  company: "Figma",           logo: "https://logo.clearbit.com/figma.com",           title: "Frontend Engineering Intern",                   location: "San Francisco, CA",   remote: "Hybrid",  salary: "$9,500/mo",  tags: ["TypeScript", "WebGL", "Canvas", "React"],         category: "Engineering", match: 86, postedAt: "3d ago",  description: "Work on the Figma editor — one of the most complex browser-based applications in the world. Ship features to millions of designers and developers." },
  { id: "job-10", company: "Two Sigma",       logo: "https://logo.clearbit.com/twosigma.com",        title: "Quantitative Research Intern",                  location: "New York, NY",        remote: "Hybrid",  salary: "$15,000/mo", tags: ["Python", "Statistics", "Machine Learning", "R"],  category: "Finance",     match: 80, postedAt: "7d ago",  description: "Apply machine learning and statistical methods to real financial markets. Work with proprietary datasets, alpha research, and live trading systems." },
  { id: "job-11", company: "Airbnb",          logo: "https://logo.clearbit.com/airbnb.com",          title: "Data Science Intern",                           location: "San Francisco, CA",   remote: "Hybrid",  salary: "$8,800/mo",  tags: ["Python", "SQL", "Spark", "A/B Testing", "R"],     category: "AI / ML",     match: 84, postedAt: "2d ago",  description: "Drive data-driven product decisions across growth, trust, and payments. Build experimentation pipelines and predictive models affecting 150M+ users." },
  { id: "job-12", company: "Palantir",        logo: "https://logo.clearbit.com/palantir.com",        title: "Forward Deployed Engineer Intern",              location: "Washington, DC",      remote: "On-site", salary: "$9,200/mo",  tags: ["Python", "Java", "Data Pipelines", "SQL"],        category: "Engineering", match: 77, postedAt: "1d ago",  description: "Deploy Palantir platforms to government and enterprise clients. FDEs bridge engineering and business — you'll write code and present to executives." },
];

const CATEGORIES = ["All", "Engineering", "Finance", "AI / ML", "Design", "Consulting", "Research"];
const REMOTE_OPTIONS = ["All", "Remote", "Hybrid", "On-site"];

type Job = (typeof ALL_JOBS)[number];

export function JobBoardTab() {
  const { resumes } = useApp();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedRemote, setSelectedRemote] = useState("All");
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"match" | "recent">("match");
  const [onlySaved, setOnlySaved] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");

  /** Saved jobs and existing applications both live in the database. */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [saved, apps] = await Promise.all([
          api.get<{ bookmarks: string[] }>("/api/job-bookmarks"),
          api.get<{ jobApplications: { jobTitle: string; companyName: string }[] }>("/api/job-applications"),
        ]);
        if (cancelled) return;
        setBookmarks(saved.bookmarks || []);
        // Match tracker rows back to board listings by company + title.
        setAppliedJobIds(
          ALL_JOBS.filter((j) =>
            (apps.jobApplications || []).some((a) => a.companyName === j.company && a.jobTitle === j.title)
          ).map((j) => j.id)
        );
      } catch (err) {
        if (!cancelled) setError(errorMessage(err, "Couldn't load your saved jobs."));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    let jobs = ALL_JOBS;
    if (search) {
      const q = search.toLowerCase();
      jobs = jobs.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.tags.some(t => t.toLowerCase().includes(q)) ||
        j.location.toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== "All") jobs = jobs.filter(j => j.category === selectedCategory);
    if (selectedRemote !== "All") jobs = jobs.filter(j => j.remote === selectedRemote);
    if (onlySaved) jobs = jobs.filter(j => bookmarks.includes(j.id));
    if (sortBy === "match") jobs = [...jobs].sort((a, b) => b.match - a.match);
    return jobs;
  }, [search, selectedCategory, selectedRemote, sortBy, onlySaved, bookmarks]);

  /** Persist the bookmark, rolling back the optimistic toggle if the write fails. */
  const toggleBookmark = async (id: string) => {
    const wasSaved = bookmarks.includes(id);
    const previous = bookmarks;
    setBookmarks(wasSaved ? bookmarks.filter((b) => b !== id) : [...bookmarks, id]);
    setError("");
    try {
      const data = await api.post<{ bookmarks: string[] }>("/api/job-bookmarks", { jobId: id, saved: !wasSaved });
      setBookmarks(data.bookmarks || []);
    } catch (err) {
      setBookmarks(previous);
      setError(errorMessage(err, "Couldn't save that job."));
    }
  };

  /** Apply → create a real row in the application tracker. */
  const applyToJob = async (job: Job) => {
    setApplying(true);
    setError("");
    try {
      await api.post("/api/job-applications", {
        resumeId: resumes[0]?.id,
        companyName: job.company,
        jobTitle: job.title,
        jobDescription: job.description,
        matchScore: job.match,
        matchedKeywords: job.tags,
        status: "applied",
      });
      setAppliedJobIds((prev) => [...new Set([...prev, job.id])]);
    } catch (err) {
      setError(errorMessage(err, "Couldn't add this role to your tracker."));
    } finally {
      setApplying(false);
    }
  };

  const remoteColor: Record<string, string> = {
    Remote: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Hybrid: "bg-indigo-50 text-indigo-700 border-indigo-100",
    "On-site": "bg-amber-50 text-amber-700 border-amber-100",
  };

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl">
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/20 mb-3">
              <Zap className="w-3.5 h-3.5" /> {filtered.length} Opportunities Matched
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Student Internship Portal</h1>
            <p className="text-indigo-200 text-xs sm:text-sm mt-1.5 max-w-lg">
              Curated roles from top companies — filtered by match score, field, and remote preference.
            </p>
          </div>
          <div className="flex gap-2 text-center">
            <div className="bg-white/10 rounded-2xl px-4 py-3 border border-white/10">
              <div className="text-2xl font-black">{bookmarks.length}</div>
              <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Saved</div>
            </div>
            <div className="bg-white/10 rounded-2xl px-4 py-3 border border-white/10">
              <div className="text-2xl font-black">{ALL_JOBS.length}</div>
              <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Total</div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {/* Search + Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search roles, companies, skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${showFilters ? "bg-indigo-600 text-white border-indigo-600" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"}`}
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Category</label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${selectedCategory === cat ? "bg-indigo-600 text-white border-indigo-600" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300"}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Work Style</label>
              <div className="flex flex-wrap gap-1.5">
                {REMOTE_OPTIONS.map(opt => (
                  <button key={opt} onClick={() => setSelectedRemote(opt)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${selectedRemote === opt ? "bg-slate-900 dark:bg-indigo-600 text-white border-slate-900 dark:border-indigo-600" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400"}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="ml-auto">
              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Sort By</label>
              <div className="flex gap-1.5">
                {(["match", "recent"] as const).map(s => (
                  <button key={s} onClick={() => setSortBy(s)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all capitalize ${sortBy === s ? "bg-emerald-600 text-white border-emerald-600" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400"}`}>
                    {s === "match" ? "Best Match" : "Most Recent"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Category pill filters (quick) */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${selectedCategory === cat ? "bg-indigo-600 text-white border-indigo-600" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300"}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="flex justify-between items-center px-1">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
          Showing <span className="text-slate-900 dark:text-white">{filtered.length}</span> of {ALL_JOBS.length} roles
        </p>
        {bookmarks.length > 0 && (
          <button
            onClick={() => setOnlySaved((v) => !v)}
            className={`text-xs font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors ${
              onlySaved ? "bg-indigo-600 text-white border-indigo-600" : "text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" /> {onlySaved ? "Showing saved" : `${bookmarks.length} saved`}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Job Cards */}
        <div className="lg:col-span-7 space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
              <Briefcase className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 dark:text-slate-300">No roles match your filters</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try broadening your search or clearing filters.</p>
              <button onClick={() => { setSearch(""); setSelectedCategory("All"); setSelectedRemote("All"); }}
                className="mt-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Clear all filters</button>
            </div>
          ) : (
            filtered.map(job => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all cursor-pointer hover:shadow-md group ${selectedJob?.id === job.id ? "border-indigo-400 ring-2 ring-indigo-100 dark:ring-indigo-950" : "border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-700"}`}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                      {/* Third-party logo host; next/image would require allowlisting every domain. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={job.logo} alt={job.company} className="w-10 h-10 object-contain"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">{job.title}</h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                            <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{job.company}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                            <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300"><DollarSign className="w-3.5 h-3.5" />{job.salary}</span>
                          </div>
                        </div>
                        <div className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black border ${job.match >= 90 ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60" : job.match >= 80 ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"}`}>
                          {job.match}% Match
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${remoteColor[job.remote] || "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"}`}>
                          {job.remote}
                        </span>
                        {job.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-[10px] font-bold">{tag}</span>
                        ))}
                        {job.tags.length > 3 && <span className="text-[10px] text-slate-400 dark:text-slate-500">+{job.tags.length - 3}</span>}
                        <span className="ml-auto flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                          <Clock className="w-3 h-3" />{job.postedAt}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-3 bg-slate-50/80 dark:bg-slate-800/50 rounded-b-2xl border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => { e.stopPropagation(); toggleBookmark(job.id); }}
                      className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all"
                    >
                      {bookmarks.includes(job.id)
                        ? <BookmarkCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        : <Bookmark className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
                    </button>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{job.category}</span>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedJob(job); }}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    View Details <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Job Detail Panel */}
        <div className="lg:col-span-5">
          {selectedJob ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-20 overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 shrink-0 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedJob.logo} alt="" className="w-12 h-12 object-contain"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-black text-slate-900 dark:text-white text-sm leading-tight">{selectedJob.title}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{selectedJob.company} · {selectedJob.location}</p>
                  </div>
                  <button onClick={() => setSelectedJob(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${remoteColor[selectedJob.remote]}`}>{selectedJob.remote}</span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />{selectedJob.salary}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900/60 flex items-center gap-1">
                    <Clock className="w-3 h-3" />{selectedJob.postedAt}
                  </span>
                  <span className={`ml-auto px-2.5 py-1 rounded-full text-[10px] font-black border ${selectedJob.match >= 90 ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60" : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60"}`}>
                    <Star className="w-3 h-3 inline mr-0.5" />{selectedJob.match}% Match
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-5">
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2">About the Role</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{selectedJob.description}</p>
                </div>

                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/60 text-[11px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-950/50 rounded-xl p-4 border border-indigo-100 dark:border-indigo-900/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-black text-indigo-900 dark:text-indigo-200">Match Analysis</span>
                  </div>
                  <div className="w-full h-2 bg-indigo-200 dark:bg-indigo-900 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all" style={{ width: `${selectedJob.match}%` }} />
                  </div>
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                    {selectedJob.match >= 90
                      ? "Excellent match! Your resume aligns strongly with this role. Apply now."
                      : selectedJob.match >= 80
                      ? "Good match. Use ATS Optimizer to close the keyword gap before applying."
                      : "Moderate match. Run ATS analysis to identify missing skills and tailor your resume."}
                  </p>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => toggleBookmark(selectedJob.id)}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-1.5 ${bookmarks.includes(selectedJob.id) ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"}`}
                  >
                    {bookmarks.includes(selectedJob.id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    {bookmarks.includes(selectedJob.id) ? "Saved" : "Save"}
                  </button>
                  {appliedJobIds.includes(selectedJob.id) ? (
                    <span className="flex-1 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-bold text-xs flex items-center justify-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> In your tracker
                    </span>
                  ) : (
                    <button
                      onClick={() => applyToJob(selectedJob)}
                      disabled={applying}
                      className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      {applying ? "Adding…" : "Apply & track"} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-10 text-center sticky top-20">
              <Briefcase className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Select a Role</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Click any job card to view full details and your match analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
