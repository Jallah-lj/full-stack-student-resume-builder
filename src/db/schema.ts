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

// New Table for Resume Views Tracking
export const resumeAnalytics = pgTable("resume_analytics", {
  id: text("id").primaryKey(),
  resumeId: text("resume_id").notNull().references(() => resumes.id, { onDelete: "cascade" }),
  viewCount: integer("view_count").default(0).notNull(),
  uniqueVisitors: integer("unique_visitors").default(0).notNull(),
  lastViewedAt: timestamp("last_viewed_at").defaultNow(),
  // Store browser/device distribution as JSON
  deviceData: text("device_data").default("{}").notNull(), 
});
