import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ResuMate — AI-Powered Student Resume Builder",
    template: "%s",
  },
  description:
    "Build, tailor and optimize student resumes with real-time ATS scoring, AI bullet enhancement and smart job matching.",
  applicationName: "ResuMate",
  keywords: ["resume builder", "student resume", "ATS", "internship", "cover letter"],
  openGraph: {
    title: "ResuMate — AI-Powered Student Resume Builder",
    description:
      "Create recruiter-ready resumes with live ATS scoring, AI bullet rewriting and internship matching.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('resumate_theme');
                  var isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (saved === 'system') {
                    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  }
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased transition-colors duration-200">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
