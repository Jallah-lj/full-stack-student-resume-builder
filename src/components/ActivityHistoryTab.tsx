"use client";

import React, { useState } from "react";
import { 
  History, 
  Search, 
  Calendar, 
  ArrowRight, 
  Clock, 
  Filter, 
  FileText, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  Download,
  MoreVertical,
  Sparkles
} from "lucide-react";

const HISTORY_DATA = [
  {
    id: "h1",
    action: "ATS Optimization Run",
    target: "Stripe SWE Intern",
    date: "Today, 2:45 PM",
    result: "94% Match",
    status: "success",
    type: "ats"
  },
  {
    id: "h2",
    action: "Resume Exported",
    target: "Alex_Chen_SWE_2026.pdf",
    date: "Yesterday, 10:15 AM",
    result: "v2.4 Final",
    status: "info",
    type: "export"
  },
  {
    id: "h3",
    action: "Bullet Enhancement",
    target: "Meta Platforms Intern",
    date: "Oct 24, 4:20 PM",
    result: "AI Generated",
    status: "success",
    type: "ai"
  },
  {
    id: "h4",
    action: "Cover Letter Drafted",
    target: "OpenAI Research",
    date: "Oct 22, 11:30 AM",
    result: "Ready to Send",
    status: "success",
    type: "ai"
  },
  {
    id: "h5",
    action: "Resume Template Changed",
    target: "Academic CV Style",
    date: "Oct 20, 9:00 AM",
    result: "Applied to Resume #3",
    status: "info",
    type: "edit"
  }
];

export function ActivityHistoryTab() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200 mb-3">
            <History className="w-3.5 h-3.5" /> Immutable Event Log
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Activity & Audit History</h1>
          <p className="text-slate-500 text-sm mt-1">Review every optimization, AI generation, and export event across your account.</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Export Log
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by action, target or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
        <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filters
        </button>
        <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Date Range
        </button>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Action</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Target Resource</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Execution Result</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {HISTORY_DATA.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        item.type === 'ats' ? 'bg-indigo-50 text-indigo-600' :
                        item.type === 'ai' ? 'bg-purple-50 text-purple-600' :
                        item.type === 'export' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.type === 'ats' ? <Zap className="w-4 h-4" /> :
                         item.type === 'ai' ? <Sparkles className="w-4 h-4" /> :
                         item.type === 'export' ? <FileText className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      <span className="text-xs font-bold text-slate-900">{item.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-600 font-medium">{item.target}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                      <span className={`text-[11px] font-bold ${item.status === 'success' ? 'text-emerald-700' : 'text-blue-700'}`}>
                        {item.result}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                    {item.date}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <button className="text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">
            View All Historical Events
          </button>
        </div>
      </div>
    </div>
  );
}
