import { education, workExperiences, projects, extracurriculars, skills, certifications } from "@/db/schema";

/**
 * One registry describing every resume section type, so the create /
 * update / delete routes share a single implementation instead of six
 * near-identical copy-pasted branches.
 *
 * `key` is the field name used in the API response bundle.
 * `fields` is the whitelist of client-editable columns.
 * `bulletFields` are stored as JSON strings in the database.
 */
export const SECTION_TABLES = {
  education: {
    table: education,
    key: "education",
    label: "Education",
    idPrefix: "edu",
    fields: ["institution", "degree", "major", "minor", "location", "startDate", "endDate", "gpa", "honors", "coursework", "sortOrder"],
    bulletFields: [] as string[],
    defaults: {
      institution: "New Institution",
      degree: "Bachelor of Science",
      major: "Major Field",
      endDate: "Expected 2026",
    },
  },
  work: {
    table: workExperiences,
    key: "workExperiences",
    label: "Work experience",
    idPrefix: "work",
    fields: ["company", "role", "location", "startDate", "endDate", "isCurrent", "bullets", "sortOrder"],
    bulletFields: ["bullets"],
    defaults: {
      company: "Company Name",
      role: "Role Title",
      bullets: ["Key contribution or accomplishment"],
    },
  },
  projects: {
    table: projects,
    key: "projects",
    label: "Project",
    idPrefix: "proj",
    fields: ["title", "roleOrTechnologies", "link", "date", "bullets", "sortOrder"],
    bulletFields: ["bullets"],
    defaults: {
      title: "Project Title",
      roleOrTechnologies: "",
      bullets: ["Built feature or system"],
    },
  },
  extracurriculars: {
    table: extracurriculars,
    key: "extracurriculars",
    label: "Leadership",
    idPrefix: "extra",
    fields: ["organization", "role", "date", "bullets", "sortOrder"],
    bulletFields: ["bullets"],
    defaults: {
      organization: "Organization",
      role: "Member",
      bullets: ["Organized events or led a team"],
    },
  },
  skills: {
    table: skills,
    key: "skills",
    label: "Skills",
    idPrefix: "skill",
    fields: ["category", "skillsList", "sortOrder"],
    bulletFields: [] as string[],
    defaults: {
      category: "Skill Category",
      skillsList: "Skill 1, Skill 2, Skill 3",
    },
  },
  certifications: {
    table: certifications,
    key: "certifications",
    label: "Certification",
    idPrefix: "cert",
    fields: ["name", "issuer", "issueDate", "credentialUrl", "sortOrder"],
    bulletFields: [] as string[],
    defaults: {
      name: "Certification Name",
      issuer: "",
    },
  },
} as const;

export type SectionType = keyof typeof SECTION_TABLES;

export function isSectionType(value: string): value is SectionType {
  return Object.prototype.hasOwnProperty.call(SECTION_TABLES, value);
}

/** Bullets travel as arrays over the wire but persist as JSON text. */
export function serializeBullets(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return JSON.stringify(value.filter((b) => typeof b === "string"));
  return "[]";
}

/**
 * Reduce an arbitrary request body down to the columns a client is
 * allowed to write for the given section type.
 */
export function pickSectionFields(
  type: SectionType,
  body: Record<string, unknown>
): Record<string, unknown> {
  const config = SECTION_TABLES[type];
  const out: Record<string, unknown> = {};

  for (const field of config.fields as readonly string[]) {
    if (body[field] === undefined) continue;

    if ((config.bulletFields as readonly string[]).includes(field)) {
      out[field] = serializeBullets(body[field]);
    } else if (field === "isCurrent") {
      out[field] = Boolean(body[field]);
    } else if (field === "sortOrder") {
      const n = Number(body[field]);
      out[field] = Number.isFinite(n) ? n : 0;
    } else {
      out[field] = body[field] === null ? null : String(body[field]);
    }
  }

  return out;
}
