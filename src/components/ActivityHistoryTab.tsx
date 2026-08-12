"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  History, Search, Clock, FileText, Zap, CheckCircle2,
  AlertCircle, Download, Sparkles, Briefcase, LogIn, AlertTriangle, Pencil,
} from "lucide-react";
import { api, errorMessage } from "@/lib/client-api";

interface ActivityEvent {
  id: string;
  userId: string;
  resumeId: string | null;
  type: string;
  action: string;
  target: string | null;
  result: string | null;
  status: string;
  createdAt: string;
}

const TYPE_META: Record<string, { icon: React.ElementType; label: string; chip: string }> = {
  ats: { icon: Zap, label: "ATS", chip: "bg-amber-100 text-amber-800" },
  ai: { icon: Sparkles, label: "AI", chip: "bg-purple-100 text-purple-800" },
  export: { icon: Download, label: "Export", chip: "bg-blue-100 text-blue-800" },
  edit: { icon: Pencil, label: "Edit", chip: "bg-slate-100 text-slate-700" },
  application: { icon: Briefcase, label: "Applications", chip: "bg-emerald-100 text-emerald-800" },
  auth: { icon: LogIn, label: "Account", chip: "bg-indigo-100 text-indigo-800" },
};

const FILTERS = ["all", "ats", "ai", "export", "edit", "application", "auth"] as const;

/** Human-friendly relative timestamp ("2h ago"), falling back to a date. */
function formatWhen(iso: string) {
  const then = new Date(iso);
  const diffMs = Date.now() - then.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return then.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function ActivityHistoryTab() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await api.get<{ events: ActivityEvent[]; counts: Record<string, number>; total: number }>(
          `/api/activity?type=${filter}&limit=150`
        );
        if (cancelled) return;
        setEvents(data.events || []);
        setCounts(data.counts || {});
        setTotal(data.total || 0);
        setError("");
      } catch (err) {
        if (!cancelled) setError(errorMessage(err, "Couldn't load your activity history."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filter]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) =>
      [e.action, e.target, e.result, e.type].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [events, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200 mb-3">
            <History className="w-3.5 h-3.5" /> Account event log
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Activity &amp; Audit History</h1>
          <p className="text-slate-500 text-sm mt-1">
            Every optimization, AI generation, edit and export recorded on your account.
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-3xl font-black text-slate-900">{total}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total events</div>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search actions, resumes, companies…"
            aria-label="Search activity"
            className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto bg-white border border-slate-200 rounded-xl p-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                filter === f ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {f === "all" ? "All" : TYPE_META[f]?.label ?? f}
              {f !== "all" && counts[f] ? <span className="ml-1 opacity-70">{counts[f]}</span> : null}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-100">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 bg-slate-100 rounded animate-pulse" />
                  <div className="h-2.5 w-1/4 bg-slate-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="p-14 text-center">
            <History className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-sm">
              {search ? "No matching events" : "No activity recorded yet"}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {search
                ? "Try a different search term or switch filters."
                : "Edit a resume, run an ATS scan or export a PDF — your audit trail builds itself."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {visible.map((event) => {
              const meta = TYPE_META[event.type] || { icon: FileText, label: event.type, chip: "bg-slate-100 text-slate-700" };
              const Icon = meta.icon;
              const failed = event.status === "error" || event.status === "failed";
              return (
                <li key={event.id} className="p-4 flex items-start gap-4 hover:bg-slate-50/70 transition-colors">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      failed ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold text-slate-900">{event.action}</p>
                      <span className={`text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded ${meta.chip}`}>
                        {meta.label}
                      </span>
                    </div>
                    {event.target && <p className="text-[11px] text-slate-500 mt-0.5 truncate">{event.target}</p>}
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatWhen(event.createdAt)}
                    </p>
                  </div>

                  <div className="shrink-0 text-right flex items-center gap-2">
                    {event.result && (
                      <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg hidden sm:inline">
                        {event.result}
                      </span>
                    )}
                    {failed ? (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
