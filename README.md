<p align="center">
  <img src="https://img.shields.io/badge/ResuMate-Student%20Resume%20Builder-6366f1?style=for-the-badge&logo=sparkles&logoColor=white" alt="ResuMate" />
</p>

<h1 align="center">📄 ResuMate — AI-Powered Student Resume Builder</h1>

<p align="center">
  A full-stack, production-grade internship and career platform built specifically for university students.<br/>
  Create, tailor, and optimize resumes with real-time ATS scoring, AI bullet enhancement, and smart job matching.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Drizzle%20ORM-0.45-C5F74F?style=flat-square" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-4.1-38BDF8?style=flat-square&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</p>

---

## 🎯 Purpose & Mission

**ResuMate** solves one of the most critical challenges college and university students face — translating raw academic experience into polished, recruiter-optimized resumes that pass Applicant Tracking Systems (ATS) and land real interviews.

Most students don't know how to:
- Structure and quantify their accomplishments
- Tailor resumes to specific job descriptions
- Navigate ATS systems used by top companies
- Present their technical skills and research credibly

ResuMate is the all-in-one platform that guides students through every step — from registration to offer.

---

## ✨ Core Feature Set

### 🔐 Authentication & Account Security
- Sliding animated **Sign In / Sign Up** interface with credential validation
- Secure **session cookie management** (HTTP-only, 30-day expiry)
- **Change Password** flow requiring the current password, validated client and server-side
- Multi-student persona switching for demo exploration
- **Sign Out** with session cookie invalidation

### 👤 Student Profile System
Tabbed settings interface across 5 sections:
| Section | Fields |
|---------|--------|
| **Basic Info** | Name, Headline, Phone, Location, LinkedIn, GitHub, Portfolio, Bio, Profile Picture Upload |
| **University** | Institution, Department/Major, Expected Graduation Year |
| **Career Goals** | Preferred Job Role / Career Track + AI insights |
| **Security** | Change Password with current-password re-auth, confirmation matching and strength rules |
| **Preferences** | Theme (Light/Dark/System), Email Notifications, Application Alerts, Weekly Digest |

### 📄 Multi-Resume Management (Full CRUD)
- Create **unlimited resumes** tailored to specific roles or industries
- **Clone** existing resumes to quickly create role-specific variants
- **Delete** resumes with confirmation guard
- **Search & Filter** resumes by title, target role, or template
- **JSON Export** (download full resume backup)
- **JSON Import** (restore or transfer a resume backup)
- Real-time **ATS Score badge** on every resume card
- Last-updated timestamp tracking

### 🏗️ Resume Builder Studio
A side-by-side interactive editor with **live preview**:
- **Education** — Institution, Degree, Major, Minor, GPA, Honors, Coursework
- **Work Experience** — Company, Role, Dates, Location, Bullet Points
- **Projects** — Title, Tech Stack, GitHub Link, Date, Highlights
- **Leadership / Extracurriculars** — Org, Role, Date, Impact Bullets
- **Skills** — Categorized skill groups (Languages, Frameworks, Tools, etc.)
- **Certifications** — Name, Issuer, Date, Credential URL
- Optimistic UI updates with auto-save status indicator

### 🎨 4 Professional Resume Templates
| Template | Best For |
|----------|----------|
| **Modern Tech** | Software Engineering, Product, Design |
| **Ivy League Traditional** | Finance, Law, Consulting, Policy |
| **Minimal Corporate** | Business, Investment Banking, Strategy |
| **Academic & Research CV** | PhD, Lab Research, Pre-Med, Postdoc |

**5 Color Themes**: Navy Blue · Emerald Green · Burgundy Rose · Charcoal Slate · Royal Purple  
**Font Families**: Inter · Georgia Serif · Garamond Executive · Roboto

### 🤖 ATS Optimizer & Job Matcher
- Paste any job description to run a **real-time keyword scan**
- Computed **ATS Match Index (0–100%)** based on:
  - Keyword coverage from job description
  - High-impact action verb detection
  - Quantified metric density
  - Section completeness scoring
- **Matched keyword** visualization (green badges)
- **Missing keyword** gap analysis (amber badges)
- Personalized **tailoring recommendations**
- Save analyses to the **Application Tracker** with status workflow:
  - `Applied` → `Interviewing` → `Offer Received` → `Rejected`

### ✍️ AI Bullet Point Enhancer Studio
- Enter any draft accomplishment statement
- Select domain: **Tech / Finance / Healthcare / Leadership**
- Receive **3 high-impact AI rewrites** with quantified metrics and power verbs
- Click to copy individual suggestions
- **150+ Power Verbs Dictionary** organized by:
  - Software & Engineering
  - Leadership & Strategy
  - Research & Analysis
  - Finance & Quantitative
  - Design & Communications
- One-click copy-to-clipboard for any verb

### 📝 AI Cover Letter Generator
- Select source resume (auto-loads candidate profile)
- Input company name, job title, and optional job description
- Generates a personalized **3-paragraph cover letter** merging:
  - University and major
  - Recent work experience
  - Primary technical/domain skills
  - Target role requirements
- Editable output textarea — customize before sending
- One-click copy full text

### 🌐 Public Resume Share Links
- Every resume gets a unique `/r/[shareSlug]` URL
- **Public view page** with professional branded header
- One-click **Copy Link** and **Print / Save PDF** buttons
- Toggle **public/private** visibility per resume
- SEO-optimized metadata per student profile

### 📊 Performance Analytics Dashboard
- **Total Views** & **Unique Visitors** per resume link
- **Average Read Time** and **Engagement Rate**
- **Device Distribution** (Desktop / Mobile / Tablet)
- **Top Visitor Locations** by city and country

### 💼 Student Internship Job Board
- Browse curated internship listings from top companies
- Real-time **ATS Match %** badge per opportunity
- **Bookmark** / **Save** roles for later
- Quick **Apply** external link navigation
- Smart filtering by role, skill tags, and location

### 🗺️ Career Roadmap & Milestone Tracker
Interactive checklist across 3 career phases:
1. **Foundation** — Profile, first resume, target role setting
2. **Professional Branding** — AI bullet enhancement, ATS optimization, public portfolio
3. **Outreach & Networking** — Cover letters, job applications, analytics review

- **Readiness Score (%)** calculated from completed milestones
- Live progress bar with visual milestone completion states
- "Next Recommended Action" smart prompt card

### 💻 Tech Stack Visualizer
- Categorized skill blueprint: **Frontend / Backend / AI & Data Science**
- Proficiency level bars per technology (0–100%)
- Hover-reveal controls (Adjust / Remove)
- Synchronized with active resume skills section

### 📋 Activity & Audit History Log
- Chronological event trail of all significant actions:
  - ATS Optimization runs
  - AI bullet enhancements
  - Resume exports
  - Template changes
  - Cover letter generations
- Full text search and date-range filter UI
- Export activity log as download

### ⚖️ Legal Hub
- **Terms of Service** — AI content policy, prohibited conduct, account rules
- **Privacy Policy** — Data collection transparency, rights to export/delete
- Accessible directly from registration flow via clickable links

---

## 🏛️ Technical Architecture

```
resumate/
├── src/
│   ├── app/
│   │   ├── page.tsx                         # Root — mounts DashboardLayout
│   │   ├── r/[shareSlug]/page.tsx           # Public resume view (SSR)
│   │   └── api/
│   │       ├── health/route.ts              # Platform health check
│   │       ├── seed/route.ts                # DB seeder trigger
│   │       ├── auth/
│   │       │   ├── login/route.ts           # POST — credential login + cookie
│   │       │   ├── register/route.ts        # POST — new student account
│   │       │   ├── logout/route.ts          # POST — session cookie clear
│   │       │   └── me/route.ts              # GET — current session user
│   │       ├── users/
│   │       │   └── profile/route.ts         # PUT — update profile + password
│   │       ├── resumes/
│   │       │   ├── route.ts                 # GET list / POST create
│   │       │   ├── import/route.ts          # POST — JSON resume import
│   │       │   └── [id]/
│   │       │       ├── route.ts             # GET detail / PUT update / DELETE
│   │       │       ├── sections/route.ts    # POST — add section item
│   │       │       └── export/route.ts      # GET — download JSON backup
│   │       ├── sections/[type]/[sectionId]/ # PUT / DELETE section items
│   │       ├── job-applications/
│   │       │   ├── route.ts                 # GET list / POST create
│   │       │   └── [id]/route.ts            # PUT status / DELETE
│   │       ├── ats-analyze/route.ts         # POST — ATS keyword analysis
│   │       └── ai/
│   │           ├── enhance-bullet/route.ts  # POST — AI bullet enhancement
│   │           └── cover-letter/route.ts    # POST — cover letter generation
│   ├── components/
│   │   ├── AuthPage.tsx                     # Sliding Sign In / Sign Up
│   │   ├── LegalPage.tsx                    # Terms & Privacy Policy
│   │   ├── DashboardLayout.tsx              # Main shell, sidebar navigation
│   │   ├── UserSwitcherModal.tsx            # Profile switch + registration
│   │   ├── ResumesListTab.tsx               # Resume hub with CRUD controls
│   │   ├── ResumeBuilderTab.tsx             # Side-by-side editor + preview
│   │   ├── AtsOptimizerTab.tsx              # ATS scanner + tracker
│   │   ├── AiToolsTab.tsx                   # Bullet studio + verb bank
│   │   ├── CoverLetterTab.tsx               # Cover letter generator
│   │   ├── AnalyticsTab.tsx                 # Share link analytics
│   │   ├── JobBoardTab.tsx                  # Internship listing board
│   │   ├── RoadmapTab.tsx                   # Career milestone tracker
│   │   ├── TechStackTab.tsx                 # Tech proficiency visualizer
│   │   ├── ActivityHistoryTab.tsx           # Audit event log
│   │   ├── ProfileTab.tsx                   # Student profile + security
│   │   ├── PublicResumeHeader.tsx           # Share page header
│   │   └── resume-templates/
│   │       ├── ModernTechTemplate.tsx
│   │       ├── IvyLeagueTemplate.tsx
│   │       ├── MinimalCorpTemplate.tsx
│   │       ├── AcademicResearchTemplate.tsx
│   │       ├── ResumeTemplateDispatcher.tsx
│   │       └── types.ts
│   ├── db/
│   │   ├── index.ts                         # Drizzle + pg Pool connection
│   │   ├── schema.ts                        # All table definitions
│   │   └── seed.ts                          # Realistic demo student data
│   └── lib/
│       └── auth.ts                          # Session user resolver
```

---

## 🗄️ Database Schema

| Table | Purpose |
|-------|---------|
| `users` | Student accounts — profile, credentials, preferences |
| `resumes` | Resume metadata — template, theme, ATS score, slug |
| `education` | University records per resume |
| `work_experiences` | Internship / job entries per resume |
| `projects` | Portfolio projects per resume |
| `extracurriculars` | Leadership / clubs per resume |
| `skills` | Categorized skill groups per resume |
| `certifications` | Certifications per resume |
| `job_applications` | ATS scan results + application status tracker |
| `resume_analytics` | Public link view tracking |

All tables use **cascading deletes** so removing a user or resume cleans all related rows automatically.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 20+
- **PostgreSQL** 15+
- **npm** or **yarn**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/resumate.git
cd resumate

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/resumate_db
```

### Database Setup

```bash
# Push schema to database
npx drizzle-kit push

# Seed demo student profiles (auto-runs on first login)
# Or trigger manually:
curl -X POST http://localhost:3000/api/seed
```

### Development Server

```bash
npm run dev
```

Visit → `http://localhost:3000`

### Production Build

```bash
npm run build
npm run start
```

---

## 🌱 Demo Student Profiles

The platform ships with three fully seeded student personas:

| Student | Email | University | Career Track |
|---------|-------|-----------|-------------|
| **Alex Chen** | `alex.chen@berkeley.edu` | UC Berkeley | Software Engineering |
| **Maya Patel** | `m.patel@jhu.edu` | Johns Hopkins | Clinical Research |
| **Marcus Vance** | `mvance@stern.nyu.edu` | NYU Stern | Investment Banking |

The password for all three demo accounts is **`demo1234`**.

Each persona includes complete resumes, work experience, projects, skills, certifications, and saved job applications — so the platform feels **alive on first load**.

---

## 🔒 Security Architecture

| Layer | Implementation |
|-------|---------------|
| **Session Management** | HTTP-only cookies with 30-day expiry and `SameSite=Lax` |
| **Password Storage** | `scrypt` hashes with a per-user random salt (`salt:hash`), verified in constant time |
| **Password Validation** | Minimum 8 characters; changing a password requires the current one |
| **Route Protection** | Edge middleware guard + server-side session check on every API route |
| **Authorization** | Every resource query is scoped to the session user; cross-account IDs return 404 |
| **Secret Hygiene** | API responses are built from an explicit public-field allowlist — hashes never leave the server |
| **Session Expiry** | Cookie cleared on logout with zero-epoch expiry date |
| **Input Sanitization** | Email normalized to lowercase, all inputs trimmed |
| **Cascade Deletes** | FK constraints prevent orphaned data on account removal |

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/auth/me` | Get current session user |
| `POST` | `/api/auth/login` | Sign in with email + password |
| `POST` | `/api/auth/register` | Create new student account |
| `POST` | `/api/auth/logout` | Invalidate session cookie |

### Resumes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/resumes` | List all resumes for session user |
| `POST` | `/api/resumes` | Create new resume (with optional copy) |
| `GET` | `/api/resumes/:id` | Fetch full resume with all sections |
| `PUT` | `/api/resumes/:id` | Update resume settings |
| `DELETE` | `/api/resumes/:id` | Delete resume + cascade all sections |
| `GET` | `/api/resumes/:id/export` | Download JSON backup |
| `POST` | `/api/resumes/import` | Restore from JSON backup |
| `POST` | `/api/resumes/:id/sections` | Add a new section item |

### Sections (Generic CRUD)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `PUT` | `/api/sections/:type/:sectionId` | Update any section item |
| `DELETE` | `/api/sections/:type/:sectionId` | Delete any section item |

Section types: `education` · `work` · `projects` · `extracurriculars` · `skills` · `certifications`

### AI & Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ats-analyze` | Run ATS keyword gap analysis |
| `POST` | `/api/ai/enhance-bullet` | Generate 3 AI bullet rewrites |
| `POST` | `/api/ai/cover-letter` | Generate tailored cover letter |

### Job Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/job-applications` | List saved applications |
| `POST` | `/api/job-applications` | Save new ATS match result |
| `PUT` | `/api/job-applications/:id` | Update application status |
| `DELETE` | `/api/job-applications/:id` | Remove application from tracker |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5.9 |
| **Styling** | Tailwind CSS 4.1 |
| **Database** | PostgreSQL 15 |
| **ORM** | Drizzle ORM 0.45 |
| **Icons** | Lucide React |
| **Runtime** | Node.js 20 |
| **Session** | HTTP-only Cookie |

---

## 📸 Platform Walkthrough

```
1. SIGN IN / SIGN UP
   └── Sliding animated auth interface
       └── Demo quick-login buttons for instant exploration

2. MY RESUMES HUB
   └── Resume cards with ATS score, template, and theme preview
       └── Create → Clone → Edit → Share → Export → Delete

3. RESUME BUILDER STUDIO
   └── 6-tab section editor (Education, Work, Projects, Skills...)
       └── Real-time live preview canvas on the right
           └── AI Wand button on each bullet → instant enhancement

4. ATS & JOB MATCHER
   └── Paste any job description → Run analysis
       └── Match score + keyword gaps + recommendations
           └── Save to Application Tracker with status management

5. AI BULLET STUDIO
   └── Type draft accomplishment → Select domain → Get 3 rewrites
       └── Browse 150+ power verbs by category → Copy to clipboard

6. COVER LETTER STUDIO
   └── Select resume + company + role
       └── Auto-generated letter pulled from candidate profile
           └── Editable output → copy for email submission

7. PUBLIC SHARE PAGE
   └── /r/[shareSlug] → Branded professional resume page
       └── Print / PDF download + copy link button

8. CAREER ROADMAP
   └── Interactive milestone checklist across 3 phases
       └── Live readiness score + next recommended action

9. STUDENT PROFILE
   └── Avatar upload + contact info + university data
       └── Change Password (Security tab)
           └── Theme + Notifications (Preferences tab)
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

```bash
# Fork the repository and create your branch
git checkout -b feature/amazing-feature

# Commit your changes
git commit -m 'feat: Add amazing feature'

# Push to the branch
git push origin feature/amazing-feature

# Open a Pull Request
```

### Development Standards
- All new routes must use the Next.js App Router pattern
- TypeScript strict mode — no `any` unless absolutely necessary  
- Every API route must include a `try/catch` with proper error status codes
- Component names must be PascalCase, API folders must be kebab-case
- Run `npm exec tsc -- --noEmit` before submitting PRs

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/) — React framework for production
- [Drizzle ORM](https://orm.drizzle.team/) — TypeScript-first PostgreSQL ORM
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS framework
- [Lucide React](https://lucide.dev/) — Beautiful open-source icon library
- All the students grinding applications at 2am — this one's for you 🎓

---

<p align="center">
  Built with ❤️ for students by developers who've been there.<br/>
  <strong>ResuMate</strong> — From campus to career.
</p>
