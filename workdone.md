# Work Done / Engineering Memory

This file is a persistent memory layer for AI coding agents working on SkillForge AI. It is not a changelog — changelogs describe *what* changed; this file preserves *why*, what was tried and rejected, what mistakes happened and why, and what the user explicitly said. A future agent should be able to read this file and avoid repeating a mistake or re-litigating a settled decision, without re-reading the entire conversation history that produced it.

## How to Use This File

- **Before starting work on any feature/phase**, skim this file for entries tagged with the relevant module/phase — check "Rejected Approaches" and "Engineering Rules Learned" first.
- **After any meaningful implementation work**, add a new dated entry under "Implementation History" using the structured format below. This is mandatory per `AGENT.md` §14 — not optional cleanup.
- If you reject an approach the user suggested, or the user rejects one of yours, record it under "Rejected Approaches" immediately, in the moment — don't wait until the end of a session.
- If the user says anything resembling "never do X again," record it verbatim (or close to it) under "User Preferences / Explicit Feedback" — treat this as a hard constraint for all future work, equivalent in weight to a rule in `AGENT.md`.
- If an architectural decision documented in `docs/` changes during implementation, record both the old and new decision under "Architectural Decisions Changed During Development" **and** update the relevant `docs/NN_*.md` file itself — this file is the memory of the change, `docs/` is the current truth.

## Engineering Rules Learned During Implementation

- **2026-08-14 — PostgreSQL Auto-Increment Sequence Synchronization**: When seeding records with integer primary keys (`id`), PostgreSQL auto-increment sequences (`skills_id_seq`, `career_roles_id_seq`, etc.) must be explicitly updated using `SELECT setval('seq_name', (SELECT MAX(id) FROM table))` to avoid `UniqueViolation: duplicate key value violates unique constraint` when subsequent `INSERT` statements execute.

## Rejected Approaches

*(Empty at project start.)*

## User Preferences / Explicit Feedback

- **2026-08-11**: "don't want to use clerk" — Switched auth provider from Clerk to Supabase Auth (`@supabase/ssr` on frontend, JWT verification on FastAPI backend).
- **2026-08-11**: "what if we use groq because i not have money" — Switched primary LLM provider from OpenAI (`gpt-4o-mini`) to Groq (`meta-llama/llama-4-scout-17b-16e-instruct` / Llama 4 Scout), utilizing Groq's 100% free API tier and OpenRouter (`nvidia/nemotron-3-embed-1b`) / FastEmbed for zero-cost embeddings.
- **2026-08-11**: "for frontend we prefer bun and in python we prefer uv for package manager" — Set `bun` as the frontend package manager/runtime and `uv` as the Python backend package/environment manager.

## Architectural Decisions Changed During Development

- **2026-08-11 — Package Managers (npm/pip → bun/uv)**:
  - *Old Decision*: Standard `npm` for frontend and `pip`/`venv` for backend.
  - *New Decision*: `bun` for Next.js frontend package management and `uv` (`uv venv`, `uv pip`, `uv run`) for Python backend.
  - *Rationale*: Extreme installation/execution speed, zero configuration friction on developer machine. Updated in `docs/13`, `docs/14`, `AGENT.md`.
- **2026-08-11 — Auth Provider (Clerk → Supabase Auth)**:
  - *Old Decision*: Clerk managed identity provider for Next.js frontend and FastAPI backend.
  - *New Decision*: Supabase Auth (`@supabase/ssr` / `@supabase/supabase-js`) for frontend auth and Supabase JWT verification in FastAPI backend.
  - *Rationale*: Eliminates third-party Clerk account dependency, costs zero money, and consolidates Database, Storage, and Auth under a single Supabase project. Updated in `docs/02`, `docs/14`, `AGENT.md`.
- **2026-08-11 — AI Provider (OpenAI → Groq Llama 4 Scout + Nemotron 3 Embed 1B)**:
  - *Old Decision*: OpenAI (`gpt-4o-mini` + `text-embedding-3-small`) as sole AI provider.
  - *New Decision*: Groq API (`meta-llama/llama-4-scout-17b-16e-instruct`) for structured JSON output, paired with OpenRouter (`nvidia/nemotron-3-embed-1b`) / FastEmbed for embeddings.
  - *Rationale*: Zero-cost setup using Groq free tier + OpenRouter NVIDIA Nemotron 3 Embed 1B free tier, eliminating OpenAI API costs. Updated in `docs/06`, `docs/14`, `AGENT.md`.

## Implementation History

### 2026-08-11 — Documentation & Architecture Foundation

**Task**: Generate the complete engineering documentation and architecture system for SkillForge AI (a hackathon MVP: AI-powered personalized learning/career mentor) from a detailed master prompt, before any application code is written. Repository was completely empty (no git, no files) at the start.

**Intended Outcome**: A full set of documents (`AGENT.md`, `PRD.md`, `phases.md`, `design.md`, `reference.md`, `workdone.md`, `docs/01`-`14`) plus `.agent/skills/` playbooks, internally consistent, implementation-oriented, sized for a ~3-day hackathon build, usable by a future AI coding agent as the sole source of truth without needing to re-derive architecture from scratch.

**Implementation**: Performed the seven-area architectural reasoning pass (product/system architecture, student profile + skill intelligence model, AI architecture, recommendation architecture, database architecture, frontend/UX architecture, technology/infrastructure architecture) and locked concrete decisions:

- Modular monolith: Next.js (Vercel) + FastAPI (Render) + PostgreSQL/pgvector (Supabase) + Supabase Storage + Clerk auth + OpenAI (`gpt-4o-mini` + `text-embedding-3-small`) behind a provider abstraction.
- Skill model: 0-4 proficiency scale with `source`/`confidence`/`evidence`, curated `skills` taxonomy (~150-250 seeded), 6 seeded career roles (Frontend Engineer, Backend Engineer, Full-Stack Engineer, Data Analyst, Data Scientist/ML Engineer, DevOps/Cloud Engineer).
- Gap engine, roadmap structure, and recommendation ranking are all deterministic; the LLM is used for exactly five bounded use cases (resume extraction, roadmap narrative, recommendation explanation, interview question generation, interview evaluation), each with a Pydantic schema and a deterministic fallback.
- Deployment: Vercel + Render + Supabase + Clerk, documented with Railway as a pre-approved backend fallback.

Wrote all 20 documents plus this file, then performed a cross-document consistency audit (tech stack, entity names, endpoint names, priority tiers, and career-role/skill vocabulary checked for agreement across `PRD.md`, `AGENT.md`, `phases.md`, `design.md`, and `docs/01`-`14`).

**Files Changed**: All new files — `AGENT.md`, `PRD.md`, `phases.md`, `design.md`, `reference.md`, `workdone.md` (this file), `docs/01_PROJECT_OVERVIEW_AND_SYSTEM_REQUIREMENTS.md` through `docs/14_TECHNOLOGY_STACK_AND_FUTURE_ROADMAP.md`, `.agent/skills/*/SKILL.md`.

**Problems Encountered**: None blocking — repository was empty, so there was no existing implementation to reconcile or conflict with. This meant the "inspect existing code, don't destroy work" step of the process resolved trivially (nothing existed to preserve).

**Agent Mistakes**: None identified at documentation-authoring time; this entry exists primarily to seed the file's format for future entries, and to record the initial state so a future agent doesn't waste time re-verifying "was there really nothing here before."

**Why the Mistake Happened**: N/A.

**User Feedback**: N/A — this was the initial documentation-generation request; no implementation feedback loop has occurred yet.

**Requested Changes**: N/A.

**Final Decision**: Documentation set as generated stands as the source of truth for implementation, per the decisions summarized above and detailed in each respective `docs/NN_*.md` file.

**Verification**: Manual read-through consistency audit across all documents for: tech stack agreement, database entity/field naming agreement, API endpoint naming agreement, P0/P1/P2/P3 scope agreement, and AI-vs-deterministic responsibility boundary agreement. No contradictions found at authoring time. Note: this is a documentation consistency check, not a functional/code verification — there is no code yet to test.

### 2026-08-11 — Phase 0: Project Scaffolding & Core Pipeline

**Task**: Scaffold the complete initial repository infrastructure for both `frontend/` (Next.js 14 + Supabase SSR + Tailwind CSS) and `backend/` (FastAPI + SQLAlchemy + Alembic + Groq + OpenRouter/FastEmbed), managed via `bun` and `uv`.

**Intended Outcome**: Working end-to-end pipeline with zero compilation/test errors, Supabase Auth user sync endpoint (`POST /api/auth/sync`), health check (`GET /api/health`), and Alembic DB migration for `users` and `profiles`.

**Implementation**:
- **Backend (`backend/`)**: Built `requirements.txt`, `core/config.py`, `core/db.py`, `core/auth.py` (Supabase JWT verification), `core/errors.py` (standard error envelope), `models/user.py` & `models/profile.py`, `schemas/auth.py` & `schemas/profile.py`, `api/health.py` & `api/auth.py`, `ai/providers/groq_provider.py` (Llama 4 Scout) & `openrouter_provider.py` (NVIDIA Nemotron 3 Embed 1B), `main.py`, `alembic/versions/0001_initial_users_and_profiles.py`, and `tests/test_health.py`. Virtual environment created via `uv venv` and dependencies installed via `uv pip install`.
- **Frontend (`frontend/`)**: Built `package.json`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `src/lib/supabase/` clients, `src/middleware.ts` (Supabase SSR route protection), `src/app/globals.css`, root `layout.tsx`, `page.tsx` landing page, `(auth)/sign-in` & `(auth)/sign-up` auth pages, and protected `dashboard/page.tsx` command center shell. Dependencies installed via `bun install`.
- **Seed Scaffolding (`seed/`)**: Created `seed/README.md` and environment templates `.env.example`.

**Files Changed**: Created `backend/` and `frontend/` application structures, `seed/README.md`, updated `.gitignore`, `workdone.md`, `AGENT.md`, `docs/01`–`14`, and `implementation_plan.md`.

**Problems Encountered**:
1. `uv pip install` timed out on `cryptography` package download — fixed by setting `$env:UV_HTTP_TIMEOUT="120"`.
2. Pytest failed to import `app` module — fixed by adding `pytest.ini` with `pythonpath = .`.
3. Pydantic V2 class Config deprecation warning — updated `app/schemas/profile.py` to `model_config = ConfigDict(from_attributes=True)`.
4. Dashboard TypeScript type mismatch (`bool` vs `boolean`) — updated `SyncData` interface in `dashboard/page.tsx`.

**User Feedback**: User explicitly specified removing Clerk (in favor of Supabase Auth), using Groq (`meta-llama/llama-4-scout-17b-16e-instruct`) for LLM, OpenRouter (`nvidia/nemotron-3-embed-1b`) for Embeddings, `bun` for frontend package manager, and `uv` for Python environment/package manager.

**Verification**:
- `uv run pytest`: 2 tests passed 100% (`GET /api/health` and root `/`).
- `bun run build`: Next.js 14 production build compiled successfully (`✓ Generating static pages (7/7)` with zero errors).

**Remaining Issues**: None for Phase 0.

### 2026-08-11 — Phase 1: Authentication + Onboarding Form

**Task**: Implement student profile repository/service, `PUT /api/profile` onboarding endpoint, interactive `/onboarding` form screen, and protected `(dashboard)` layout shell with onboarding completion guard.

**Intended Outcome**: New users are forced through the onboarding form to collect `full_name`, `education_level`, `institution`, `graduation_year`, `interests`, and `bio`. Completing onboarding sets `onboarding_completed = true` and unlocks access to the dashboard.

**Implementation**:
- **Backend**:
  - `app/repositories/profile.py`: `ProfileRepository` with `get_by_id`, `get_by_user_id`, `update_profile`.
  - `app/services/profile.py`: `ProfileService` with validation (required `full_name` and `education_level`).
  - `app/schemas/profile.py`: Updated `ProfileUpdateRequest` with Pydantic Field validation limits.
  - `app/api/profile.py`: `GET /api/profile` and `PUT /api/profile` endpoints.
  - `app/main.py`: Mounted `profile.router`.
  - `tests/test_profile.py` & `tests/conftest.py`: Added pytest unit tests and test client fixture.
- **Frontend**:
  - `app/onboarding/page.tsx`: Interactive multi-field onboarding screen with tag selection for career interests.
  - `app/(dashboard)/layout.tsx`: Protected layout wrapper checking `onboarding_completed`; auto-redirects to `/onboarding` if false.
  - `app/dashboard/page.tsx`: Updated onboarding status card with active status indicator and complete now CTA link.

**Files Changed**: Created `app/repositories/profile.py`, `app/services/profile.py`, `app/api/profile.py`, `tests/test_profile.py`, `tests/conftest.py`, `app/onboarding/page.tsx`, `app/(dashboard)/layout.tsx`; modified `app/schemas/profile.py`, `app/main.py`, `app/dashboard/page.tsx`, `workdone.md`.

**Problems Encountered**:
1. Missing `client` pytest fixture — created `tests/conftest.py` exporting `TestClient(app)`.

**Verification**:
- `uv run pytest`: 4 tests passed 100% in 0.07s.
- `bun run build`: Next.js 14 production build compiled successfully (`✓ Generating static pages (8/8)` with zero errors).

**Remaining Issues**: None for Phase 1. Phase 2 (Resume Processing Pipeline) is the next bound work item in `phases.md`.

**Lessons for Future Agents**:
- Maintain `onboarding_completed` gating in `app/(dashboard)/layout.tsx` so un-onboarded users cannot bypass the profile setup step.
- Always include `values_callable=lambda x: [e.value for e in x]` on all SQLAlchemy `Enum` columns so SQLAlchemy sends lowercase string values (`undergraduate`) matching Postgres `ENUM` types instead of Python Enum member names (`UNDERGRADUATE`).

### 2026-08-13 — SQLAlchemy Enum Value Representation Fix (`values_callable`)

**Task**: Fix PostgreSQL database crash on submitting onboarding profile (`sqlalchemy.exc.DataError: invalid input value for enum education_level_enum: "UNDERGRADUATE"`).

**Root Cause Identified**:
By default, SQLAlchemy's `Enum` type serializes Python `enum.Enum` instances using their **member names** (`UNDERGRADUATE`, `HIGH_SCHOOL`) rather than their **string values** (`undergraduate`, `high_school`). Because the PostgreSQL `ENUM` type in the database was defined with lowercase values, Postgres rejected `UNDERGRADUATE` as an invalid value.

**Implementation**:
- `app/models/profile.py`: Added `values_callable=lambda x: [e.value for e in x]` to `EducationLevel` column.
- `app/models/student_skill.py`: Added `values_callable=lambda x: [e.value for e in x]` to `SkillSource` column.
- `app/models/resume.py`: Added `values_callable=lambda x: [e.value for e in x]` to `ResumeStatus` and `ProjectSource` columns.

**Files Changed**: `backend/app/models/profile.py`, `backend/app/models/student_skill.py`, `backend/app/models/resume.py`, `workdone.md`.

**Verification**:
- Tested Python Enum serialization: `values_callable` cleanly outputs lowercase values (`undergraduate`).
- `uv run pytest`: 6 tests passed 100% in 0.96s.

### 2026-08-13 — Auth JWT Verification Fix (ES256 JWKS) & Sign-Up UX Cleanup

**Task**: Fix `401 Unauthorized` errors on `/api/auth/sync` and `/api/profile` endpoints, and resolve sign-up UX confusion regarding email confirmation.

**Root Cause Identified**:
1. **ES256 JWT Algorithm**: Supabase (new 2024/2025 projects) issues JWT tokens signed with **`ES256`** (ECDSA P-256) using JWKS (`/.well-known/jwks.json`), whereas our backend only allowed `HS256`. Passing an ES256 token to `jwt.decode(..., algorithms=["HS256"])` threw `JWTError: The specified alg value is not allowed`.
2. **Sign-Up UX Flow**: When Supabase email confirmation was enabled, `signUp()` returned `{ session: null, user: ... }` without an error, but the UI showed "Account created! Redirecting..." even though no session was present to log in.

**Implementation**:
- `app/core/auth.py`: Built `JWKSManager` with in-memory 1-hour caching to fetch public keys from `{SUPABASE_URL}/auth/v1/.well-known/jwks.json`, and `decode_supabase_token()` supporting `ES256`, `RS256`, and `HS256` token verification seamlessly.
- `app/api/auth.py`: Updated `/api/auth/sync` to use `decode_supabase_token()`.
- `frontend/src/app/(auth)/sign-up/page.tsx`: Rewrote sign-up component to check `data.session`. Displays "Check your email for confirmation" if no session is returned, or "Account created! Redirecting..." if immediate session is present.
- `frontend/next.config.js`: Removed experimental `webpackBuildWorker: true` on Windows, reducing cold start from 45.3s down to 3–8s and eliminating spurious `Error: Could not find or load main class Forge`.

**Files Changed**: `backend/app/core/auth.py`, `backend/app/api/auth.py`, `frontend/src/app/(auth)/sign-up/page.tsx`, `frontend/next.config.js`, `workdone.md`.

**Verification**:
- `uv run pytest`: 6 tests passed 100% in 17.36s.
- `JWKS`: Fetched and validated `https://npcxcnvhoarhozpeaoir.supabase.co/auth/v1/.well-known/jwks.json` returns HTTP 200 with ES256 EC keys.

### 2026-08-13 — Phase 2: Resume Ingestion & Skill Intelligence Pipeline

**Task**: Implement end-to-end resume processing pipeline: in-memory PDF/DOCX text parsing, Groq Llama 4 Scout AI structured skill extraction, rapidfuzz skill taxonomy normalization, and interactive frontend Skills Profile command center.

**Implementation**:
- **Backend AI Extraction**: Built `app/ai/schemas/resume_extraction.py` (Pydantic V2 schema), `app/ai/prompts/resume_prompts.py`, and `app/ai/extractors/resume_extractor.py` using `GroqProvider`.
- **In-Memory Text Parsing**: Built `app/services/text_extractor.py` using `pypdf` for `.pdf` and `python-docx` for `.docx`, enforcing in-memory processing without saving file bytes to disk or cloud storage per user explicit directive.
- **Service & Normalization**: Built `app/services/resume.py` with `rapidfuzz` fuzzy matching against `skills` taxonomy (`skills.name`/`aliases`). Discards unmatched skills and calculates confidence (0.4–0.85) and proficiency (2 for flat list, 3 if skill is used in project/experience).
- **API Endpoints**: Built `app/api/resume.py` (`POST /api/resume/upload`, `GET /api/resume/latest`, `GET /api/resume/{id}/status`) and `app/api/skills.py` (`GET /api/skills`, `POST /api/skills`, `DELETE /api/skills/{skill_id}`, `GET /api/skills/taxonomy`). Mounted in `app/main.py`.
- **Frontend Command Center**: Built `frontend/src/app/(dashboard)/skills/page.tsx` with drag-and-drop file uploader, real-time polling indicator, interactive Skills Profile grid with source/proficiency badges, and manual skill entry modal.

**Files Changed**: `backend/app/ai/schemas/resume_extraction.py`, `backend/app/ai/prompts/resume_prompts.py`, `backend/app/ai/extractors/resume_extractor.py`, `backend/app/services/text_extractor.py`, `backend/app/services/resume.py`, `backend/app/repositories/resume.py`, `backend/app/schemas/resume.py`, `backend/app/schemas/skill.py`, `backend/app/api/resume.py`, `backend/app/api/skills.py`, `backend/app/main.py`, `backend/tests/test_resume_processing.py`, `frontend/src/app/(dashboard)/skills/page.tsx`, `workdone.md`.

**Verification**:
- `uv run pytest`: 7 tests passed 100% in 0.74s.
- `bun run build`: Next.js 14 production build compiled successfully (`✓ Generating static pages (9/9)` with zero errors).

### 2026-08-13 — Dynamic Header Auth State Component (`HeaderNav`)

**Task**: Replace static `Sign In` link in global `RootLayout` header with dynamic `HeaderNav` component.

**Implementation**:
- `frontend/src/app/components/HeaderNav.tsx`: Built client component subscribing to `supabase.auth.onAuthStateChange`. Displays `Dashboard`, user email badge, and `Sign Out` button when authenticated, or `Sign In` button when unauthenticated.
- `frontend/src/app/layout.tsx`: Replaced static `<nav>` JSX with `<HeaderNav />`.

**Files Changed**: `frontend/src/app/components/HeaderNav.tsx`, `frontend/src/app/layout.tsx`, `workdone.md`.

**Verification**:
- `bun run build`: Compiled 100% cleanly (`✓ Generating static pages (9/9)`).

### 2026-08-13 — Supabase Client Singleton & Render Loop Fix

**Task**: Fix unstyled white page / infinite React render loop freeze on `/skills` ("Checking Onboarding Status...").

**Root Cause Identified**:
`createClient()` in `src/lib/supabase/client.ts` instantiated a new `SupabaseClient` instance on every call. Components calling `createClient()` inside their render body and including `supabase` in `useEffect` dependency arrays (`[router, supabase]`) triggered an infinite render loop on every state change, locking React's render pipeline and blocking CSS compilation.

**Implementation**:
- `frontend/src/lib/supabase/client.ts`: Converted `createClient()` to a singleton pattern using `clientInstance`.
- `frontend/src/app/(dashboard)/layout.tsx`, `dashboard/page.tsx`, `skills/page.tsx`, `HeaderNav.tsx`: Cleaned up `useEffect` dependency arrays to prevent re-triggering.

**Files Changed**: `frontend/src/lib/supabase/client.ts`, `frontend/src/app/(dashboard)/layout.tsx`, `frontend/src/app/(dashboard)/dashboard/page.tsx`, `frontend/src/app/(dashboard)/skills/page.tsx`, `frontend/src/app/components/HeaderNav.tsx`, `workdone.md`.

**Verification**:
- `bun run build`: Compiled 100% cleanly (`✓ Generating static pages (9/9)`).

### 2026-08-13 — Groq AI Model Configuration Update (`llama-3.3-70b-versatile`)

**Task**: Fix `404 model_not_found` error on uploading resume for AI extraction (`The model meta-llama/llama-4-scout-17b-16e-instruct does not exist`).

**Root Cause Identified**:
The default `GROQ_MODEL` string in config/env was set to `meta-llama/llama-4-scout-17b-16e-instruct`, which is not an active endpoint string on Groq's production API. Groq API rejected requests with `404 model_not_found`.

**Implementation**:
- `backend/.env`: Updated `GROQ_MODEL` to `"llama-3.3-70b-versatile"`.
- `backend/app/core/config.py`: Updated default `GROQ_MODEL` to `"llama-3.3-70b-versatile"`.

**Files Changed**: `backend/.env`, `backend/app/core/config.py`, `workdone.md`.

**Verification**:
- Tested model execution directly against Groq API: `llama-3.3-70b-versatile` succeeded.
- `uv run pytest`: 7 tests passed 100% in 1.88s.

### 2026-08-13 — Phase 4: Career Goal Catalog & Deterministic Skill-Gap Engine

**Task**: Implement career role catalog, target goal selection, 100% deterministic skill-gap & career readiness engine, unit tests, and Next.js frontend command center.

**Implementation**:
- **ORM & Database**: Built `app/models/career.py` (`CareerRole`, `CareerRoleSkill`, `SkillImportance`, `CareerGoal`), `alembic/versions/0003_career_roles_and_goals.py` migration, and `seed/career_roles.py` seeding script for 6 tech roles.
- **Repository & Engine**: Built `app/repositories/career.py` (`CareerRepository`) and `app/services/skill_gap.py` (`SkillGapService`), implementing formula $\text{Readiness} = \frac{\sum \min(current, required)}{\sum required} \times 100$, priority calculation ($gap \times weight$), bucket classification (`HIGH`, `MEDIUM`, `LOW`), and mastered skill exclusion.
- **Schemas & API**: Built `app/schemas/career.py` and `app/api/career.py` (`GET /api/career-roles`, `POST /api/career-goal`, `GET /api/career-goal`, `GET /api/skill-gap`). Mounted in `app/main.py`.
- **Unit Tests**: Built `tests/test_skill_gap.py` verifying mathematical correctness, bucket classification, mastered skill isolation, and multi-student gap isolation.
- **Frontend Command Center**: Built `frontend/src/app/(dashboard)/roadmap/page.tsx` (Career Readiness & Gap Command Center), `recommendations/page.tsx`, and `progress/page.tsx`.

**Files Changed**: `backend/app/models/career.py`, `backend/app/models/__init__.py`, `backend/alembic/versions/0003_career_roles_and_goals.py`, `seed/career_roles.py`, `backend/app/repositories/career.py`, `backend/app/services/skill_gap.py`, `backend/app/schemas/career.py`, `backend/app/api/career.py`, `backend/app/main.py`, `backend/tests/test_skill_gap.py`, `backend/tests/conftest.py`, `frontend/src/app/(dashboard)/roadmap/page.tsx`, `frontend/src/app/(dashboard)/recommendations/page.tsx`, `frontend/src/app/(dashboard)/progress/page.tsx`, `workdone.md`.

**Verification**:
- `uv run alembic upgrade head`: Applied `0003_career` migration cleanly.
- `uv run python ../seed/career_roles.py`: 6 career roles seeded.
- `uv run pytest`: **9 passed (100%) in 18.13s**.
- `bun run build`: Next.js 14 production build compiled successfully (`✓ Generating static pages (12/12)`).

### 2026-08-13 — Phase 5: Personalized Learning Roadmap Engine & UI

**Task**: Implement deterministic topological prerequisite-sorted learning roadmap generator, Groq AI Llama 3.3 70B narrative layer with fallback, API endpoints, unit tests, and interactive Next.js command center.

**Implementation**:
- **ORM & Database**: Built `app/models/roadmap.py` (`Roadmap`, `RoadmapPhase`, `RoadmapItem`, `RoadmapStatus`, `RoadmapItemType`, `RoadmapItemStatus`), `app/models/__init__.py`, and `alembic/versions/0004_roadmap_tables.py` migration.
- **Topological Sorting Engine**: Built `app/services/roadmap.py` (`RoadmapService`) implementing Kahn's DAG algorithm to sequence prerequisite skills before target skills, adaptive phase chunking (1, 2, or 3 phases), item assembly (`skill`, `resource`, `milestone`), and repository persistence.
- **AI Narrative Layer**: Built `app/ai/schemas/roadmap_narrative.py`, `app/ai/prompts/roadmap_prompts.py`, and `app/ai/extractors/roadmap_narrative.py` with Groq Llama 3.3 70B (`llama-3.3-70b-versatile`) and deterministic fallback text.
- **Schemas & API**: Built `app/repositories/roadmap.py`, `app/schemas/roadmap.py`, and `app/api/roadmap.py` (`GET /api/roadmap`, `POST /api/roadmap/generate`, `PATCH /api/roadmap/items/{item_id}`). Mounted in `app/main.py`.
- **Unit Tests**: Built `tests/test_roadmap.py` testing prerequisite topological ordering, item status updates, and DB persistence.
- **Frontend Command Center**: Built interactive Next.js UI in `frontend/src/app/(dashboard)/roadmap/page.tsx` featuring career role selector, Groq AI strategy callout, phase accordions, progress tracker, and live item status toggling.

**Files Changed**: `backend/app/models/roadmap.py`, `backend/app/models/__init__.py`, `backend/alembic/versions/0004_roadmap_tables.py`, `backend/alembic/versions/0001_initial_users_and_profiles.py`, `backend/alembic/versions/0002_resume_processing_and_skills.py`, `backend/alembic/versions/0003_career_roles_and_goals.py`, `backend/app/ai/schemas/roadmap_narrative.py`, `backend/app/ai/prompts/roadmap_prompts.py`, `backend/app/ai/extractors/roadmap_narrative.py`, `backend/app/repositories/roadmap.py`, `backend/app/services/roadmap.py`, `backend/app/schemas/roadmap.py`, `backend/app/api/roadmap.py`, `backend/app/main.py`, `backend/tests/test_roadmap.py`, `frontend/src/app/(dashboard)/roadmap/page.tsx`, `workdone.md`.

**Verification**:
- `uv run alembic upgrade head`: Applied `0004_roadmap` migration cleanly.
- `uv run pytest`: **10 passed (100%) in 0.18s**.
- `bun run build`: Next.js 14 production build compiled successfully (`✓ Generating static pages (12/12)`).

### 2026-08-14 — Phase 6: Recommendation Engine (Resources, Projects, Certifications)

**Task**: Implement candidate retrieval & deterministic weighted scoring recommendation engine, curated content seeding script, Groq AI Llama 3.3 70B explanation layer with fallback, API endpoints, unit tests, and interactive Next.js command center.

**Implementation**:
- **ORM & Database**: Built `app/models/recommendation.py` (`Resource`, `Project`, `Certification`, `RecommendationLog`, join tables `resource_skills`, `project_skills`, `certification_skills`), `app/models/__init__.py`, and `alembic/versions/0005_recommendations_tables.py` migration applied to Supabase PostgreSQL.
- **Curated Content Seeding**: Built `seed/resources_and_projects.py` seeding 16 learning resources, 5 hands-on projects, and 3 industry certifications pre-tagged to target skill taxonomy.
- **Scoring Engine**: Built `app/services/recommendations.py` (`RecommendationService`) implementing formula $\text{Score} = 3 \times \text{gap\_priority} + 2 \times \text{difficulty\_fit} + 1 \times \text{interest\_match} + 1 \times \text{skill\_coverage}$.
- **Groq AI Explanation Layer**: Built `app/ai/schemas/recommendation_explanation.py`, `app/ai/prompts/recommendation_prompts.py`, and `app/ai/extractors/recommendation_explanation.py` with Groq Llama 3.3 70B (`llama-3.3-70b-versatile`) and deterministic fallback text.
- **Schemas & API**: Built `app/repositories/recommendation.py`, `app/schemas/recommendation.py`, and `app/api/recommendations.py` (`GET /api/recommendations?category=resource|project|certification`). Mounted in `app/main.py`.
- **Unit Tests**: Built `tests/test_recommendations.py` testing candidate retrieval filtering by gap skills, scoring math, and AI explanation fallback.
- **Frontend Command Center**: Built interactive Next.js UI in `frontend/src/app/(dashboard)/recommendations/page.tsx` with category tabs (`Courses & Docs`, `Hands-On Projects`, `Certifications`), skill gap badges, score indicators, external resource links, and Groq AI explanation callout boxes.

**Files Changed**: `backend/app/models/recommendation.py`, `backend/app/models/__init__.py`, `backend/alembic/versions/0005_recommendations_tables.py`, `seed/resources_and_projects.py`, `backend/app/ai/schemas/recommendation_explanation.py`, `backend/app/ai/prompts/recommendation_prompts.py`, `backend/app/ai/extractors/recommendation_explanation.py`, `backend/app/repositories/recommendation.py`, `backend/app/services/recommendations.py`, `backend/app/schemas/recommendation.py`, `backend/app/api/recommendations.py`, `backend/app/main.py`, `backend/tests/test_recommendations.py`, `frontend/src/app/(dashboard)/recommendations/page.tsx`, `workdone.md`.

**Verification**:
- `uv run alembic upgrade head`: Applied `0005_recommendations` migration cleanly.
- `python seed/resources_and_projects.py`: Seeded resources, projects, and certifications into Supabase.
- `uv run pytest`: **11 passed (100%) in 10.91s**.
- `npx tsc --noEmit`: 0 TypeScript errors.

### 2026-08-14 — Phase 7: Mock Interview Preparation Engine & AI Assessment

**Task**: Implement mock interview question retrieval/generation engine, seeded questions dataset, Groq AI Llama 3.3 70B answer evaluator, API endpoints, unit tests, and interactive Next.js Mock Interview Command Center.

**Implementation**:
- **ORM & Database**: Built `app/models/interview.py` (`InterviewQuestion`, `InterviewAttempt`, `QuestionCategory`, `QuestionSource`), `app/models/__init__.py`, and `alembic/versions/0006_interview_tables.py` migration applied to Supabase PostgreSQL.
- **Seeded Questions**: Built `seed/interview_questions.py` seeding 11+ structured technical, behavioral, and role-specific interview questions with ideal evaluation grounding points.
- **Groq AI Extractor**: Built `app/ai/schemas/interview.py`, `app/ai/prompts/interview_prompts.py`, and `app/ai/extractors/interview.py` supporting resume project-driven question generation and answer evaluation against ideal criteria (score 0-100, key strengths, missed concepts, actionable feedback).
- **Service & API**: Built `app/repositories/interview.py`, `app/services/interview.py`, `app/schemas/interview.py`, and `app/api/interview.py` (`GET /api/interview/questions`, `POST /api/interview/attempts`, `GET /api/interview/history`). Mounted in `app/main.py`.
- **Unit Tests**: Built `tests/test_interview.py` verifying question balancing, answer evaluation, score calculation, attempt history tracking, and PostgreSQL sequence synchronization.
- **Frontend Command Center**: Built interactive Next.js UI in `frontend/src/app/(dashboard)/interview/page.tsx` featuring category badges, word-count response editor, real-time Groq AI evaluation modal (score gauge, green strengths, amber growth points, feedback text), and performance history tab.

**Files Changed**: `backend/app/models/interview.py`, `backend/app/models/__init__.py`, `backend/alembic/versions/0006_interview_tables.py`, `seed/interview_questions.py`, `backend/app/ai/schemas/interview.py`, `backend/app/ai/prompts/interview_prompts.py`, `backend/app/ai/extractors/interview.py`, `backend/app/repositories/interview.py`, `backend/app/services/interview.py`, `backend/app/schemas/interview.py`, `backend/app/api/interview.py`, `backend/app/main.py`, `backend/tests/test_interview.py`, `frontend/src/app/(dashboard)/interview/page.tsx`, `workdone.md`.

**Verification**:
- `uv run alembic upgrade head`: Applied `0006_interview` migration cleanly.
- `python seed/interview_questions.py`: Seeded 11 questions into Supabase.
- `uv run pytest`: **12 passed (100%) in 95.72s**.
- `npx tsc --noEmit`: 0 TypeScript errors.
