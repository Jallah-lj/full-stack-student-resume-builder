import { db } from "./index";
import { users, resumes, education, workExperiences, projects, extracurriculars, skills, certifications, jobApplications } from "./schema";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  try {
    // Check if users exist
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log("Database already seeded. Skipping initial seed.");
      return;
    }

    console.log("Seeding database with realistic student profiles...");

    // User 1: Alex Chen
    const user1Id = "user_alex_chen";
    await db.insert(users).values({
      id: user1Id,
      name: "Alex Chen",
      email: "alex.chen@berkeley.edu",
      passwordHash: "demo_password_hash",
      headline: "Computer Science & Data Science Student @ UC Berkeley | Software Engineering Intern",
      phone: "(510) 847-2931",
      location: "Berkeley, CA",
      linkedinUrl: "https://linkedin.com/in/alexchen-tech",
      githubUrl: "https://github.com/alexchen-dev",
      websiteUrl: "https://alexchen.dev",
      bio: "Undergraduate senior passionate about full-stack web development, distributed systems, and applying AI to practical productivity tools. Experienced in React, Next.js, Go, and PostgreSQL.",
      profilePictureUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      university: "University of California, Berkeley",
      department: "Electrical Engineering & Computer Sciences",
      graduationYear: "2026",
      preferredJobRole: "Software Engineer",
      themePreference: "dark",
      emailNotifications: true,
      applicationAlerts: true,
      weeklyDigest: true,
    });

    // User 1 Resume 1: Software Engineer Intern 2026
    const resume1Id = "res_alex_swe_2026";
    await db.insert(resumes).values({
      id: resume1Id,
      userId: user1Id,
      title: "Software Engineering Intern 2026",
      targetRole: "Software Engineer / Full Stack Developer",
      template: "modern_tech",
      colorTheme: "navy",
      fontSize: "md",
      fontFamily: "inter",
      showGpa: true,
      showCoursework: true,
      showProjectsFirst: false,
      shareSlug: "alex-chen-swe-2026",
      isPublic: true,
      atsScore: 92,
    });

    await db.insert(education).values({
      id: "edu_alex_1",
      resumeId: resume1Id,
      userId: user1Id,
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science",
      major: "Computer Science & Data Science",
      minor: "Public Policy",
      location: "Berkeley, CA",
      startDate: "Aug 2022",
      endDate: "May 2026 (Expected)",
      gpa: "3.88 / 4.00",
      honors: "Dean's Honor List (All Semesters), UPE CS Honor Society",
      coursework: "Data Structures, Algorithms, Operating Systems, Machine Learning, Database Systems, Computer Networks, Software Engineering",
      sortOrder: 1,
    });

    await db.insert(workExperiences).values([
      {
        id: "work_alex_1",
        resumeId: resume1Id,
        userId: user1Id,
        company: "Meta Platforms Inc.",
        role: "Software Engineering Intern",
        location: "Menlo Park, CA",
        startDate: "May 2025",
        endDate: "Aug 2025",
        isCurrent: false,
        bullets: JSON.stringify([
          "Engineered a high-throughput gRPC microservice in Go processing over 2.5M daily internal feature telemetry requests with under 12ms latency.",
          "Optimized PostgreSQL database query execution plans and added Redis caching, cutting P99 request latency by 42% across core user API endpoints.",
          "Collaborated with 6 cross-functional engineers to design automated CI/CD pipeline tests, reducing hotfix cycle time from 3 hours to 25 minutes."
        ]),
        sortOrder: 1,
      },
      {
        id: "work_alex_2",
        resumeId: resume1Id,
        userId: user1Id,
        company: "Berkeley Student Technology Lab",
        role: "Lead Undergraduate Web Developer",
        location: "Berkeley, CA",
        startDate: "Jan 2024",
        endDate: "May 2025",
        isCurrent: false,
        bullets: JSON.stringify([
          "Architected responsive full-stack student hub with Next.js, TypeScript, and Tailwind CSS serving 14,000+ active undergraduate students.",
          "Implemented OAuth2 authentication and role-based access control (RBAC) securing student lab reservation records and equipment checkouts.",
          "Led a sprint team of 4 junior developers, establishing Git branching standards and code review guidelines."
        ]),
        sortOrder: 2,
      }
    ]);

    await db.insert(projects).values([
      {
        id: "proj_alex_1",
        resumeId: resume1Id,
        userId: user1Id,
        title: "ResuMate - AI Student Resume Builder",
        roleOrTechnologies: "Next.js 15, React 19, TypeScript, PostgreSQL, Drizzle ORM, Tailwind CSS",
        link: "https://github.com/alexchen-dev/resumate",
        date: "Jan 2026",
        bullets: JSON.stringify([
          "Built full-stack student resume builder featuring real-time ATS optimization checking, dynamic PDF export, and custom template engine.",
          "Implemented keyword matching algorithm that analyzes job descriptions and computes missing power verbs with interactive live score indicators.",
          "Received 1,200+ stars on GitHub and adopted by 3,500+ students across campus career fairs."
        ]),
        sortOrder: 1,
      },
      {
        id: "proj_alex_2",
        resumeId: resume1Id,
        userId: user1Id,
        title: "Distributed KV Store with Raft Consensus",
        roleOrTechnologies: "C++20, gRPC, Multithreading, Linux",
        link: "https://github.com/alexchen-dev/raft-kv",
        date: "Oct 2024 - Dec 2024",
        bullets: JSON.stringify([
          "Developed fault-tolerant key-value store implementing Raft consensus protocol handling leader election, log replication, and snapshots.",
          "Simulated cluster network partitions with 30% packet loss, achieving 99.9% data consistency without uncommitted log leaks."
        ]),
        sortOrder: 2,
      }
    ]);

    await db.insert(extracurriculars).values([
      {
        id: "extra_alex_1",
        resumeId: resume1Id,
        userId: user1Id,
        organization: "Computer Science Undergraduate Association (CSUA)",
        role: "Vice President of External Relations",
        date: "Aug 2023 - Present",
        bullets: JSON.stringify([
          "Direct $40,000 corporate sponsorship budget and partner with tech leaders (Google, Apple, Stripe) to host 16 annual technical workshops.",
          "Mentored 25+ underrepresented computer science freshmen through technical interview prep and resume review circles."
        ]),
        sortOrder: 1,
      }
    ]);

    await db.insert(skills).values([
      {
        id: "skill_alex_1",
        resumeId: resume1Id,
        userId: user1Id,
        category: "Programming Languages",
        skillsList: "TypeScript, JavaScript, Python, C++, Go, Java, SQL, HTML5, CSS3",
        sortOrder: 1,
      },
      {
        id: "skill_alex_2",
        resumeId: resume1Id,
        userId: user1Id,
        category: "Frameworks & Databases",
        skillsList: "React, Next.js, Node.js, Express, PyTorch, Tailwind CSS, PostgreSQL, Redis, Drizzle ORM",
        sortOrder: 2,
      },
      {
        id: "skill_alex_3",
        resumeId: resume1Id,
        userId: user1Id,
        category: "Tools & Cloud Infrastructure",
        skillsList: "Git, Docker, Linux, AWS (EC2, S3), CI/CD GitHub Actions, Vercel, REST & gRPC APIs",
        sortOrder: 3,
      }
    ]);

    await db.insert(certifications).values([
      {
        id: "cert_alex_1",
        resumeId: resume1Id,
        userId: user1Id,
        name: "AWS Certified Solutions Architect – Associate",
        issuer: "Amazon Web Services",
        issueDate: "Nov 2024",
        credentialUrl: "https://aws.amazon.com/verify/123456",
        sortOrder: 1,
      }
    ]);

    // User 1 Resume 2: Data Science & AI Focus
    const resume2Id = "res_alex_ds_2026";
    await db.insert(resumes).values({
      id: resume2Id,
      userId: user1Id,
      title: "Data Science & AI Research Resume",
      targetRole: "Data Science & Machine Learning Intern",
      template: "academic_research",
      colorTheme: "emerald",
      fontSize: "md",
      fontFamily: "serif",
      showGpa: true,
      showCoursework: true,
      showProjectsFirst: true,
      shareSlug: "alex-chen-ds-2026",
      isPublic: true,
      atsScore: 88,
    });

    await db.insert(education).values({
      id: "edu_alex_2",
      resumeId: resume2Id,
      userId: user1Id,
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science",
      major: "Data Science & Computer Science",
      minor: "Statistics",
      location: "Berkeley, CA",
      startDate: "Aug 2022",
      endDate: "May 2026 (Expected)",
      gpa: "3.88 / 4.00",
      honors: "Dean's Honor List, Undergraduate AI Research Fellow",
      coursework: "Machine Learning, Deep Neural Networks, Probability Theory, Linear Algebra, Statistical Computing",
      sortOrder: 1,
    });

    await db.insert(workExperiences).values([
      {
        id: "work_alex_ds_1",
        resumeId: resume2Id,
        userId: user1Id,
        company: "Berkeley AI Research Lab (BAIR)",
        role: "Undergraduate AI Research Assistant",
        location: "Berkeley, CA",
        startDate: "Sep 2024",
        endDate: "Present",
        isCurrent: true,
        bullets: JSON.stringify([
          "Fine-tuned open-weight LLMs (Llama-3, Mistral) on domain-specific code generation datasets using LoRA and PyTorch.",
          "Evaluated multi-modal embedding performance using benchmark datasets, achieving a 14% improvement in retrieval accuracy."
        ]),
        sortOrder: 1,
      }
    ]);

    await db.insert(skills).values([
      {
        id: "skill_alex_ds_1",
        resumeId: resume2Id,
        userId: user1Id,
        category: "ML & Data Science Tools",
        skillsList: "Python, PyTorch, TensorFlow, Pandas, NumPy, Scikit-Learn, HuggingFace, R, Jupyter, SQL",
        sortOrder: 1,
      }
    ]);

    // Target Applications for Alex
    await db.insert(jobApplications).values([
      {
        id: "job_app_1",
        userId: user1Id,
        resumeId: resume1Id,
        companyName: "Stripe",
        jobTitle: "Software Engineering Intern - Infrastructure",
        jobDescription: "We are looking for CS students who love building high performance backend systems in Go, C++, or Java. Familiarity with distributed databases, SQL optimization, gRPC, and container orchestration is highly desirable.",
        matchScore: 94,
        missingKeywords: JSON.stringify(["Kafka", "Kubernetes", "Prometheus"]),
        matchedKeywords: JSON.stringify(["Go", "SQL", "gRPC", "Microservices", "PostgreSQL", "CI/CD"]),
        status: "interviewing",
      },
      {
        id: "job_app_2",
        userId: user1Id,
        resumeId: resume1Id,
        companyName: "OpenAI",
        jobTitle: "Full Stack Engineer Intern",
        jobDescription: "Build user-facing Web applications for millions of developers using React, Next.js, WebSockets, and Node.js. Requires strong problem solving and demonstrated project portfolio.",
        matchScore: 89,
        missingKeywords: JSON.stringify(["WebSockets", "GraphQL", "WebAssembly"]),
        matchedKeywords: JSON.stringify(["Next.js", "React", "TypeScript", "Tailwind CSS", "REST APIs"]),
        status: "applied",
      }
    ]);

    // User 2: Maya Patel (Pre-Med & Clinical Research)
    const user2Id = "user_maya_patel";
    await db.insert(users).values({
      id: user2Id,
      name: "Maya Patel",
      email: "m.patel@jhu.edu",
      passwordHash: "demo_password_hash",
      headline: "Molecular & Cellular Biology Senior @ Johns Hopkins | Pre-Med Research Scholar",
      phone: "(410) 555-0182",
      location: "Baltimore, MD",
      linkedinUrl: "https://linkedin.com/in/mayapatel-bio",
      websiteUrl: "https://mayapatel.jhu.edu",
      bio: "Pre-med undergraduate with 3+ years of immunology lab experience and oncology research. Aspiring MD/PhD.",
      profilePictureUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
      university: "Johns Hopkins University",
      department: "Biology / Pre-Medicine",
      graduationYear: "2026",
      preferredJobRole: "Clinical Research Associate",
      themePreference: "light",
      emailNotifications: true,
      applicationAlerts: true,
      weeklyDigest: false,
    });

    const resume3Id = "res_maya_premed";
    await db.insert(resumes).values({
      id: resume3Id,
      userId: user2Id,
      title: "Clinical Research & Healthcare Resume",
      targetRole: "Clinical Research Assistant / Lab Specialist",
      template: "ivy_league",
      colorTheme: "burgundy",
      fontSize: "md",
      fontFamily: "garamond",
      showGpa: true,
      showCoursework: true,
      showProjectsFirst: false,
      shareSlug: "maya-patel-research",
      isPublic: true,
      atsScore: 95,
    });

    await db.insert(education).values({
      id: "edu_maya_1",
      resumeId: resume3Id,
      userId: user2Id,
      institution: "Johns Hopkins University",
      degree: "Bachelor of Science",
      major: "Molecular & Cellular Biology",
      minor: "Bioethics & Public Health",
      location: "Baltimore, MD",
      startDate: "Aug 2022",
      endDate: "May 2026",
      gpa: "3.94 / 4.00",
      honors: "Summa Cum Laude, Woodrow Wilson Research Fellow",
      coursework: "Immunology, Cancer Biology, Organic Chemistry, Biostatistics, Genetics, Ethics in Medicine",
      sortOrder: 1,
    });

    await db.insert(workExperiences).values([
      {
        id: "work_maya_1",
        resumeId: resume3Id,
        userId: user2Id,
        company: "Johns Hopkins Sidney Kimmel Comprehensive Cancer Center",
        role: "Undergraduate Research Fellow",
        location: "Baltimore, MD",
        startDate: "May 2023",
        endDate: "Present",
        isCurrent: true,
        bullets: JSON.stringify([
          "Co-authored published peer-reviewed study in Journal of Immunotherapy examining T-cell checkpoint inhibition efficacy across 380 clinical samples.",
          "Performed ELISA assays, flow cytometry, PCR amplification, and tissue culture techniques for daily lab protocol execution."
        ]),
        sortOrder: 1,
      }
    ]);

    await db.insert(skills).values([
      {
        id: "skill_maya_1",
        resumeId: resume3Id,
        userId: user2Id,
        category: "Laboratory & Clinical Techniques",
        skillsList: "Flow Cytometry, Western Blotting, CRISPR-Cas9 Editing, ELISA, PCR, Cell Culture, DNA/RNA Extraction",
        sortOrder: 1,
      },
      {
        id: "skill_maya_2",
        resumeId: resume3Id,
        userId: user2Id,
        category: "Data & Medical Software",
        skillsList: "R, SPSS Statistics, GraphPad Prism, Epic EHR, PubMed Database, Bioconductor",
        sortOrder: 2,
      }
    ]);

    // User 3: Marcus Vance (Finance @ NYU Stern)
    const user3Id = "user_marcus_vance";
    await db.insert(users).values({
      id: user3Id,
      name: "Marcus Vance",
      email: "mvance@stern.nyu.edu",
      passwordHash: "demo_password_hash",
      headline: "Finance & Economics @ NYU Stern | Incoming Investment Banking Analyst",
      phone: "(212) 998-0100",
      location: "New York, NY",
      linkedinUrl: "https://linkedin.com/in/marcusvance-stern",
      bio: "Finance senior with private equity internship experience. Skilled in valuation, DCF modeling, LBO analysis, and corporate strategy.",
      profilePictureUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
      university: "New York University - Stern School of Business",
      department: "Finance & Economic Theory",
      graduationYear: "2026",
      preferredJobRole: "Investment Banking Analyst",
      themePreference: "system",
      emailNotifications: true,
      applicationAlerts: true,
      weeklyDigest: true,
    });

    const resume4Id = "res_marcus_ib";
    await db.insert(resumes).values({
      id: resume4Id,
      userId: user3Id,
      title: "Investment Banking & Corporate Finance",
      targetRole: "Investment Banking Analyst / Private Equity Associate",
      template: "minimal_corp",
      colorTheme: "slate",
      fontSize: "md",
      fontFamily: "roboto",
      showGpa: true,
      showCoursework: true,
      showProjectsFirst: false,
      shareSlug: "marcus-vance-ib",
      isPublic: true,
      atsScore: 91,
    });

    await db.insert(education).values({
      id: "edu_marcus_1",
      resumeId: resume4Id,
      userId: user3Id,
      institution: "New York University - Stern School of Business",
      degree: "Bachelor of Science",
      major: "Finance & Economic Theory",
      minor: "Advanced Mathematical Methods",
      location: "New York, NY",
      startDate: "Aug 2022",
      endDate: "May 2026",
      gpa: "3.82 / 4.00",
      honors: "Stern Scholar, Dean's List",
      coursework: "Corporate Finance, Financial Statement Analysis, Venture Capital, Macroeconomics, Options & Futures",
      sortOrder: 1,
    });

    await db.insert(workExperiences).values([
      {
        id: "work_marcus_1",
        resumeId: resume4Id,
        userId: user3Id,
        company: "Goldman Sachs",
        role: "Investment Banking Summer Analyst",
        location: "New York, NY",
        startDate: "Jun 2025",
        endDate: "Aug 2025",
        isCurrent: false,
        bullets: JSON.stringify([
          "Constructed detailed three-statement financial models, LBO valuation, and discounted cash flow (DCF) models for $450M cross-border M&A transaction.",
          "Authored 35-page pitch book presentation delivered to C-suite executives of Fortune 500 SaaS target company."
        ]),
        sortOrder: 1,
      }
    ]);

    await db.insert(skills).values([
      {
        id: "skill_marcus_1",
        resumeId: resume4Id,
        userId: user3Id,
        category: "Financial & Technical Modeling",
        skillsList: "DCF Modeling, LBO Analysis, M&A Valuation, Capital IQ, Bloomberg Terminal, FactSet, Advanced Excel (VBA)",
        sortOrder: 1,
      }
    ]);

    console.log("Successfully seeded database with realistic student records!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
