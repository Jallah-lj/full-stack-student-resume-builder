"use client";

import React, { useState } from "react";
import { Printer, Copy, Check, Share2, Sparkles } from "lucide-react";

export function PublicResumeHeader({ resumeTitle, userName }: { resumeTitle: string; userName: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            ResuMate Verified Resume
          </span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 mt-1">{userName} — {resumeTitle}</h1>
        <p className="text-xs text-slate-500">Official candidate profile exported for recruiting & applications.</p>
      </div>

      <div className="flex items-center gap-2.5 w-full sm:w-auto">
        <button
          onClick={handleCopyLink}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
          {copied ? "Link Copied!" : "Copy Link"}
        </button>

        <button
          onClick={handlePrint}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF
        </button>
      </div>
    </div>
  );
}
