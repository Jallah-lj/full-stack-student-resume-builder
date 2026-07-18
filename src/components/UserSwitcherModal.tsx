"use client";

import React, { useState } from "react";
import { UserCheck, Plus, X, Sparkles, Check } from "lucide-react";

export function UserSwitcherModal({
  isOpen,
  onClose,
  currentUser,
  availableUsers,
  onSelectUser,
  onUserRegistered,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  availableUsers: any[];
  onSelectUser: (userId: string) => void;
  onUserRegistered: () => void;
}) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    headline: "",
    phone: "",
    location: "",
    linkedinUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      setError("Name and Email are required.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      onUserRegistered();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">
            {isRegistering ? "Create Student Profile" : "Switch Student Account"}
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-5">
          {isRegistering
            ? "Set up your student profile to start generating tailored resumes."
            : "Choose a pre-seeded student persona or switch to your own account."}
        </p>

        {!isRegistering ? (
          <div className="space-y-3">
            <div className="space-y-2">
              {availableUsers.map((u) => {
                const isSelected = currentUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSelectUser(u.id);
                      onClose();
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20"
                        : "bg-slate-50/50 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">{u.name}</span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-medium">
                            <Check className="w-3 h-3" /> Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{u.headline || u.email}</p>
                    </div>
                    <UserCheck className={`w-5 h-5 ${isSelected ? "text-indigo-600" : "text-slate-400"}`} />
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 mt-4">
              <button
                onClick={() => setIsRegistering(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" /> Register New Student Account
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            {error && <div className="p-3 text-xs bg-rose-50 text-rose-700 rounded-lg border border-rose-200">{error}</div>}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Jordan Lee"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Student Email *</label>
              <input
                type="email"
                required
                placeholder="jordan.lee@university.edu"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Major & Headline</label>
              <input
                type="text"
                placeholder="e.g. BS Computer Engineering @ Stanford | Seeking Fall Internships"
                value={form.headline}
                onChange={(e) => setForm({ ...form, headline: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  placeholder="(555) 019-2831"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="San Jose, CA"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
              >
                {loading ? "Registering..." : "Create Account"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
