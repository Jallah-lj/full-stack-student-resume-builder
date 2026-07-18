import React from "react";
import { ResumeData, parseBullets, getColorClass, getFontFamilyClass, getFontSizeClass } from "./types";

export function ModernTechTemplate({ data }: { data: ResumeData }) {
  const { resume, user, education, workExperiences, projects, extracurriculars, skills, certifications } = data;
  const theme = getColorClass(resume.colorTheme);
  const font = getFontFamilyClass(resume.fontFamily);
  const fontSize = getFontSizeClass(resume.fontSize);

  return (
    <div className={`p-8 bg-white text-gray-900 rounded-lg shadow-sm print:p-0 print:shadow-none print:bg-transparent ${font} ${fontSize} max-w-[800px] mx-auto min-h-[1000px] flex flex-col justify-between`}>
      <div>
        {/* Header */}
        <header className="border-b-2 pb-4 mb-5 border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div>
              <h1 className={`text-2xl font-bold tracking-tight ${theme.text}`}>
                {user.name || "Student Name"}
              </h1>
              {user.headline && (
                <p className="text-gray-600 font-medium text-xs mt-0.5">{user.headline}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-600 md:text-right">
              {user.email && (
                <span>📧 {user.email}</span>
              )}
              {user.phone && (
                <span>📱 {user.phone}</span>
              )}
              {user.location && (
                <span>📍 {user.location}</span>
              )}
            </div>
          </div>

          {/* Social / Links Bar */}
          <div className="flex flex-wrap gap-3 mt-2 text-[11px] font-mono text-indigo-700">
            {user.linkedinUrl && (
              <a href={user.linkedinUrl} target="_blank" rel="noreferrer" className="hover:underline">
                LinkedIn
              </a>
            )}
            {user.githubUrl && (
              <a href={user.githubUrl} target="_blank" rel="noreferrer" className="hover:underline">
                GitHub
              </a>
            )}
            {user.websiteUrl && (
              <a href={user.websiteUrl} target="_blank" rel="noreferrer" className="hover:underline">
                Portfolio
              </a>
            )}
          </div>
        </header>

        {/* Education Section */}
        {education.length > 0 && (
          <section className="mb-5">
            <h2 className={`text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b ${theme.text} ${theme.border}`}>
              Education
            </h2>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline font-semibold text-gray-900">
                    <span>{edu.institution} {edu.location ? `— ${edu.location}` : ""}</span>
                    <span className="text-[11px] font-medium text-gray-600">{edu.startDate} – {edu.endDate}</span>
                  </div>
                  <div className="text-gray-700 font-medium">
                    {edu.degree} in {edu.major} {edu.minor ? `(Minor: ${edu.minor})` : ""}
                    {resume.showGpa && edu.gpa ? <span className="ml-2 font-semibold text-indigo-900">• GPA: {edu.gpa}</span> : null}
                  </div>
                  {edu.honors && (
                    <p className="text-gray-600 italic text-[11px] mt-0.5">Honors: {edu.honors}</p>
                  )}
                  {resume.showCoursework && edu.coursework && (
                    <p className="text-gray-600 text-[11px] mt-0.5">
                      <strong className="font-semibold text-gray-800">Relevant Coursework:</strong> {edu.coursework}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Dynamic Section Ordering (Projects First or Work First) */}
        {resume.showProjectsFirst ? (
          <>
            {/* Projects */}
            {projects.length > 0 && (
              <section className="mb-5">
                <h2 className={`text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b ${theme.text} ${theme.border}`}>
                  Projects
                </h2>
                <div className="space-y-3">
                  {projects.map((proj) => {
                    const bullets = parseBullets(proj.bullets);
                    return (
                      <div key={proj.id}>
                        <div className="flex justify-between items-baseline">
                          <span className="font-semibold text-gray-900">
                            {proj.title} {proj.roleOrTechnologies ? <span className="font-mono text-[11px] text-gray-600 font-normal">| {proj.roleOrTechnologies}</span> : null}
                          </span>
                          <span className="text-[11px] font-medium text-gray-600">{proj.date}</span>
                        </div>
                        {proj.link && (
                          <a href={proj.link} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-700 underline font-mono block mb-1">
                            {proj.link}
                          </a>
                        )}
                        <ul className="list-disc list-inside text-gray-700 space-y-1 pl-1 text-[11px]">
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

            {/* Work Experience */}
            {workExperiences.length > 0 && (
              <section className="mb-5">
                <h2 className={`text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b ${theme.text} ${theme.border}`}>
                  Experience
                </h2>
                <div className="space-y-3">
                  {workExperiences.map((work) => {
                    const bullets = parseBullets(work.bullets);
                    return (
                      <div key={work.id}>
                        <div className="flex justify-between items-baseline font-semibold text-gray-900">
                          <span>{work.role} — <span className="text-gray-800 font-normal">{work.company}</span></span>
                          <span className="text-[11px] font-medium text-gray-600">
                            {work.startDate} – {work.isCurrent ? "Present" : work.endDate}
                          </span>
                        </div>
                        {work.location && <p className="text-[10px] text-gray-500 italic mb-1">{work.location}</p>}
                        <ul className="list-disc list-inside text-gray-700 space-y-1 pl-1 text-[11px]">
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
          </>
        ) : (
          <>
            {/* Work Experience */}
            {workExperiences.length > 0 && (
              <section className="mb-5">
                <h2 className={`text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b ${theme.text} ${theme.border}`}>
                  Experience
                </h2>
                <div className="space-y-3">
                  {workExperiences.map((work) => {
                    const bullets = parseBullets(work.bullets);
                    return (
                      <div key={work.id}>
                        <div className="flex justify-between items-baseline font-semibold text-gray-900">
                          <span>{work.role} — <span className="text-gray-800 font-normal">{work.company}</span></span>
                          <span className="text-[11px] font-medium text-gray-600">
                            {work.startDate} – {work.isCurrent ? "Present" : work.endDate}
                          </span>
                        </div>
                        {work.location && <p className="text-[10px] text-gray-500 italic mb-1">{work.location}</p>}
                        <ul className="list-disc list-inside text-gray-700 space-y-1 pl-1 text-[11px]">
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
                <h2 className={`text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b ${theme.text} ${theme.border}`}>
                  Projects
                </h2>
                <div className="space-y-3">
                  {projects.map((proj) => {
                    const bullets = parseBullets(proj.bullets);
                    return (
                      <div key={proj.id}>
                        <div className="flex justify-between items-baseline">
                          <span className="font-semibold text-gray-900">
                            {proj.title} {proj.roleOrTechnologies ? <span className="font-mono text-[11px] text-gray-600 font-normal">| {proj.roleOrTechnologies}</span> : null}
                          </span>
                          <span className="text-[11px] font-medium text-gray-600">{proj.date}</span>
                        </div>
                        {proj.link && (
                          <a href={proj.link} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-700 underline font-mono block mb-1">
                            {proj.link}
                          </a>
                        )}
                        <ul className="list-disc list-inside text-gray-700 space-y-1 pl-1 text-[11px]">
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
          </>
        )}

        {/* Extracurricular / Leadership */}
        {extracurriculars.length > 0 && (
          <section className="mb-5">
            <h2 className={`text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b ${theme.text} ${theme.border}`}>
              Leadership & Extracurriculars
            </h2>
            <div className="space-y-3">
              {extracurriculars.map((ex) => {
                const bullets = parseBullets(ex.bullets);
                return (
                  <div key={ex.id}>
                    <div className="flex justify-between items-baseline font-semibold text-gray-900">
                      <span>{ex.role} — {ex.organization}</span>
                      <span className="text-[11px] font-medium text-gray-600">{ex.date}</span>
                    </div>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 pl-1 text-[11px]">
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

        {/* Technical Skills */}
        {skills.length > 0 && (
          <section className="mb-5">
            <h2 className={`text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b ${theme.text} ${theme.border}`}>
              Skills & Expertise
            </h2>
            <div className="space-y-1.5">
              {skills.map((s) => (
                <div key={s.id} className="text-[11px]">
                  <strong className="text-gray-900 font-semibold">{s.category}: </strong>
                  <span className="text-gray-700">{s.skillsList}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <section className="mb-4">
            <h2 className={`text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b ${theme.text} ${theme.border}`}>
              Certifications & Awards
            </h2>
            <div className="space-y-1 text-[11px]">
              {certifications.map((cert) => (
                <div key={cert.id} className="flex justify-between">
                  <span>
                    <strong className="text-gray-900">{cert.name}</strong> {cert.issuer ? `— ${cert.issuer}` : ""}
                  </span>
                  {cert.issueDate && <span className="text-gray-500 font-medium">{cert.issueDate}</span>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer Branding for Public / Printed View */}
      <footer className="text-center text-[10px] text-gray-400 pt-4 border-t border-gray-100 print:hidden">
        Created with ResuMate Student Resume Builder
      </footer>
    </div>
  );
}
