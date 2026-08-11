# Work Done / Engineering Memory

This file is a persistent memory layer for AI coding agents working on SkillForge AI. It is not a changelog — changelogs describe *what* changed; this file preserves *why*, what was tried and rejected, what mistakes happened and why, and what the user explicitly said. A future agent should be able to read this file and avoid repeating a mistake or re-litigating a settled decision, without re-reading the entire conversation history that produced it.

## How to Use This File

- **Before starting work on any feature/phase**, skim this file for entries tagged with the relevant module/phase — check "Rejected Approaches" and "Engineering Rules Learned" first.
- **After any meaningful implementation work**, add a new dated entry under "Implementation History" using the structured format below. This is mandatory per `AGENT.md` §14 — not optional cleanup.
- If you reject an approach the user suggested, or the user rejects one of yours, record it under "Rejected Approaches" immediately, in the moment — don't wait until the end of a session.
- If the user says anything resembling "never do X again," record it verbatim (or close to it) under "User Preferences / Explicit Feedback" — treat this as a hard constraint for all future work, equivalent in weight to a rule in `AGENT.md`.
- If an architectural decision documented in `docs/` changes during implementation, record both the old and new decision under "Architectural Decisions Changed During Development" **and** update the relevant `docs/NN_*.md` file itself — this file is the memory of the change, `docs/` is the current truth.

## Engineering Rules Learned During Implementation

*(Empty at project start — this section fills in as implementation proceeds. Do not delete this heading; add bullet entries under it as lessons are learned, each with enough context that a future agent understands why the rule exists, not just what it is.)*

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
