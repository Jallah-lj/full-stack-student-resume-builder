"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ResuMate] unhandled error", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-rose-200 shadow-sm p-10 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-rose-500" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Something went wrong</h1>
        <p className="text-sm text-slate-500">
          {error.message || "An unexpected error occurred while rendering this page."}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
