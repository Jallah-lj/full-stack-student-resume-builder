"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3, Users, Eye, Clock, Smartphone, Monitor, Globe,
  ArrowUpRight, TrendingUp, Copy, Check, ExternalLink, Zap,
  FileText, Calendar, Share2,
} from "lucide-react";

interface ResumeViewData {
  name: string;
  views: number;
  unique: number;
  avg: string;
  shareSlug: string;
}

export function AnalyticsTab({ resumes }: { resumes: any[] }) {
  const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id || "");
  const [copiedLink, setCopiedLink] = useState(false);
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("30d");

  const selectedResume = resumes.find(r => r.id === selectedResumeId);

  // Deterministic mock stats per resume
  const hash = selectedResumeId.split("").reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
  const stats = {
    totalViews:    (hash % 80)  + 80,
    uniqueVisitors:(hash % 45)  + 40,
    avgTime:       `${(hash % 2) + 1}m ${(hash % 50) + 10}s`,
    engagement:    (hash % 20)  + 78,
    weeklyGrowth:  (hash % 15)  + 3,
    topLocations: [
      { city: "New York, NY",      count: (hash % 20) + 25 },
      { city: "San Francisco, CA", count: (hash % 15) + 18 },
      { city: "Chicago, IL",       count: (hash % 10) + 8  },
      { city: "Austin, TX",        count: (hash % 8)  + 5  },
      { city: "London, UK",        count: (hash % 6)  + 4  },
    ],
    devices: [
      { type: "Desktop", pct: 72 + (hash % 10), icon: Monitor },
      { type: "Mobile",  pct: 20 + (hash % 5),  icon: Smartphone },
      { type: "Tablet",  pct: 5,                 icon: Globe },
    ],
    weeklyViews: [
      { day: "Mon", views: (hash % 8)  + 4 },
      { day: "Tue", views: (hash % 12) + 8 },
      { day: "Wed", views: (hash % 15) + 12 },
      { day: "Thu", views: (hash % 18) + 14 },
      { day: "Fri", views: (hash % 20) + 16 },
      { day: "Sat", views: (hash % 8)  + 5  },
      { day: "Sun", views: (hash % 6)  + 3  },
    ],
    referrers: [
      { source: "LinkedIn",      pct: 45 },
      { source: "Direct Link",   pct: 28 },
      { source: "Email",         pct: 16 },
      { source: "Other",         pct: 11 },
    ],
  };

  const maxViews = Math.max(...stats.weeklyViews.map(d => d.views));

  const copyLink = () => {
    if (!selectedResume) return;
    navigator.clipboard.writeText(`${window.location.origin}/r/${selectedResume.shareSlug}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const STAT_CARDS = [
    { label: "Total Views",      value: stats.totalViews,    icon: Eye,    color: "bg-blue-50 text-blue-600",    badge: "bg-blue-100 text-blue-700",    change: `+${stats.weeklyGrowth}% this week` },
    { label: "Unique Visitors",  value: stats.uniqueVisitors,icon: Users,  color: "bg-purple-50 text-purple-600",badge: "bg-purple-100 text-purple-700", change: "People" },
    { label: "Avg. Read Time",   value: stats.avgTime,        icon: Clock,  color: "bg-amber-50 text-amber-600",  badge: "bg-amber-100 text-amber-700",   change: "Per visitor" },
    { label: "Engagement Rate",  value: `${stats.engagement}%`, icon: BarChart3, color: "bg-emerald-50 text-emerald-600", badge: "bg-emerald-100 text-emerald-700", change: "Strong" },
  ];

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold border border-white/10 mb-3">
              <TrendingUp className="w-3.5 h-3.5" /> Resume Visibility Intelligence
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Public Link Analytics</h1>
            <p className="text-indigo-100 text-xs sm:text-sm mt-1.5 max-w-lg">
              See who's visiting your shared resume links, where they're from, and how they engage.
            </p>
          </div>
          {selectedResume && (
            <div className="flex gap-2 w-full sm:w-auto">
              <a href={`/r/${selectedResume.shareSlug}`} target="_blank" rel="noreferrer"
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/10 flex items-center justify-center gap-1.5 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" /> View Live
              </a>
              <button onClick={copyLink}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md">
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? "Copied!" : "Copy Link"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Resume Selector + Period Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <FileText className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={selectedResumeId}
            onChange={e => setSelectedResumeId(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {resumes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
          </select>
        </div>
        <div className="flex bg-white border border-slate-200 rounded-xl p-1 gap-0.5">
          {(["7d", "30d", "all"] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${period === p ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
              {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "All Time"}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {STAT_CARDS.map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className={`w-9 h-9 rounded-xl ${card.color} flex items-center justify-center`}>
                <card.icon className="w-5 h-5" />
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${card.badge}`}>{card.change}</span>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{card.value}</div>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Weekly Views Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" /> Daily Views This Week
            </h3>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />+{stats.weeklyGrowth}%
            </span>
          </div>
          <div className="flex items-end gap-2 h-32">
            {stats.weeklyViews.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] text-slate-500 font-bold">{d.views}</span>
                <div
                  className="w-full bg-indigo-600 rounded-t-lg transition-all duration-700 hover:bg-indigo-500"
                  style={{ height: `${Math.round((d.views / maxViews) * 100)}%`, minHeight: "4px" }}
                />
                <span className="text-[9px] text-slate-400 font-medium">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Device Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-6">
            <Monitor className="w-4 h-4 text-indigo-600" /> Device Breakdown
          </h3>
          <div className="space-y-5">
            {stats.devices.map((d, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <d.icon className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">{d.type}</span>
                  </div>
                  <span className="text-xs font-black text-indigo-600">{d.pct}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Visitor Locations */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-5">
            <Globe className="w-4 h-4 text-indigo-600" /> Visitor Locations
          </h3>
          <div className="space-y-3">
            {stats.topLocations.map((loc, i) => {
              const max = stats.topLocations[0].count;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-400 w-3">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-bold text-slate-700">{loc.city}</span>
                      <span className="text-xs font-black text-indigo-600">{loc.count} views</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${Math.round((loc.count / max) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-5">
            <Share2 className="w-4 h-4 text-indigo-600" /> Traffic Sources
          </h3>
          <div className="space-y-3">
            {stats.referrers.map((r, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm shrink-0">
                  {r.source === "LinkedIn" ? "in" : r.source === "Direct Link" ? "🔗" : r.source === "Email" ? "✉️" : "📊"}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700">{r.source}</span>
                    <span className="text-xs font-black text-indigo-600">{r.pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* No resumes state */}
      {resumes.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <BarChart3 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700">No Resumes to Analyze</h3>
          <p className="text-xs text-slate-400 mt-1">Create and share a resume to start tracking visitor analytics.</p>
        </div>
      )}
    </div>
  );
}
