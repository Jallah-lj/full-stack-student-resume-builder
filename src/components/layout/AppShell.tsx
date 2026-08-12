"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, ChevronRight, AlertTriangle, Sun, Moon, Monitor } from "lucide-react";
import { NAV_GROUPS, BOTTOM_NAV, isActive, titleForPath } from "@/components/navigation";
import { useApp } from "@/components/providers/AppProvider";
import { useTheme, type Theme } from "@/components/providers/ThemeProvider";
import { UserSwitcherModal } from "@/components/UserSwitcherModal";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, availableUsers, resumes, error, refresh, signOut } = useApp();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const activeLabel = titleForPath(pathname);

  // Close the drawer whenever the route changes. Adjusting state during render
  // (instead of in an effect) avoids a flash of the open drawer on the new page.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setIsMobileMenuOpen(false);
  }

  // Close on outside tap.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isMobileMenuOpen]);

  // Close when resizing up to desktop.
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100">
      {/* ── HEADER ─────────────────────────────────────── */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/dashboard" className="flex items-center gap-2 select-none">
              <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-black text-white text-base shadow-md">
                R
              </div>
              <div className="hidden sm:block">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">ResuMate</span>
                <span className="hidden md:inline ml-1.5 text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 px-1.5 py-0.5 rounded font-mono">
                  FOR STUDENTS
                </span>
              </div>
            </Link>

            <div className="hidden sm:flex lg:hidden items-center gap-1.5 text-slate-500 text-xs ml-2">
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-300 font-semibold">{activeLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Theme Switcher Button */}
            <button
              onClick={() => {
                const nextTheme: Theme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
                setTheme(nextTheme);
              }}
              title={`Theme: ${theme} (Click to toggle)`}
              aria-label="Toggle theme mode"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all text-xs font-medium"
            >
              {theme === "system" ? (
                <Monitor className="w-4 h-4 text-purple-400" />
              ) : resolvedTheme === "dark" ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
              <span className="hidden md:inline capitalize text-[11px] font-bold">
                {theme}
              </span>
            </button>

            <button
              onClick={() => setIsSwitcherOpen(true)}
              className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all"
            >
              <div className="w-7 h-7 shrink-0 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                {user?.profilePictureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || "?"
                )}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-white font-bold text-xs leading-none truncate max-w-[120px]">
                  {user?.name || "…"}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  {user?.university || user?.email}
                </div>
              </div>
              <span className="hidden sm:inline text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-bold">
                Switch
              </span>
            </button>

            <button
              onClick={signOut}
              title="Sign out"
              aria-label="Sign out"
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/50 border border-slate-700 text-slate-400 hover:text-rose-400 transition-all"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── BODY ───────────────────────────────────────── */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 flex gap-4 sm:gap-6">
        <aside
          ref={sidebarRef}
          className={`
            fixed top-14 sm:top-16 left-0 bottom-0 w-64 sm:w-60 xl:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl z-40
            overflow-y-auto thin-scrollbar transition-transform duration-300 ease-in-out print:hidden
            lg:static lg:shadow-sm lg:rounded-2xl lg:border lg:border-slate-200 dark:lg:border-slate-800 lg:translate-x-0 lg:self-start lg:sticky lg:top-20 lg:h-auto
            ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <nav className="p-3 pb-20 lg:pb-3" aria-label="Main navigation">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="mb-3">
                <div className="px-2 py-1 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {group.label}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = isActive(item, pathname);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                          active
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            item.href === "/ai-studio" && !active ? "text-purple-500" : ""
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                        {item.href === "/resumes" && resumes.length > 0 && (
                          <span
                            className={`ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                              active ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            {resumes.length}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {user && (
              <Link
                href="/profile"
                className="mt-2 block p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 shrink-0 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                    {user.profilePictureUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      user.name?.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">{user.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.university || user.email}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {user.graduationYear && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300">
                      &apos;{user.graduationYear.slice(-2)}
                    </span>
                  )}
                  {user.preferredJobRole && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 truncate max-w-[120px]">
                      {user.preferredJobRole}
                    </span>
                  )}
                </div>
              </Link>
            )}
          </nav>
        </aside>

        <main className="flex-1 min-w-0 overflow-hidden">
          {error ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-rose-200 dark:border-rose-900/50 text-center space-y-3">
              <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Couldn&apos;t load your workspace</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">{error}</p>
              <button
                onClick={() => void refresh()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
              >
                Try again
              </button>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* ── MOBILE TAB BAR ─────────────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-lg print:hidden"
        aria-label="Quick navigation"
      >
        <div className="grid grid-cols-5 h-14 max-w-lg mx-auto">
          {BOTTOM_NAV.map((item) => {
            const active = isActive(item, pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center justify-center gap-0.5 text-[9px] font-bold transition-colors ${
                  active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-colors ${active ? "bg-indigo-50 dark:bg-indigo-950/60" : ""}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="lg:hidden h-14 print:hidden" aria-hidden />

      <UserSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        currentUser={user}
        availableUsers={availableUsers}
      />
    </div>
  );
}
