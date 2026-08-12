import React from "react";
import Link from "next/link";
import { Shield, Lock, FileText, ChevronLeft, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export function LegalPage({ type }: { type: "terms" | "privacy" }) {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
          <Link
            href="/sign-in"
            aria-label="Back to sign in"
            className="absolute top-6 left-6 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors inline-flex"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          
          <div className="mt-8 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg">
              {type === "terms" ? <FileText className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                {type === "terms" ? "Terms of Service" : "Privacy Policy"}
              </h1>
              <p className="text-slate-400 text-xs mt-1">Last Updated: June 2026 • Version 1.2</p>
            </div>
          </div>
          
          {/* Decorative shapes */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="p-8 md:p-12 space-y-8 text-slate-600 leading-relaxed text-sm">
          {type === "terms" ? (
            <>
              <section className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" /> 1. Acceptance of Terms
                </h2>
                <p>
                  By accessing ResuMate, you agree to be bound by these Terms of Service. If you are a student using this for academic or professional purposes, you represent that you have the authority to bind yourself to these terms.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" /> 2. AI Content Usage
                </h2>
                <p>
                  ResuMate provides AI-generated suggestions for resume bullets and cover letters. While we strive for professional excellence, users are responsible for verifying the accuracy of all generated content before submitting it to employers.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" /> 3. User Accounts
                </h2>
                <p>
                  You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your student profile.
                </p>
              </section>

              <section className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" /> 4. Prohibited Conduct
                </h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Generating fraudulent or misleading resume information.</li>
                  <li>Attempting to bypass ATS diagnostic limits.</li>
                  <li>Scraping public resume share links.</li>
                </ul>
              </section>
            </>
          ) : (
            <>
              <section className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-indigo-600" /> 1. Data Collection
                </h2>
                <p>
                  We collect information necessary to build your professional profile, including your name, email, university details, and employment history. This data is stored securely on our PostgreSQL instances.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-indigo-600" /> 2. Public Resume Links
                </h2>
                <p>
                  When you enable &ldquo;Public Sharing&rdquo; for a resume, it becomes accessible via a unique URL. You can revoke this access at any time through your Dashboard settings.
                </p>
              </section>

              <section className="space-y-3 bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-600" /> 3. Your Data Rights
                </h2>
                <p className="text-indigo-800">
                  You have the right to export your entire resume library as JSON or request permanent deletion of your student profile and all associated analytics data.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-indigo-600" /> 4. Third Party Processing
                </h2>
                <p>
                  We use trusted AI partners to process bullet enhancements. We do not sell your personal resume data to third-party recruiters without your explicit consent via a job application match.
                </p>
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 flex justify-between items-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ResuMate Legal Hub</p>
          <div className="flex items-center gap-4">
            <Link
              href={type === "terms" ? "/privacy" : "/terms"}
              className="text-slate-500 font-bold text-xs hover:text-slate-800 transition-colors"
            >
              {type === "terms" ? "Privacy Policy" : "Terms of Service"}
            </Link>
            <Link
              href="/sign-in"
              className="flex items-center gap-2 text-indigo-600 font-bold text-xs hover:gap-3 transition-all"
            >
              I Understand, Go Back <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
