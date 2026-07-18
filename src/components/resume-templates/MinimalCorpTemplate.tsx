import React from "react";
import { ResumeData, parseBullets, getColorClass, getFontSizeClass } from "./types";

export function MinimalCorpTemplate({ data }: { data: ResumeData }) {
  const { resume, user, education, workExperiences, projects, extracurriculars, skills } = data;
  const theme = getColorClass(resume.colorTheme);
  const fontSize = getFontSizeClass(resume.fontSize);

  return (
    <div className={`p-8 bg-white text-slate-900 rounded-lg shadow-sm print:p-0 print:shadow-none font-sans ${fontSize} max-w-[800px] mx-auto min-h-[1000px] flex flex-col justify-between`}>
      <div>
        {/* Compact Top Header */}
        <header className="mb-6 flex justify-between items-end border-b-2 border-slate-900 pb-3">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
              {user.name}
            </h1>
            <p className="text-xs font-semibold text-slate-600 tracking-wide uppercase mt-0.5">{user.headline || "Applicant"}</p>
          </div>
          <div className="text-right text-[11px] font-mono text-slate-700 space-y-0.5">
            <div>{user.email} {user.phone ? `| ${user.phone}` : ""}</div>
            <div>{user.location} {user.linkedinUrl ? `| ${user.linkedinUrl}` : ""}</div>
          </div>
        </header>

        {/* Education */}
        {education.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-black uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 mb-2 rounded-xs">
              Education
            </h2>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} className="grid grid-cols-4 gap-2 text-[11px]">
                  <div className="col-span-1 font-mono text-slate-600 font-medium">
                    {edu.startDate} – {edu.endDate}
                  </div>
                  <div className="col-span-3">
                    <div className="font-bold text-slate-900">{edu.institution}</div>
                    <div>{edu.degree} in {edu.major} {edu.gpa ? `(GPA: ${edu.gpa})` : ""}</div>
                    {edu.coursework && <div className="text-slate-600 mt-0.5">Courses: {edu.coursework}</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {workExperiences.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-black uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 mb-2 rounded-xs">
              Work Experience
            </h2>
            <div className="space-y-3">
              {workExperiences.map((work) => {
                const bullets = parseBullets(work.bullets);
                return (
                  <div key={work.id} className="grid grid-cols-4 gap-2 text-[11px]">
                    <div className="col-span-1 font-mono text-slate-600 font-medium">
                      {work.startDate} – {work.isCurrent ? "Present" : work.endDate}
                    </div>
                    <div className="col-span-3">
                      <div className="font-bold text-slate-900">{work.role} <span className="font-semibold text-slate-700">@ {work.company}</span></div>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 mt-1">
                        {bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-black uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 mb-2 rounded-xs">
              Projects
            </h2>
            <div className="space-y-3">
              {projects.map((proj) => {
                const bullets = parseBullets(proj.bullets);
                return (
                  <div key={proj.id} className="grid grid-cols-4 gap-2 text-[11px]">
                    <div className="col-span-1 font-mono text-slate-600 font-medium">
                      {proj.date}
                    </div>
                    <div className="col-span-3">
                      <div className="font-bold text-slate-900">{proj.title} <span className="font-normal text-slate-600">({proj.roleOrTechnologies})</span></div>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 mt-1">
                        {bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-black uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 mb-2 rounded-xs">
              Technical & Professional Competencies
            </h2>
            <div className="space-y-1 text-[11px]">
              {skills.map((s) => (
                <div key={s.id} className="grid grid-cols-4 gap-2">
                  <span className="col-span-1 font-bold text-slate-900">{s.category}</span>
                  <span className="col-span-3 text-slate-800">{s.skillsList}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <footer className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-200 print:hidden">
        Minimal Corporate Resume Format
      </footer>
    </div>
  );
}
