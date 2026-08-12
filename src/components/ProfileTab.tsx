"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";
import { useTheme, type Theme } from "@/components/providers/ThemeProvider";
import { api, errorMessage } from "@/lib/client-api";
import { User, Mail, Phone, MapPin, Globe, Check, RefreshCw, Sparkles, Building2, BookOpen, Calendar, Briefcase, Palette, Bell, Camera, ImageIcon, AlertCircle, ShieldCheck, KeyRound, Lock } from "lucide-react";

type ProfileSection = "basic" | "university" | "career" | "security" | "preferences";

const PROFILE_SECTIONS: { id: ProfileSection; label: string; icon: React.ElementType }[] = [
  { id: "basic", label: "Basic Info", icon: User },
  { id: "university", label: "University", icon: Building2 },
  { id: "career", label: "Career Goals", icon: Briefcase },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "preferences", label: "Preferences", icon: Palette },
];

export function ProfileTab() {
  const router = useRouter();
  const { user: currentUser, refresh } = useApp();
  const { theme: appTheme, setTheme } = useTheme();
  const [form, setForm] = useState({
    name: currentUser?.name || "",
    headline: currentUser?.headline || "",
    phone: currentUser?.phone || "",
    location: currentUser?.location || "",
    linkedinUrl: currentUser?.linkedinUrl || "",
    githubUrl: currentUser?.githubUrl || "",
    websiteUrl: currentUser?.websiteUrl || "",
    bio: currentUser?.bio || "",
    // New fields
    profilePictureUrl: currentUser?.profilePictureUrl || "",
    university: currentUser?.university || "",
    department: currentUser?.department || "",
    graduationYear: currentUser?.graduationYear || "",
    preferredJobRole: currentUser?.preferredJobRole || "",
    themePreference: currentUser?.themePreference || "light",
    emailNotifications: currentUser?.emailNotifications ?? true,
    applicationAlerts: currentUser?.applicationAlerts ?? true,
    weeklyDigest: currentUser?.weeklyDigest ?? false,
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<ProfileSection>("basic");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Password Security State
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  
  // Re-seed the form when a different user loads (e.g. after a persona switch).
  // Keyed on the user id so in-progress edits are never clobbered by a refresh.
  const [formUserId, setFormUserId] = useState(currentUser?.id);
  if (currentUser && currentUser.id !== formUserId) {
    setFormUserId(currentUser.id);
    setForm({
        name: currentUser.name || "",
        headline: currentUser.headline || "",
        phone: currentUser.phone || "",
        location: currentUser.location || "",
        linkedinUrl: currentUser.linkedinUrl || "",
        githubUrl: currentUser.githubUrl || "",
        websiteUrl: currentUser.websiteUrl || "",
        bio: currentUser.bio || "",
        profilePictureUrl: currentUser.profilePictureUrl || "",
        university: currentUser.university || "",
        department: currentUser.department || "",
        graduationYear: currentUser.graduationYear || "",
        preferredJobRole: currentUser.preferredJobRole || "",
        themePreference: currentUser.themePreference || "light",
        emailNotifications: currentUser.emailNotifications ?? true,
        applicationAlerts: currentUser.applicationAlerts ?? true,
      weeklyDigest: currentUser.weeklyDigest ?? false,
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      await api.put("/api/users/profile", form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
      await refresh();
    } catch (err) {
      setError(errorMessage(err, "Failed to update your profile."));
    } finally {
      setSaving(false);
    }
  };

  /** Reset wipes all data and signs you out, so send the user back to sign-in. */
  const handleReset = async () => {
    if (!confirm("Resetting will erase your changes and reload the demo student profiles. You'll be signed out. Continue?")) return;
    setResetting(true);
    setError("");
    try {
      await api.post("/api/seed");
      router.replace("/sign-in");
      router.refresh();
    } catch (err) {
      setError(errorMessage(err, "Couldn't reset the demo data."));
      setResetting(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);

    if (!passwords.currentPassword) {
      setPwError("Enter your current password to confirm this change.");
      return;
    }

    if (passwords.newPassword.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      await api.put("/api/users/profile", {
        currentPassword: passwords.currentPassword,
        password: passwords.newPassword,
      });
      setPwSuccess(true);
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) {
      setPwError(errorMessage(err, "Couldn't update your password."));
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate upload - in production, this would upload to a storage service
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, profilePictureUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg">
                {form.profilePictureUrl ? (
                  /* Data-URI upload preview; next/image cannot optimize inline base64. */
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={form.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  form.name?.charAt(0) || "?"
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{form.name || "Student Profile"}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">{form.university || "University not set"} • {form.department || "Department not set"}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300">
                  Class of {form.graduationYear || "????"}
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  {form.preferredJobRole || "Role not set"}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleReset}
            disabled={resetting}
            className="px-4 py-2.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-xl border border-amber-200 dark:border-amber-900/60 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? "animate-spin" : ""}`} />
            {resetting ? "Resetting..." : "Reset Demo Data"}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Profile sections">
        {PROFILE_SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeSection === id}
            onClick={() => setActiveSection(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeSection === id
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 text-xs font-semibold rounded-xl border border-rose-200 dark:border-rose-900/50 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" /> {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Profile updated successfully!
          </div>
        )}

        {/* BASIC INFO SECTION */}
        {activeSection === "basic" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Basic Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  disabled
                  value={currentUser?.email || ""}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Professional Headline</label>
                <input
                  type="text"
                  value={form.headline}
                  onChange={(e) => setForm({ ...form, headline: e.target.value })}
                  placeholder="e.g. BS Computer Science @ Stanford | Seeking Fall Internships"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">City / Location</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">LinkedIn URL</label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={form.linkedinUrl}
                    onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">GitHub URL</label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={form.githubUrl}
                    onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Personal Website / Portfolio</label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={form.websiteUrl}
                    onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bio / Summary</label>
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell us about yourself, your interests, and career aspirations..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* UNIVERSITY SECTION */}
        {activeSection === "university" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> University Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">University / College</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={form.university}
                    onChange={(e) => setForm({ ...form, university: e.target.value })}
                    placeholder="e.g. Stanford University"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department / Major</label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    placeholder="e.g. Computer Science"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Expected Graduation Year</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <select
                    value={form.graduationYear}
                    onChange={(e) => setForm({ ...form, graduationYear: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Year</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CAREER SECTION */}
        {activeSection === "career" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Career Preferences
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Preferred Job Role / Career Track</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={form.preferredJobRole}
                    onChange={(e) => setForm({ ...form, preferredJobRole: e.target.value })}
                    placeholder="e.g. Software Engineer, Product Manager, Investment Banker"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> AI Career Insights
                </h3>
                <p className="text-xs text-indigo-700 dark:text-indigo-300">
                  Based on your profile as a <strong>{form.department || "student"}</strong> at <strong>{form.university || "your university"}</strong>, 
                  we recommend tailoring your resumes for <strong>{form.preferredJobRole || "your target role"}</strong> positions. 
                  Use our ATS Optimizer to match job descriptions!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECURITY SECTION */}
        {activeSection === "security" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Account Security
            </h2>
            
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 flex gap-3">
              <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">Security Recommendation</h4>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-300 leading-relaxed mt-1">
                  Use a combination of at least 12 characters including letters, numbers, and symbols to maximize your profile security.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {pwError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 text-xs font-semibold rounded-xl border border-rose-200 dark:border-rose-900/50 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" /> {pwError}
                </div>
              )}
              {pwSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Password updated successfully!
                </div>
              )}

              <div>
                <label htmlFor="pw-current" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Current Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    id="pw-current"
                    type="password"
                    autoComplete="current-password"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                    placeholder="Confirm it's really you"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pw-new" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      id="pw-new"
                      type="password"
                      autoComplete="new-password"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                      placeholder="Min 8 characters"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="password"
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                      placeholder="Repeat password"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handlePasswordChange}
                  disabled={saving}
                  className="w-full sm:w-auto px-8 py-3 bg-slate-900 hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Update Security Credentials
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PREFERENCES SECTION */}
        {activeSection === "preferences" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Preferences & Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Theme Preference</label>
                <div className="grid grid-cols-3 gap-3">
                  {["light", "dark", "system"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setForm({ ...form, themePreference: t });
                        setTheme(t as Theme);
                      }}
                      className={`p-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                        appTheme === t
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Notification Settings
                </label>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Email Notifications</span>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Receive updates about your account</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.emailNotifications}
                      onChange={(e) => setForm({ ...form, emailNotifications: e.target.checked })}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Application Status Alerts</span>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Get notified when application status changes</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.applicationAlerts}
                      onChange={(e) => setForm({ ...form, applicationAlerts: e.target.checked })}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Weekly Digest</span>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Resume tips and job market insights</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.weeklyDigest}
                      onChange={(e) => setForm({ ...form, weeklyDigest: e.target.checked })}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            {saving ? "Saving..." : <><Check className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
}
