"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart3, Users, Eye, Clock, Smartphone, Monitor, Globe,
  TrendingUp, Copy, Check, ExternalLink, FileText, Share2,
  AlertTriangle, Lock,
} from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { api, errorMessage } from "@/lib/client-api";

interface AnalyticsResponse {
  period: string;
  totals: { views: number; unique: number; lastViewedAt: string | null };
  devices: { device: string; count: number }[];
  referrers: { referrer: string; count: number }[];
  countries: { country: string | null; count: number }[];
  series: { day: string; count: number }[];
}

const DEVICE_ICON: Record<string, React.ElementType> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Globe,
};

const REFERRER_ICON: Record<string, string> = {
  LinkedIn: "in",
  direct: "🔗",
  Email: "✉️",
  Google: "🔍",
  GitHub: "🐙",
};

export function AnalyticsTab() {
  const { resumes } = useApp();
  const [chosenResumeId, setChosenResumeId] = useState("");
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("30d");
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Derive the active resume instead of syncing state, so the first resume is
  // selected by default without an extra render pass.
  const selectedResumeId = chosenResumeId || resumes[0]?.id || "";
  const selectedResume = resumes.find((r) => r.id === selectedResumeId);

  useEffect(() => {
    if (!selectedResumeId) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await api.get<AnalyticsResponse>(
          `/api/analytics?resumeId=${encodeURIComponent(selectedResumeId)}&period=${period}`
        );
        if (cancelled) return;
        setData(res);
        setError("");
      } catch (err) {
        if (!cancelled) setError(errorMessage(err, "Couldn't load analytics."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedResumeId, period]);

  const copyLink = async () => {
    if (!selectedResume) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/r/${selectedResume.shareSlug}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      setError("Clipboard access was blocked.");
    }
  };

  if (resumes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <BarChart3 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
        <h3 className="font-bold text-slate-700">No resumes to analyze</h3>
        <p className="text-xs text-slate-400 mt-1">Create and share a resume to start tracking visitor analytics.</p>
      </div>
    );
  }

  const totalViews = data?.totals.views ?? 0;
  const uniqueVisitors = data?.totals.unique ?? 0;
  const deviceTotal = (data?.devices ?? []).reduce((s, d) => s + d.count, 0) || 1;
  const referrerTotal = (data?.referrers ?? []).reduce((s, r) => s + r.count, 0) || 1;
  const maxDay = Math.max(1, ...(data?.series ?? []).map((d) => d.count));

  // Show the trailing 14 days so the bars stay readable.
  const visibleSeries = (data?.series ?? []).slice(-14);

  const lastViewed = data?.totals.lastViewedAt ? new Date(data.totals.lastViewedAt) : null;

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold border border-white/10 mb-3">
              <TrendingUp className="w-3.5 h-3.5" /> Resume visibility intelligence
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Public Link Analytics</h1>
            <p className="text-indigo-100 text-xs sm:text-sm mt-1.5 max-w-lg">
              Real visits to your shared resume links — where they came from and what they used.
            </p>
          </div>
          {selectedResume && (
            <div className="flex gap-2 w-full sm:w-auto">
              <a
                href={`/r/${selectedResume.shareSlug}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View live
              </a>
              <button
                onClick={copyLink}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? "Copied!" : "Copy link"}
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {selectedResume && !selectedResume.isPublic && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-start gap-2">
          <Lock className="w-4 h-4 shrink-0 mt-0.5" />
          This resume&apos;s public link is turned off, so it can&apos;t collect views. Enable it in the Resume Studio design tab.
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <FileText className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={selectedResumeId}
            onChange={(e) => setChosenResumeId(e.target.value)}
            aria-label="Select resume"
            className="text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex bg-white border border-slate-200 rounded-xl p-1 gap-0.5">
          {(["7d", "30d", "all"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                period === p ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {p === "7d" ? "7 days" : p === "30d" ? "30 days" : "All time"}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={Eye} label="Total views" value={loading ? "—" : totalViews} color="bg-blue-50 text-blue-600" />
        <StatCard icon={Users} label="Unique visitors" value={loading ? "—" : uniqueVisitors} color="bg-purple-50 text-purple-600" />
        <StatCard
          icon={Clock}
          label="Last viewed"
          value={loading ? "—" : lastViewed ? lastViewed.toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Never"}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={BarChart3}
          label="Repeat rate"
          value={loading || !totalViews ? "—" : `${Math.round(((totalViews - uniqueVisitors) / totalViews) * 100)}%`}
          color="bg-emerald-50 text-emerald-600"
        />
      </div>

      {totalViews === 0 && !loading ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <Eye className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700">No views recorded yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Share your public resume link — every visit is tracked here automatically, with unique visitors, device type
            and traffic source.
          </p>
          {selectedResume?.isPublic && (
            <button onClick={copyLink} className="mt-4 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold">
              {copiedLink ? "Link copied!" : "Copy share link"}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Daily views */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-6">
              <BarChart3 className="w-4 h-4 text-indigo-600" /> Daily views
            </h3>
            <div className="flex items-end gap-1.5 h-32">
              {visibleSeries.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group" title={`${d.day}: ${d.count} views`}>
                  <span className="text-[9px] text-slate-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">{d.count}</span>
                  <div
                    className="w-full bg-indigo-600 rounded-t-lg transition-all duration-700 hover:bg-indigo-500"
                    style={{ height: `${Math.round((d.count / maxDay) * 100)}%`, minHeight: "3px" }}
                  />
                  <span className="text-[8px] text-slate-400 font-medium">{d.day.slice(-2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Devices */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-6">
              <Monitor className="w-4 h-4 text-indigo-600" /> Device breakdown
            </h3>
            <div className="space-y-5">
              {(data?.devices ?? []).map((d) => {
                const Icon = DEVICE_ICON[d.device] || Globe;
                const pct = Math.round((d.count / deviceTotal) * 100);
                return (
                  <div key={d.device}>
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-700 capitalize">{d.device}</span>
                      </div>
                      <span className="text-xs font-black text-indigo-600">{pct}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {(data?.devices ?? []).length === 0 && <p className="text-xs text-slate-400">No device data yet.</p>}
            </div>
          </div>

          {/* Countries */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-5">
              <Globe className="w-4 h-4 text-indigo-600" /> Visitor locations
            </h3>
            <div className="space-y-3">
              {(data?.countries ?? []).map((loc, i) => {
                const max = data?.countries[0]?.count || 1;
                return (
                  <div key={loc.country ?? i} className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-400 w-3">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-bold text-slate-700">{loc.country}</span>
                        <span className="text-xs font-black text-indigo-600">{loc.count} views</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${Math.round((loc.count / max) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
              {(data?.countries ?? []).length === 0 && (
                <p className="text-xs text-slate-400">
                  Location data appears when your app runs behind a proxy that provides geo headers.
                </p>
              )}
            </div>
          </div>

          {/* Traffic sources */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-5">
              <Share2 className="w-4 h-4 text-indigo-600" /> Traffic sources
            </h3>
            <div className="space-y-3">
              {(data?.referrers ?? []).map((r) => {
                const pct = Math.round((r.count / referrerTotal) * 100);
                return (
                  <div key={r.referrer} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm shrink-0">
                      {REFERRER_ICON[r.referrer] || "📊"}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-bold text-slate-700 capitalize">{r.referrer}</span>
                        <span className="text-xs font-black text-indigo-600">{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
              {(data?.referrers ?? []).length === 0 && <p className="text-xs text-slate-400">No traffic yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-black text-slate-900">{value}</div>
        <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{label}</p>
      </div>
    </div>
  );
}
