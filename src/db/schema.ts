import { pgTable, text, timestamp, boolean, integer, primaryKey } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  headline: text("headline"),
  phone: text("phone"),
  location: text("location"),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  websiteUrl: text("website_url"),
  bio: text("bio"),
  profilePictureUrl: text("profile_picture_url"),
  university: text("university"),
  department: text("department"),
  graduationYear: text("graduation_year"),
  preferredJobRole: text("preferred_job_role"),
  themePreference: text("theme_preference").default("light"),
  emailNotifications: boolean("email_notifications").default(true),
  applicationAlerts: boolean("application_alerts").default(true),
  weeklyDigest: boolean("weekly_digest").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const resumes = pgTable("resumes", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  targetRole: text("target_role"),
  template: text("template").default("modern_tech").notNull(),
  colorTheme: text("color_theme").default("navy").notNull(),
  fontSize: text("font_size").default("md").notNull(),
  fontFamily: text("font_family").default("inter").notNull(),
  showGpa: boolean("show_gpa").default(true).notNull(),
  showCoursework: boolean("show_coursework").default(true).notNull(),
  showProjectsFirst: boolean("show_projects_first").default(false).notNull(),
  shareSlug: text("share_slug").unique().notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  atsScore: integer("ats_score").default(85).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const education = pgTable("education", {
  id: text("id").primaryKey(),
  resumeId: text("resume_id").notNull().references(() => resumes.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  institution: text("institution").notNull(),
  degree: text("degree").notNull(),
  major: text("major").notNull(),
  minor: text("minor"),
  location: text("location"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  gpa: text("gpa"),
  honors: text("honors"),
  coursework: text("coursework"),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const workExperiences = pgTable("work_experiences", {
  id: text("id").primaryKey(),
  resumeId: text("resume_id").notNull().references(() => resumes.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  company: text("company").notNull(),
  role: text("role").notNull(),
  location: text("location"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  isCurrent: boolean("is_current").default(false).notNull(),
  bullets: text("bullets").default("[]").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  resumeId: text("resume_id").notNull().references(() => resumes.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  roleOrTechnologies: text("role_or_technologies"),
  link: text("link"),
  date: text("date"),
  bullets: text("bullets").default("[]").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const extracurriculars = pgTable("extracurriculars", {
  id: text("id").primaryKey(),
  resumeId: text("resume_id").notNull().references(() => resumes.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  organization: text("organization").notNull(),
  role: text("role").notNull(),
  date: text("date"),
  bullets: text("bullets").default("[]").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const skills = pgTable("skills", {
  id: text("id").primaryKey(),
  resumeId: text("resume_id").notNull().references(() => resumes.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  skillsList: text("skills_list").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const certifications = pgTable("certifications", {
  id: text("id").primaryKey(),
  resumeId: text("resume_id").notNull().references(() => resumes.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  issuer: text("issuer"),
  issueDate: text("issue_date"),
  credentialUrl: text("credential_url"),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const jobApplications = pgTable("job_applications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  resumeId: text("resume_id").notNull().references(() => resumes.id, { onDelete: "cascade" }),
  companyName: text("company_name").notNull(),
  jobTitle: text("job_title").notNull(),
  jobDescription: text("job_description").notNull(),
  matchScore: integer("match_score").default(70).notNull(),
  missingKeywords: text("missing_keywords").default("[]").notNull(),
  matchedKeywords: text("matched_keywords").default("[]").notNull(),
  status: text("status").default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


/* ────────────────────────────────────────────────────────────
   Sessions — real, revocable server-side auth sessions
───────────────────────────────────────────────────────────── */
export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

/* ────────────────────────────────────────────────────────────
   Resume views — one row per public resume page hit.
   Powers the Analytics page with real numbers.
───────────────────────────────────────────────────────────── */
export const resumeViews = pgTable("resume_views", {
  id: text("id").primaryKey(),
  resumeId: text("resume_id").notNull().references(() => resumes.id, { onDelete: "cascade" }),
  visitorHash: text("visitor_hash").notNull(),
  referrer: text("referrer").default("direct").notNull(),
  device: text("device").default("desktop").notNull(),
  country: text("country"),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

/* ────────────────────────────────────────────────────────────
   Activity log — immutable audit trail shown on Activity page
───────────────────────────────────────────────────────────── */
export const activityLog = pgTable("activity_log", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  resumeId: text("resume_id"),
  type: text("type").notNull(),        // ats | ai | export | edit | auth | application | resume
  action: text("action").notNull(),    // human readable
  target: text("target").default("").notNull(),
  result: text("result").default("").notNull(),
  status: text("status").default("info").notNull(), // success | info | warning
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ────────────────────────────────────────────────────────────
   Career roadmap progress — persisted per user
───────────────────────────────────────────────────────────── */
export const roadmapProgress = pgTable("roadmap_progress", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  itemId: text("item_id").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
}, (t) => [primaryKey({ columns: [t.userId, t.itemId] })]);

/* ────────────────────────────────────────────────────────────
   Job bookmarks — persisted "saved jobs" on the Job Board
───────────────────────────────────────────────────────────── */
export const jobBookmarks = pgTable("job_bookmarks", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  jobId: text("job_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [primaryKey({ columns: [t.userId, t.jobId] })]);
