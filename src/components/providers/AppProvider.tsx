"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, errorMessage } from "@/lib/client-api";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  headline?: string | null;
  phone?: string | null;
  location?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  websiteUrl?: string | null;
  bio?: string | null;
  profilePictureUrl?: string | null;
  university?: string | null;
  department?: string | null;
  graduationYear?: string | null;
  preferredJobRole?: string | null;
  themePreference?: string | null;
  emailNotifications?: boolean | null;
  applicationAlerts?: boolean | null;
  weeklyDigest?: boolean | null;
}

export interface AppResume {
  id: string;
  title: string;
  targetRole: string | null;
  template: string;
  colorTheme: string;
  shareSlug: string;
  isPublic: boolean;
  atsScore: number;
  updatedAt: string;
  createdAt: string;
}

interface AppContextValue {
  user: AppUser | null;
  availableUsers: Pick<AppUser, "id" | "name" | "email" | "headline" | "profilePictureUrl" | "university">[];
  resumes: AppResume[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  refreshResumes: () => Promise<AppResume[]>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

/**
 * Single source of truth for the signed-in user and their resumes.
 * Every page reads from here instead of refetching the same endpoints,
 * so the sidebar counts, dashboard and builder never disagree.
 */
export function AppProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser?: AppUser | null;
}) {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(initialUser ?? null);
  const [availableUsers, setAvailableUsers] = useState<AppContextValue["availableUsers"]>([]);
  const [resumes, setResumes] = useState<AppResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshResumes = useCallback(async () => {
    const data = await api.get<{ resumes: AppResume[] }>("/api/resumes");
    setResumes(data.resumes || []);
    return data.resumes || [];
  }, []);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const me = await api.get<{ user: AppUser | null; availableUsers: AppContextValue["availableUsers"] }>(
        "/api/auth/me"
      );

      if (!me.user) {
        setUser(null);
        router.replace("/sign-in");
        return;
      }

      setUser(me.user);
      setAvailableUsers(me.availableUsers || []);
      await refreshResumes();
    } catch (err) {
      setError(errorMessage(err, "Couldn't load your workspace."));
    } finally {
      setLoading(false);
    }
  }, [router, refreshResumes]);

  // Bootstrap the workspace once on mount.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const me = await api.get<{ user: AppUser | null; availableUsers: AppContextValue["availableUsers"] }>(
          "/api/auth/me"
        );
        if (cancelled) return;

        if (!me.user) {
          setUser(null);
          router.replace("/sign-in");
          return;
        }

        setUser(me.user);
        setAvailableUsers(me.availableUsers || []);

        const data = await api.get<{ resumes: AppResume[] }>("/api/resumes");
        if (!cancelled) setResumes(data.resumes || []);
      } catch (err) {
        if (!cancelled) setError(errorMessage(err, "Couldn't load your workspace."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const signOut = useCallback(async () => {
    try {
      await api.post("/api/auth/logout");
    } finally {
      setUser(null);
      setResumes([]);
      router.replace("/sign-in");
      router.refresh();
    }
  }, [router]);

  const value = useMemo(
    () => ({ user, availableUsers, resumes, loading, error, refresh, refreshResumes, signOut }),
    [user, availableUsers, resumes, loading, error, refresh, refreshResumes, signOut]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
