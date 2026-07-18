import React from "react";
import { ResumeData, parseBullets, getColorClass, getFontSizeClass } from "./types";

export function AcademicResearchTemplate({ data }: { data: ResumeData }) {
  const { resume, user, education, workExperiences, projects, extracurriculars, skills, certifications } = data;
  const theme = getColorClass(resume.colorTheme);
  const fontSize = getFontSizeClass(resume.fontSize);

  return (
    <div className={`p-8 bg-white text-gray-900 rounded-lg shadow-sm print:p-0 print:shadow-none font-serif ${fontSize} max-w-[800px] mx-auto min-h-[1000px] flex flex-col justify-between`}>
      <div>
        <header className="border-b-2 border-emerald-900 pb-3 mb-5">
          <h1 className="text-2xl font-bold tracking-tight text-emerald-950">
            {user.name}
          </h1>
          <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mt-0.5">{user.headline || "Academic Scholar & Researcher"}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-sans text-gray-700 mt-2">
            <span>{user.email}</span>
            {user.phone && <span>• {user.phone}</span>}
            {user.location && <span>• {user.location}</span>}
            {user.websiteUrl && <span>• {user.websiteUrl}</span>}
          </div>
        </header>

        {/* Education */}
        {education.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-900 border-b border-emerald-200 pb-1 mb-2">
              Education & Honors
            </h2>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>{edu.institution}</span>
                    <span className="font-normal text-[11px] font-sans">{edu.startDate} – {edu.endDate}</span>
                  </div>
                  <div className="italic text-gray-800">{edu.degree} in {edu.major} {edu.minor ? `| Minor in ${edu.minor}` : ""}</div>
                  {edu.gpa && <p className="text-[11px] font-sans font-medium text-emerald-900 mt-0.5">Cumulative GPA: {edu.gpa} {edu.honors ? `(${edu.honors})` : ""}</p>}
                  {edu.coursework && <p className="text-[11px] text-gray-700 mt-0.5"><strong>Advanced Coursework:</strong> {edu.coursework}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Research Experience */}
        {workExperiences.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-900 border-b border-emerald-200 pb-1 mb-2">
              Research & Academic Appointments
            </h2>
            <div className="space-y-3">
              {workExperiences.map((work) => {
                const bullets = parseBullets(work.bullets);
                return (
                  <div key={work.id}>
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>{work.company}</span>
                      <span className="font-normal text-[11px] font-sans">{work.startDate} – {work.isCurrent ? "Present" : work.endDate}</span>
                    </div>
                    <p className="italic text-gray-800 text-[11px] mb-1">{work.role}</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-800 text-[11px]">
                      {bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Projects / Publications */}
        {projects.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-900 border-b border-emerald-200 pb-1 mb-2">
              Publications, Grants & Research Projects
            </h2>
            <div className="space-y-3">
              {projects.map((proj) => {
                const bullets = parseBullets(proj.bullets);
                return (
                  <div key={proj.id}>
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>{proj.title} {proj.roleOrTechnologies ? <span className="font-normal text-gray-700">[{proj.roleOrTechnologies}]</span> : null}</span>
                      <span className="font-normal text-[11px] font-sans">{proj.date}</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-gray-800 text-[11px]">
                      {bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Laboratory & Technical Skills */}
        {skills.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-900 border-b border-emerald-200 pb-1 mb-2">
              Laboratory, Analytical & Computing Skills
            </h2>
            <div className="space-y-1 text-[11px]">
              {skills.map((s) => (
                <div key={s.id}>
                  <strong className="font-bold">{s.category}: </strong>
                  <span>{s.skillsList}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <footer className="text-center text-[10px] text-gray-400 pt-4 border-t border-gray-200 print:hidden font-sans">
        Academic Research CV Format
      </footer>
    </div>
  );
}
