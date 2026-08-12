import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-10 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
          <FileQuestion className="w-8 h-8 text-slate-400" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Page not found</h1>
        <p className="text-sm text-slate-500">
          The page you&apos;re looking for doesn&apos;t exist, or the resume link may have been removed.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
