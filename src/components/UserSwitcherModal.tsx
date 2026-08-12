"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, Plus, X, Sparkles, Check, AlertTriangle, Lock } from "lucide-react";
import { api, errorMessage } from "@/lib/client-api";
import type { AppUser } from "@/components/providers/AppProvider";

type SwitchableUser = Pick<AppUser, "id" | "name" | "email" | "headline" | "profilePictureUrl" | "university">;

const DEMO_PASSWORD = "demo1234";

export function UserSwitcherModal({
  isOpen,
  onClose,
  currentUser,
  availableUsers,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  availableUsers: SwitchableUser[];
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"switch" | "register">("switch");
  const [pendingUser, setPendingUser] = useState<SwitchableUser | null>(null);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [form, setForm] = useState({ name: "", email: "", headline: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  // Reset transient state whenever the modal opens. Doing this during render
  // rather than in an effect means the modal never flashes its previous state.
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setMode("switch");
      setPendingUser(null);
      setPassword(DEMO_PASSWORD);
      setError("");
    }
  }

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  /**
   * Switching personas is a real sign-in: it goes through /api/auth/login
   * with a password, so there is no back door that logs a visitor into an
   * arbitrary account.
   */
  const confirmSwitch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUser) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/api/auth/login", { email: pendingUser.email, password });
      onClose();
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(errorMessage(err, "Couldn't switch accounts."));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/api/auth/register", form);
      onClose();
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(errorMessage(err, "Registration failed."));
    } finally {
      setLoading(false);
    }
  };

  const title =
    mode === "register"
      ? "Create Student Profile"
      : pendingUser
        ? `Sign in as ${pendingUser.name}`
        : "Switch Student Account";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs p-4"
      onMouseDown={(e) => {
        if (!dialogRef.current?.contains(e.target as Node)) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto text-slate-900 dark:text-slate-100"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          {mode === "register"
            ? "Set up your student profile to start generating tailored resumes."
            : pendingUser
              ? "Confirm the account password to continue."
              : "Choose a seeded student persona or register your own account."}
        </p>

        {error && (
          <div
            role="alert"
            className="p-3 mb-4 text-xs bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 rounded-lg border border-rose-200 dark:border-rose-900/50 flex items-start gap-2"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
          </div>
        )}

        {/* ── Confirm password to switch ─────────────────── */}
        {mode === "switch" && pendingUser && (
          <form onSubmit={confirmSwitch} className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
              <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">{pendingUser.name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{pendingUser.email}</div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Seeded demo accounts use <code className="font-mono font-bold text-slate-500 dark:text-slate-300">{DEMO_PASSWORD}</code>.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPendingUser(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-60"
              >
                {loading ? "Switching…" : "Switch Account"}
              </button>
            </div>
          </form>
        )}

        {/* ── Persona list ───────────────────────────────── */}
        {mode === "switch" && !pendingUser && (
          <div className="space-y-3">
            <div className="space-y-2">
              {availableUsers.map((u) => {
                const isSelected = currentUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      if (isSelected) return onClose();
                      setPendingUser(u);
                      setPassword(DEMO_PASSWORD);
                      setError("");
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-indigo-50/70 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-500/20"
                        : "bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700 hover:bg-indigo-50/30 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{u.name}</span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-medium">
                            <Check className="w-3 h-3" /> Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{u.headline || u.email}</p>
                    </div>
                    <UserCheck className={`w-5 h-5 shrink-0 ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-4">
              <button
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" /> Register New Student Account
              </button>
            </div>
          </div>
        )}

        {/* ── Register ───────────────────────────────────── */}
        {mode === "register" && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Jordan Lee"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={MODAL_INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Student Email *</label>
              <input
                type="email"
                required
                placeholder="jordan.lee@university.edu"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={MODAL_INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password * <span className="font-normal text-slate-400 dark:text-slate-500">(min 8 chars, 1 number)</span>
              </label>
              <input
                type="password"
                required
                placeholder="Create a password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={MODAL_INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Major & Headline</label>
              <input
                type="text"
                placeholder="BS Computer Engineering @ Stanford"
                value={form.headline}
                onChange={(e) => setForm({ ...form, headline: e.target.value })}
                className={MODAL_INPUT}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setMode("switch")}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors disabled:opacity-60"
              >
                {loading ? "Registering…" : "Create Account"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const MODAL_INPUT =
  "w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500";
