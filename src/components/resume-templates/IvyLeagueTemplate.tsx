import React from "react";
import { ResumeData, parseBullets, getColorClass, getFontSizeClass } from "./types";

export function IvyLeagueTemplate({ data }: { data: ResumeData }) {
  const { resume, user, education, workExperiences, projects, extracurriculars, skills, certifications } = data;
  const theme = getColorClass(resume.colorTheme);
  const fontSize = getFontSizeClass(resume.fontSize);

  return (
    <div className={`p-8 bg-white text-gray-900 rounded-lg shadow-sm print:p-0 print:shadow-none font-serif ${fontSize} max-w-[800px] mx-auto min-h-[1000px] flex flex-col justify-between`}>
      <div>
        {/* Centered Classic Header */}
        <header className="text-center mb-6 border-b-2 pb-3 border-gray-900">
          <h1 className={`text-2xl font-bold tracking-tight uppercase text-gray-900`}>
            {user.name || "Student Name"}
          </h1>
          {user.headline && (
            <p className="text-gray-700 italic text-xs mt-0.5">{user.headline}</p>
          )}
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-0.5 text-[11px] text-gray-700 mt-2 font-serif">
            {user.location && <span>{user.location} •</span>}
            {user.phone && <span>{user.phone} •</span>}
            {user.email && <span>{user.email}</span>}
            {user.linkedinUrl && <span>• {user.linkedinUrl}</span>}
          </div>
        </header>

        {/* Education */}
        {education.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-900 pb-0.5 mb-2 text-gray-900">
              Education
            </h2>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline font-bold text-gray-900">
                    <span>{edu.institution}</span>
                    <span className="text-[11px] font-normal text-gray-700">{edu.location}</span>
                  </div>
                  <div className="flex justify-between items-baseline italic text-gray-800">
                    <span>{edu.degree} in {edu.major} {edu.minor ? `(Minor in ${edu.minor})` : ""}</span>
                    <span className="text-[11px] not-italic text-gray-700 font-medium">{edu.startDate} – {edu.endDate}</span>
                  </div>
                  {resume.showGpa && edu.gpa && (
                    <p className="text-[11px] text-gray-800">Cumulative GPA: <strong>{edu.gpa}</strong> {edu.honors ? `| ${edu.honors}` : ""}</p>
                  )}
                  {resume.showCoursework && edu.coursework && (
                    <p className="text-[11px] text-gray-700 mt-0.5">
                      <strong>Relevant Coursework:</strong> {edu.coursework}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Work Experience */}
        {workExperiences.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-900 pb-0.5 mb-2 text-gray-900">
              Professional Experience
            </h2>
            <div className="space-y-3">
              {workExperiences.map((work) => {
                const bullets = parseBullets(work.bullets);
                return (
                  <div key={work.id}>
                    <div className="flex justify-between items-baseline font-bold text-gray-900">
                      <span>{work.company}</span>
                      <span className="text-[11px] font-normal text-gray-700">{work.location}</span>
                    </div>
                    <div className="flex justify-between items-baseline italic text-gray-800 mb-1">
                      <span>{work.role}</span>
                      <span className="text-[11px] not-italic text-gray-700">{work.startDate} – {work.isCurrent ? "Present" : work.endDate}</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-gray-800 text-[11px]">
                      {bullets.map((b, i) => (
                        <li key={i} className="leading-snug">{b}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-900 pb-0.5 mb-2 text-gray-900">
              Key Projects & Research
            </h2>
            <div className="space-y-3">
              {projects.map((proj) => {
                const bullets = parseBullets(proj.bullets);
                return (
                  <div key={proj.id}>
                    <div className="flex justify-between items-baseline font-bold text-gray-900">
                      <span>{proj.title} {proj.roleOrTechnologies ? <span className="font-normal italic text-gray-700">— {proj.roleOrTechnologies}</span> : null}</span>
                      <span className="text-[11px] font-normal text-gray-700">{proj.date}</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-gray-800 text-[11px]">
                      {bullets.map((b, i) => (
                        <li key={i} className="leading-snug">{b}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Extracurriculars */}
        {extracurriculars.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-900 pb-0.5 mb-2 text-gray-900">
              Leadership & Campus Involvement
            </h2>
            <div className="space-y-3">
              {extracurriculars.map((ex) => {
                const bullets = parseBullets(ex.bullets);
                return (
                  <div key={ex.id}>
                    <div className="flex justify-between items-baseline font-bold text-gray-900">
                      <span>{ex.organization}</span>
                      <span className="text-[11px] font-normal text-gray-700">{ex.date}</span>
                    </div>
                    <p className="italic text-gray-800 text-[11px] mb-1">{ex.role}</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-800 text-[11px]">
                      {bullets.map((b, i) => (
                        <li key={i} className="leading-snug">{b}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Skills & Honors */}
        {skills.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-900 pb-0.5 mb-2 text-gray-900">
              Additional Skills & Certifications
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
        ResuMate Ivy League Classic Format
      </footer>
    </div>
  );
}
