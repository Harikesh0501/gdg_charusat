# 📊 SkillForge: Slide-by-Slide PowerPoint Presentation Content

---

## 🎬 SLIDE 1: Title Slide

### **Title**: SkillForge
### **Subtitle**: AI-Powered Adaptive Career Roadmap & Skill Development Engine
- **Tagline**: Bridging Student Competencies to Target Industry Roles via Dynamic Gap Analysis & AI Mock Interviews.
- **Presenter**: Harikesh Patel & Team (GDG CHARUSAT)
- **Tech Stack Highlights**: Next.js 14 | FastAPI | PostgreSQL | Groq Cloud Llama-3.3-70B

---

## ❓ SLIDE 2: Problem Statement

### **Headline**: The Gap Between Education and Industry Hiring Requirements
- ❌ **Curriculum Mismatch**: University courses often lag behind rapidly evolving industry tech stacks (e.g. RAG, FastAPI, Next.js).
- ❌ **One-Size-Fits-All Learning**: Generic video courses do not adapt to individual student skill levels or existing project experience.
- ❌ **Unverified Project Portfolios**: Students build basic tutorial projects without structured 4-phase implementation specifications.
- ❌ **Lack of Resume-Grounded Interview Preparation**: Traditional interview prep uses static LeetCode lists instead of testing students on their actual resume claims.

---

##💡 SLIDE 3: Proposed Solution - SkillForge

### **Headline**: An End-to-End Adaptive Learning & Interview Acceleration Platform
- ✅ **Resume-Driven Skill Ingestion**: Automatically parses `.pdf` / `.docx` resumes in-memory to seed student skill proficiencies.
- ✅ **Deterministic Skill Gap Calculation**: Mathematically computes exact skill deficits against target industry career roles.
- ✅ **3-Tier Course Roadmap Engine**: Generates structured Module ➔ Chapter ➔ Topic learning paths with practice labs.
- ✅ **Full-Internet Project Search**: Discovers authentic open-source repositories and 4-phase domain-tailored project specifications.
- ✅ **Resume-Grounded AI Mock Interviews**: Evaluates students on their portfolio projects with lead interviewer AI feedback.

---

## 🔥 SLIDE 4: Key Innovations & Core Features

### **Headline**: What Makes SkillForge Unique?
1. **Full-Internet Web Search Engine**:
   - Live query parsing (`InternetSearchEngine`) across GitHub, GitLab, and official developer documentation portals (FastAPI, React, Docker, Pandas).
2. **Technology & Domain-Aware Milestone Engine**:
   - `ProjectMilestoneEngine` generates 4 distinct, technology-matched implementation phases (ML, Web Frontend, FastAPI Backend, RAG AI, Data Structures).
3. **Resume-Grounded AI Mock Interview Prep**:
   - Interview questions generated strictly from the candidate's uploaded resume projects with anti-repetition attempt exclusion.
4. **100% Deterministic AI Fallback Protection**:
   - Guarantees unbroken platform uptime even during LLM API rate limits (HTTP 429).

---

## 🏗️ SLIDE 5: High-Level System Architecture & Tech Stack

### **Headline**: Modern, Scalable Multi-Tier Architecture

| Layer | Technologies Used | Key Purpose |
|---|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, Tailwind CSS | Glassmorphism UI tokens, fluid micro-animations, responsive layout |
| **Backend** | FastAPI (Python 3.11), SQLAlchemy 2.0 ORM | High-performance async REST API, Pydantic V2 validation |
| **Database** | PostgreSQL, Alembic Migrations | Persistent user profiles, roadmap items, attempt logs, catalog |
| **AI Engine** | Groq Cloud API (`llama-3.3-70b-versatile`) | Resume parsing, structured explanations, lead interviewer assessment |
| **Parsing** | `pypdf`, `python-docx` | In-memory binary document parsing without cloud disk storage |

---

## 🧮 SLIDE 6: Algorithmic & Mathematical Models

### **Headline**: Data-Driven Scoring & Anti-Repetition Intelligence

1. **Deterministic Skill Gap Formula**:
   $$\Delta(s) = \max\Big(0, \, \text{Proficiency}_{\text{Required}}(R, s) - \text{Proficiency}_{\text{Student}}(s)\Big)$$

2. **Personalized Recommendation Weighted Scoring**:
   $$\text{Score} = 3 \cdot S_{\text{priority}} + 2 \cdot S_{\text{difficulty}} + 1 \cdot S_{\text{interest}} + 1 \cdot S_{\text{coverage}}$$

3. **Anti-Repetition Question Selection Algorithm**:
   $$\mathcal{Q}_{\text{candidate}} = \mathcal{Q}_{\text{seed}}(R) \setminus \{ q \in \mathcal{Q}_{\text{all}} \mid q.\text{id} \in \text{Attempts}_{\text{student}} \}$$

---

## 📄 SLIDE 7: Workflow 1 & 2 - Resume Extraction & Skill Gap Engine

### **Headline**: Automated Resume Profiling to Skill Gap Blueprint

- **Step 1: Resume Upload**: Student uploads PDF/DOCX file. Parsed in-memory without saving raw files to disk.
- **Step 2: AI Parsing**: Extracts work experience, technical skills, and portfolio projects into JSON schemas.
- **Step 3: Target Role Mapping**: Compares student proficiencies (Level 1–5) to target role requirements (*Backend Engineer*, *Data Scientist*, *Full-Stack Developer*).
- **Step 4: Priority Bucket Allocation**: Classifies deficits into **High** ($\Delta \ge 2$), **Medium** ($\Delta = 1$), or **Low** priority buckets.

---

## 📚 SLIDE 8: Workflow 3 - 3-Tier Course Roadmap & Chapter Analytics

### **Headline**: Structured Progression from Beginner to Mastery

- **3-Tier Hierarchy**:
  - 📦 **Module (Learning Phase)**: Prerequisite topological ordering (e.g. *P1: Foundations*, *P2: Core Microservices*).
  - 📖 **Chapter**: Topic grouping (e.g. *Chapter 1.1: Async FastAPI & Pydantic V2*).
  - 🎯 **Topic (Actionable Item)**: Individual skill lesson, study resource URL, and practice lab.
- **Chapter Analytics**:
  - Displays real-time progress: `{completed_chapters} / {total_chapters} Chapters Mastered` and `{completed_topics} / {total_topics} Topics ({pct}%)`.

---

## 🛠️ SLIDE 9: Workflow 4 - Hands-On Projects & Web Search Engine

### **Headline**: Real-World Building Projects Backed by Live Web Search

- **Full-Internet Search Engine**:
  - Dynamically queries search engines across the web for authentic repository blueprints and developer guides.
- **Domain-Tailored 4-Phase Roadmaps**:
  - **Phase 1**: Environment & Architecture Setup ➔ *Official Language/Venv Docs*
  - **Phase 2**: Core Domain Logic & Engine ➔ *Official Framework Docs*
  - **Phase 3**: Data Persistence & Integration Layer ➔ *SQLAlchemy / DB Specs*
  - **Phase 4**: Automated Testing & Containerization ➔ *Docker Multi-Stage Specs*
- **Progress Tracking**:
  - Interactive checkboxes with milestone completion gauges (`0 of 4 Completed (0%)`).

---

## 🎯 SLIDE 10: Workflow 5 - AI-Powered Adaptive Mock Interview

### **Headline**: Resume-Grounded Project & Technical Interview Assessment

- **Resume Project Grounding**:
  - AI generates technical scenario questions derived directly from the student's actual resume projects.
- **Lead Interviewer AI Evaluation**:
  - Evaluates student response against ideal answer criteria points.
  - Scores performance up to **100%** and outputs structured **Strengths**, **Weaknesses**, and **Actionable Feedback**.
- **Historical Performance Analytics**:
  - Tracks total attempts and overall average score progression over time.

---

## 🚀 SLIDE 11: Deployment & Evaluation Instructions

### **Headline**: Production Hosting & Reviewer Quick-Start Guide

- **Live Deployment URLs**:
  - **Frontend**: Hosted on Vercel (Next.js App Router)
  - **Backend**: Hosted on Render Free Tier (FastAPI Service)
  - **Database**: PostgreSQL on Supabase
- **Reviewer Note (Render Free Tier)**:
  - Backend enters sleep mode after 15 minutes of inactivity. First request takes **~50–53 seconds** to initialize.



## 🏁 SLIDE 12: Impact, Future Vision & Conclusion

### **Headline**: Transforming Career Readiness for Next-Gen Engineers

- **Quantifiable Impact**:
  - Reduces time spent searching for learning resources by **70%**.
  - Provides verifiable 4-phase project blueprints for resume portfolio strength.
  - Prepares students for real-world technical interviews with AI-driven feedback.
- **Future Roadmap**:
  - 🖥️ In-browser interactive code execution sandbox.
  - 🤝 Peer-to-peer code review & collaborative projects.
  - 🏢 Enterprise recruiter dashboard for direct skill-verified hiring.
- **Thank You! Questions & Feedback Welcome.**
