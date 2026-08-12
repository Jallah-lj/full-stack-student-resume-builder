"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles, Mail, Lock, User, GraduationCap, ArrowRight,
  ShieldCheck, AlertTriangle, Database, Terminal, Eye, EyeOff,
} from "lucide-react";
import { api, errorMessage } from "@/lib/client-api";

const DEMO_PASSWORD = "demo1234";

const DEMO_ACCOUNTS = [
  { name: "Alex Chen", sub: "CS @ Berkeley", email: "alex.chen@berkeley.edu" },
  { name: "Maya Patel", sub: "Bio @ Hopkins", email: "m.patel@jhu.edu" },
];

export default function AuthPage({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLogin = mode === "sign-in";

  // Where to land after auth — set by the middleware when it intercepts.
  const nextPath = searchParams.get("next") || "/dashboard";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [checkingDb, setCheckingDb] = useState(true);

  const [formData, setFormData] = useState({ name: "", email: "", headline: "", password: "" });

  // Surface database/setup problems up front rather than as a failed login.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.get<{ ok: boolean; error?: string; detail?: string }>("/api/health");
        if (!cancelled && !data.ok) setDbError(data.detail || data.error || "Database connection failed.");
      } catch (err) {
        if (!cancelled) setDbError(errorMessage(err, "Could not reach the server."));
      } finally {
        if (!cancelled) setCheckingDb(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isLogin) {
        await api.post("/api/auth/login", { email: formData.email, password: formData.password });
      } else {
        await api.post("/api/auth/register", formData);
      }
      // Full navigation so the server layout re-reads the new session cookie.
      router.replace(nextPath);
      router.refresh();
    } catch (err) {
      setError(errorMessage(err, isLogin ? "Sign in failed." : "Registration failed."));
      setLoading(false);
    }
  };

  const fillDemoAccount = (email: string) => {
    setFormData((f) => ({ ...f, email, password: DEMO_PASSWORD }));
    setError("");
  };

  // ── Database setup error screen ─────────────────────────────
  if (!checkingDb && dbError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <div className="flex items-center gap-3 justify-center">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-xl">R</div>
            <span className="text-white font-black text-xl">ResuMate</span>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-rose-500/30 p-6 sm:p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h1 className="text-white font-black text-lg">Database Connection Error</h1>
                <p className="text-slate-400 text-sm mt-1">{dbError}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-slate-300 font-bold text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" /> Fix it in 3 steps:
              </h2>

              {[
                {
                  step: "1",
                  title: "Create your .env file",
                  code: "cp .env.example .env",
                  note: "Then open .env and set your PostgreSQL connection string:",
                  extra: "DATABASE_URL=postgresql://USER:PASS@localhost:5432/resumate_db",
                },
                {
                  step: "2",
                  title: "Push the database schema",
                  code: "npx drizzle-kit push",
                  note: "This creates all required tables in your PostgreSQL database.",
                },
                {
                  step: "3",
                  title: "Start the development server",
                  code: "npm run dev",
                  note: "Then visit http://localhost:3000 — demo data loads automatically.",
                },
              ].map(({ step, title, code, note, extra }) => (
                <div key={step} className="bg-slate-800/60 rounded-xl border border-slate-700 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-[11px] font-black text-white shrink-0">
                      {step}
                    </span>
                    <span className="text-white font-bold text-sm">{title}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950 rounded-lg px-3 py-2 mb-2">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <code className="text-emerald-400 text-xs font-mono">{code}</code>
                  </div>
                  <p className="text-slate-400 text-xs">{note}</p>
                  {extra && (
                    <div className="flex items-center gap-2 bg-slate-950 rounded-lg px-3 py-2 mt-2">
                      <code className="text-amber-400 text-xs font-mono break-all">{extra}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors"
            >
              Retry Connection
            </button>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <p className="text-slate-500 text-xs text-center">
              <span className="font-bold text-slate-400">Don&apos;t have PostgreSQL?</span> Use{" "}
              <a href="https://www.postgresql.org/download/" target="_blank" rel="noreferrer" className="text-indigo-400 underline">
                postgresql.org/download
              </a>
              ,{" "}
              <a href="https://railway.app" target="_blank" rel="noreferrer" className="text-indigo-400 underline">
                Railway
              </a>
              , or{" "}
              <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline">
                Supabase
              </a>{" "}
              for a free hosted DB.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (checkingDb) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-xl">R</div>
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-xs">Connecting to database…</p>
      </div>
    );
  }

  // ── Auth UI ─────────────────────────────────────────────────
  const otherHref = isLogin ? "/sign-up" : "/sign-in";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col md:flex-row min-h-[580px]">
        {/* Sliding promo panel (desktop) */}
        <div
          className={`absolute top-0 w-1/2 h-full bg-indigo-600 z-20 hidden md:flex flex-col items-center justify-center text-white p-10 text-center shadow-2xl transition-all duration-700 ease-in-out ${
            isLogin ? "left-1/2 rounded-l-[80px]" : "left-0 rounded-r-[80px]"
          }`}
        >
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto shadow-inner mb-5">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight leading-tight mb-3">
            {isLogin ? "New to ResuMate?" : "Welcome back!"}
          </h2>
          <p className="text-indigo-100 text-sm leading-relaxed max-w-xs mb-6">
            {isLogin
              ? "Join 5,000+ students building careers at top-tier companies with AI-powered resumes."
              : "Continue tailoring your professional story and tracking your application performance."}
          </p>
          <Link
            href={otherHref}
            className="px-8 py-3 rounded-full border-2 border-white/50 hover:border-white hover:bg-white hover:text-indigo-600 font-bold text-sm transition-all"
          >
            {isLogin ? "Sign Up Now" : "Sign In"}
          </Link>
          <div className="absolute -top-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        </div>

        {/* Form panel */}
        <div className={`w-full md:w-1/2 flex items-center justify-center p-6 sm:p-10 ${isLogin ? "" : "md:order-2"}`}>
          <div className="w-full max-w-sm space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">R</div>
                <span className="font-black text-slate-900 text-sm">ResuMate</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {isLogin ? "Sign In" : "Create Account"}
              </h1>
              <p className="text-slate-500 text-xs mt-1">
                {isLogin ? "Use your student email to continue." : "Build your professional student identity."}
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="p-3 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-100 flex items-start gap-2"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-3">
              {!isLogin && (
                <Field label="Full Name" Icon={User}>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Jordan Smith"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={INPUT}
                  />
                </Field>
              )}

              <Field label="Email Address" Icon={Mail}>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="alex.chen@berkeley.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={INPUT}
                />
              </Field>

              <Field label={isLogin ? "Password" : "Password (min 8 chars, 1 number)"} Icon={Lock}>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  placeholder={isLogin ? "••••••••" : "Create a password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`${INPUT} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </Field>

              {!isLogin && (
                <Field label="Academic Headline (optional)" Icon={GraduationCap}>
                  <input
                    type="text"
                    placeholder="BS Physics @ MIT '26"
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    className={INPUT}
                  />
                </Field>
              )}

              {!isLogin && (
                <div className="flex items-start gap-2 pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-[9px] text-slate-500 leading-snug">
                    By signing up, you agree to our{" "}
                    <Link href="/terms" className="font-bold underline hover:text-indigo-600">
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="font-bold underline hover:text-indigo-600">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 ${
                  isLogin ? "bg-slate-900 hover:bg-black text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                {loading ? (
                  isLogin ? "Signing in…" : "Creating…"
                ) : (
                  <>
                    <span>{isLogin ? "Sign In" : "Get Started"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {isLogin && (
              <>
                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-[10px] text-slate-400 font-bold uppercase">Demo quick login</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_ACCOUNTS.map((u) => (
                    <button
                      key={u.email}
                      type="button"
                      onClick={() => fillDemoAccount(u.email)}
                      className="py-2.5 px-3 border border-slate-200 rounded-xl text-left hover:bg-slate-50 hover:border-indigo-200 transition-colors"
                    >
                      <div className="text-[11px] font-black text-slate-800">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.sub}</div>
                    </button>
                  ))}
                </div>
                <p className="text-center text-[10px] text-slate-400">
                  Demo password: <code className="font-mono font-bold text-slate-500">{DEMO_PASSWORD}</code>
                </p>
              </>
            )}

            <p className="md:hidden text-center text-xs text-slate-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <Link href={otherHref} className="text-indigo-600 font-bold underline">
                {isLogin ? "Sign Up" : "Sign In"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const INPUT =
  "w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all";

function Field({
  label,
  Icon,
  children,
}: {
  label: string;
  Icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
        {children}
      </div>
    </div>
  );
}
