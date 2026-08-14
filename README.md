# 🚀 SkillForge AI — AI-Powered Skill Intelligence & Career Acceleration Platform

![SkillForge AI Banner](https://img.shields.io/badge/SkillForge-AI_Powered-indigo?style=for-the-badge&logo=sparkles)
![Next.js 14](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Groq AI](https://img.shields.io/badge/Groq_AI-Llama_3.3_70B-orange?style=for-the-badge&logo=openai&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

SkillForge AI is a state-of-the-art, resume-driven career acceleration platform designed to extract skills from student resumes in real time, analyze target career gaps, generate adaptive AI learning roadmaps, recommend personalized projects and certifications, and conduct interactive AI mock interviews.

---

## ✨ Key Features

- 📄 **Real-Time Resume Extraction Engine**: Direct in-memory parsing of PDF and DOCX resumes with Groq LLM structured extraction, fast fuzzy taxonomy normalization, and instant skill profiling.
- 🔒 **Strict Resume-First Pipeline**: Enforces resume upload as the prerequisite before unlocking learning roadmaps, skill recommendations, and mock technical interviews.
- 🗺️ **Adaptive AI Learning Roadmaps**: Generates structured, milestone-based learning plans tailored to the student's target career role with persistent "Mark Done" progress state.
- 💡 **Intelligent Recommendations Engine**: Contextual recommendations for curated learning resources, portfolio projects, and industry certifications based on identified skill gaps.
- 🧠 **Resume-Grounded AI Mock Interviews**: Dynamic technical interview questions derived directly from the student's resume project portfolio with real-time AI evaluation and feedback.
- 📊 **Career Readiness & Progress Analytics**: Real-time calculation of overall career readiness score, mastered competencies, skill gaps remaining, and activity timeline.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Vanilla CSS Design Tokens
- **Icons & UI**: Lucide React, Shadcn UI patterns
- **Auth Client**: `@supabase/supabase-js`

### **Backend**
- **Framework**: FastAPI (Python 3.11)
- **Database ORM**: SQLAlchemy 2.0 & Alembic Migrations
- **Fuzzy Matching**: RapidFuzz
- **PDF & DOCX Parsers**: `pypdf`, `python-docx`
- **Server**: Uvicorn Async ASGI Server

### **AI & Data Layer**
- **LLM Provider**: Groq API (`llama-3.3-70b-versatile` with `llama-3.1-8b-instant` automatic fallback)
- **Structured Schema Enforcement**: Pydantic v2
- **Database**: PostgreSQL (Hosted on Supabase)

---

## 📁 Repository Structure

```
SkillForge/
├── backend/                  # FastAPI Python Backend
│   ├── alembic/              # Database schema migrations
│   ├── app/
│   │   ├── ai/               # AI Prompts, Schemas, Extractors & Groq Provider
│   │   ├── api/              # FastAPI APIRouters (skills, roadmap, recommendations, interview, progress)
│   │   ├── core/             # Auth, DB session pooling, and Config
│   │   ├── models/           # SQLAlchemy Data Models
│   │   ├── repositories/     # Database repository layer
│   │   └── services/         # Core business logic engines
│   ├── requirements.txt      # Python dependencies
│   └── .env                  # Backend environment configuration
│
├── frontend/                 # Next.js 14 Frontend Web Application
│   ├── src/
│   │   ├── app/              # App router pages ((dashboard), (auth), onboarding, etc.)
│   │   ├── components/       # Reusable UI components & Sidebar
│   │   └── lib/              # Supabase client helpers
│   ├── package.json          # Frontend dependencies
│   └── .env.local            # Frontend environment variables
│
└── README.md                 # Project Documentation
```

---

## ⚙️ Local Development Setup

### **Prerequisites**
- Python 3.11+
- Node.js 18+ & Bun (or npm/pnpm)
- Supabase PostgreSQL Account

---

### **1. Backend Setup**

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```env
PROJECT_NAME="SkillForge AI Backend"
ENVIRONMENT="development"

DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"

SUPABASE_URL="https://YOUR_SUPABASE_ID.supabase.co"
SUPABASE_JWT_SECRET="YOUR_SUPABASE_JWT_SECRET"

GROQ_API_KEY="YOUR_GROQ_API_KEY"
GROQ_MODEL="llama-3.3-70b-versatile"

ALLOWED_ORIGINS=["http://localhost:3000", "http://127.0.0.1:3000"]
```

Apply database migrations:

```bash
alembic upgrade head
```

Run the backend dev server:

```bash
uv run uvicorn app.main:app --reload --port 8000
```

> **Backend API Docs**: http://localhost:8000/docs

---

### **2. Frontend Setup**

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
bun install   # or npm install
```

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_SUPABASE_ID.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
NEXT_PUBLIC_API_BASE_URL="http://localhost:8000"
```

Run the frontend dev server:

```bash
bun run dev   # or npm run dev
```

> **Frontend Application URL**: http://localhost:3000

---

## 🌐 Production Deployment Guide

### **Backend (Deploy to Render)**
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository and set **Root Directory** to `backend`.
3. Set **Build Command**: `pip install -r requirements.txt`
4. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_JWT_SECRET`, `GROQ_API_KEY`, `ALLOWED_ORIGINS`.

### **Frontend (Deploy to Vercel)**
1. Create a new Project on [Vercel](https://vercel.com).
2. Import your GitHub repository and set **Root Directory** to `frontend`.
3. Framework Preset: **Next.js**.
4. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_BASE_URL` (pointing to Render backend URL).
5. Click **Deploy**.

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
