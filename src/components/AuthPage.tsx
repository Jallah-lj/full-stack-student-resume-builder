"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Mail, Lock, User, GraduationCap, ArrowRight, ShieldCheck, AlertTriangle, Database, Terminal } from "lucide-react";
import { LegalPage } from "./LegalPage";

export default function AuthPage({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLegal, setShowLegal] = useState<"terms" | "privacy" | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [checkingDb, setCheckingDb] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    headline: "",
    password: "",
  });

  // Check DB connectivity on mount so we can show a helpful error
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch("/api/health");
        // If we get HTML back (not JSON), the server itself is broken
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          setDbError("The API server returned an unexpected response. Make sure the Next.js server is running (npm run dev).");
          return;
        }
        const data = await res.json();
        if (!data.ok) {
          setDbError(data.detail || data.error || "Database connection failed.");
        }
      } catch {
        setDbError("Could not reach the server. Make sure you ran 'npm run dev' and the server is running on port 3000.");
      } finally {
        setCheckingDb(false);
      }
    };
    checkHealth();
  }, []);

  if (showLegal) return <LegalPage type={showLegal} onBack={() => setShowLegal(null)} />;

  const toggleAuth = () => { setIsLogin(!isLogin); setError(""); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Server returned an unexpected response. Check your DATABASE_URL in .env and restart the server.");
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Server returned an unexpected response. Check your DATABASE_URL in .env and restart the server.");
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── DB Setup Error Screen ─────────────────────────────────────
  if (!checkingDb && dbError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          {/* Brand */}
          <div className="flex items-center gap-3 justify-center">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-xl">R</div>
            <span className="text-white font-black text-xl">ResuMate</span>
          </div>

          {/* Error Card */}
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

            {/* Setup Steps */}
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
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-[11px] font-black text-white shrink-0">{step}</span>
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

            {/* Retry */}
            <button
              onClick={() => { setDbError(null); setCheckingDb(true); window.location.reload(); }}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors"
            >
              Retry Connection
            </button>
          </div>

          {/* PostgreSQL quick install hint */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <p className="text-slate-500 text-xs text-center">
              <span className="font-bold text-slate-400">Don't have PostgreSQL?</span>
              {" "}Use{" "}
              <a href="https://www.postgresql.org/download/" target="_blank" rel="noreferrer" className="text-indigo-400 underline">postgresql.org/download</a>,{" "}
              <a href="https://railway.app" target="_blank" rel="noreferrer" className="text-indigo-400 underline">Railway.app</a>, or{" "}
              <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline">Supabase</a> for a free hosted DB.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Checking DB spinner ──
  if (checkingDb) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-xl">R</div>
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-xs">Connecting to database...</p>
      </div>
    );
  }

  // ── Normal Auth UI ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 overflow-hidden">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col md:flex-row min-h-[580px]">

        {/* Sliding Overlay (desktop) */}
        <div className={`
          absolute top-0 w-1/2 h-full bg-indigo-600 z-20
          hidden md:flex flex-col items-center justify-center text-white p-10 text-center shadow-2xl
          transition-all duration-700 ease-in-out
          ${isLogin ? "left-1/2 rounded-l-[80px]" : "left-0 rounded-r-[80px]"}
        `}>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto shadow-inner mb-5">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight leading-tight mb-3">
            {isLogin ? "New to ResuMate?" : "Welcome Back!"}
          </h2>
          <p className="text-indigo-100 text-sm leading-relaxed max-w-xs mb-6">
            {isLogin
              ? "Join 5,000+ students building careers at top-tier companies with AI-powered resumes."
              : "Continue tailoring your professional story and tracking your application performance."}
          </p>
          <button onClick={toggleAuth} className="px-8 py-3 rounded-full border-2 border-white/50 hover:border-white hover:bg-white hover:text-indigo-600 font-bold text-sm transition-all">
            {isLogin ? "Sign Up Now" : "Sign In"}
          </button>
          <div className="absolute -top-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        </div>

        {/* Login Panel */}
        <div className={`w-full md:w-1/2 flex items-center justify-center p-6 sm:p-10 transition-all duration-700
          ${isLogin ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none absolute md:static"}`}>
          <div className="w-full max-w-sm space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">R</div>
                <span className="font-black text-slate-900 text-sm">ResuMate</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Sign In</h1>
              <p className="text-slate-500 text-xs mt-1">Use your student email to continue.</p>
            </div>

            {error && isLogin && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-100 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input type="email" required placeholder="alex.chen@berkeley.edu"
                    value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input type="password" placeholder="••••••••"
                    value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-sm transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? "Signing in..." : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-2 text-[10px] text-slate-400 font-bold uppercase">Demo Quick Login</span></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: "Alex Chen", sub: "CS @ Berkeley", email: "alex.chen@berkeley.edu" },
                { name: "Maya Patel", sub: "Bio @ Hopkins", email: "m.patel@jhu.edu" },
              ].map((u) => (
                <button key={u.email} type="button"
                  onClick={() => setFormData({ ...formData, email: u.email, password: "demo_password" })}
                  className="py-2.5 px-3 border border-slate-200 rounded-xl text-left hover:bg-slate-50 hover:border-indigo-200 transition-colors">
                  <div className="text-[11px] font-black text-slate-800">{u.name}</div>
                  <div className="text-[10px] text-slate-400">{u.sub}</div>
                </button>
              ))}
            </div>

            <p className="md:hidden text-center text-xs text-slate-500">
              Don&apos;t have an account?{" "}
              <button type="button" onClick={toggleAuth} className="text-indigo-600 font-bold underline">Sign Up</button>
            </p>
          </div>
        </div>

        {/* Register Panel */}
        <div className={`w-full md:w-1/2 flex items-center justify-center p-6 sm:p-10 transition-all duration-700
          ${!isLogin ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none absolute md:static"}`}>
          <div className="w-full max-w-sm space-y-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Create Account</h1>
              <p className="text-slate-500 text-xs mt-1">Build your professional student identity.</p>
            </div>

            {error && !isLogin && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-100 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3">
              {[
                { label: "Full Name", placeholder: "Jordan Smith", field: "name" as const, type: "text", Icon: User, required: true },
                { label: "Email", placeholder: "jordan@university.edu", field: "email" as const, type: "email", Icon: Mail, required: true },
                { label: "Password (min 6 chars)", placeholder: "Create a password", field: "password" as const, type: "password", Icon: Lock, required: true },
                { label: "Academic Headline (optional)", placeholder: "BS Physics @ MIT '26", field: "headline" as const, type: "text", Icon: GraduationCap, required: false },
              ].map(({ label, placeholder, field, type, Icon, required }) => (
                <div key={field}>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{label}</label>
                  <div className="relative">
                    <Icon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input type={type} required={required} placeholder={placeholder}
                      value={formData[field]} onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all" />
                  </div>
                </div>
              ))}

              <div className="flex items-start gap-2 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[9px] text-slate-500 leading-snug">
                  By signing up, you agree to our{" "}
                  <button type="button" onClick={() => setShowLegal("terms")} className="font-bold underline hover:text-indigo-600">Terms</button> and{" "}
                  <button type="button" onClick={() => setShowLegal("privacy")} className="font-bold underline hover:text-indigo-600">Privacy Policy</button>.
                </p>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? "Creating..." : <><span>Get Started</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <p className="md:hidden text-center text-xs text-slate-500">
              Already have an account?{" "}
              <button type="button" onClick={toggleAuth} className="text-indigo-600 font-bold underline">Sign In</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
