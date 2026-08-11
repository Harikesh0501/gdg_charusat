# AGENT.md — SkillForge AI Engineering Constitution

This file is the entry point for every AI coding agent (and human) working on this repository. Read it in full before touching any code. It is not optional context — it is the contract that keeps a fast-moving hackathon build from collapsing into contradictory architecture.

Read order before writing any code:
1. `AGENT.md` (this file)
2. `PRD.md`
3. The relevant file(s) in `docs/01…14`
4. `phases.md` — find the current phase
5. `design.md` — if touching UI
6. `reference.md` — if you need an external doc link
7. `workdone.md` — check for prior mistakes/rejections on this exact area
8. The actual code in the repo (never assume — verify)

---

## 1. Project Identity

**SkillForge AI** is a personalized learning and career mentor for students. It analyzes a student's resume, skills, and interests, compares them against a chosen career role, and produces a personalized learning roadmap, recommendations, and interview preparation — backed by a career-readiness dashboard.

It is **not** a chatbot. The LLM personalizes and explains; it does not own the business logic. See [06_AI_PERSONALIZATION_ARCHITECTURE.md](docs/06_AI_PERSONALIZATION_ARCHITECTURE.md).

## 2. Current Objective

Ship a **working, publicly deployed hackathon MVP** that reliably demonstrates the golden demo path (see `PRD.md` §Demo Requirements) end-to-end, with visible AI-driven personalization that differs meaningfully between students with different skills/goals.

## 3. Critical Deadline

**Submission: August 15, 2026.** Today's reference date at the time this document was authored: August 11, 2026. Treat every scope decision as if there are ~3 effective engineering days left. When in doubt, cut scope, not quality of the P0 path.

## 4. Approved Architecture (Summary)

Modular monolith. Full rationale and alternatives live in [01_PROJECT_OVERVIEW_AND_SYSTEM_REQUIREMENTS.md](docs/01_PROJECT_OVERVIEW_AND_SYSTEM_REQUIREMENTS.md).

```
Next.js (Vercel)  ──REST/JSON──▶  FastAPI (Render)  ──▶  PostgreSQL + pgvector (Supabase)
      │                                 │                       │
      ▼                                 ▼                       ▼
   Clerk (auth)                  AI Provider Abstraction   Supabase Storage (resumes)
                                  (OpenAI: LLM + embeddings)
```

- One frontend app, one backend app, one database. No microservices, no message queue, no separate worker fleet.
- Backend is internally modular (routers → services → repositories, one module per domain area), so domains stay separable without needing separate deployables.
- Resume processing runs as an in-process background task (FastAPI `BackgroundTasks`), not a queue. See [04_RESUME_PROCESSING_ARCHITECTURE.md](docs/04_RESUME_PROCESSING_ARCHITECTURE.md).

## 5. Approved Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend framework | Next.js (App Router) + TypeScript | Vercel deploy |
| UI | Tailwind CSS + shadcn/ui | No competing component libraries |
| Charts | Recharts | Skill radar, gap bars, progress rings |
| Backend framework | FastAPI (Python) | Pydantic v2, async endpoints |
| ORM / migrations | SQLAlchemy 2.0 + Alembic | Every schema change is a migration |
| Database | PostgreSQL (Supabase) + `pgvector` extension | Single DB, no sharding |
| Object storage | Supabase Storage | Resume files only |
| Auth | Supabase Auth | Frontend `@supabase/ssr` + JWT verification in FastAPI via Supabase JWT secret |
| AI — LLM | Groq (`meta-llama/llama-4-scout-17b-16e-instruct`), structured JSON outputs | Llama 4 Scout, 100% free tier API behind `LLMProvider` interface |
| AI — Embeddings | NVIDIA Nemotron 3 Embed 1B (OpenRouter free) / FastEmbed | Free embedding model for resource semantic matching (P1) |
| Backend deploy | Render (Docker web service) | Railway/Fly are documented fallbacks, not both |
| Frontend deploy | Vercel | |

Full rationale and reversal criteria: [14_TECHNOLOGY_STACK_AND_FUTURE_ROADMAP.md](docs/14_TECHNOLOGY_STACK_AND_FUTURE_ROADMAP.md).

**Do not add a new technology, database, queue, or AI provider without recording it as a new ADR-style decision in the relevant `docs/` file and updating this table.**

## 6. Repository Structure

```
/
├── AGENT.md, PRD.md, phases.md, design.md, reference.md, workdone.md
├── docs/                     # architecture decision docs, 01–14
├── .agent/skills/            # operational playbooks for coding agents
├── frontend/                 # Next.js app
│   └── src/{app,components,lib,hooks,types}/
├── backend/                  # FastAPI app
│   └── app/
│       ├── api/               # routers (one file per domain)
│       ├── services/          # business logic (one module per domain)
│       ├── repositories/      # DB access
│       ├── models/            # SQLAlchemy models
│       ├── schemas/            # Pydantic request/response schemas
│       ├── ai/
│       │   ├── providers/      # LLMProvider / EmbeddingProvider implementations
│       │   ├── prompts/        # one subfolder per AI use case
│       │   └── schemas/        # structured-output Pydantic schemas
│       ├── alembic/            # migrations
│       └── core/               # config, auth middleware, db session
└── seed/                     # skills/career-roles/resources/questions seed data
```

Domain modules (mirrored across `api/`, `services/`, `repositories/`): `auth`, `profile`, `resume`, `skills`, `career`, `roadmap`, `recommendations`, `interview`, `progress`.

## 7. Engineering Principles

- Prefer the simplest solution that satisfies the requirement. This is a 3-day build.
- Do not introduce microservices, message queues, or a second database without explicit user approval — see §12.
- Do not let the LLM replace deterministic business logic (skill-gap math, ranking, prerequisite ordering, progress calculation). LLM outputs personalize and explain; they never compute scores.
- Do not modify the approved architecture casually — see §12 before any structural change.
- Reuse existing components, services, and schemas before writing new ones. Search first.
- Validate every AI output against its Pydantic schema before it touches business state (see [06](docs/06_AI_PERSONALIZATION_ARCHITECTURE.md)).
- Never silently change database semantics (column meaning, enum values, cardinality) — that requires a migration and a docs update.
- Do not invent API endpoints that aren't in [12_DATA_BACKEND_AND_API_ARCHITECTURE.md](docs/12_DATA_BACKEND_AND_API_ARCHITECTURE.md) without adding them there first.
- Do not create a second abstraction for something that already has one (e.g., a second HTTP client, a second prompt-building pattern).
- Keep changes scoped to the phase/feature being worked on. Don't drive-by refactor unrelated code.

## 8. AI Rules

- AI is used for exactly five things: resume extraction, roadmap narrative/personalization, recommendation explanations, interview question generation, interview answer evaluation. Full list and schemas: [06](docs/06_AI_PERSONALIZATION_ARCHITECTURE.md).
- Every AI call uses a structured output schema (Pydantic) and is validated before persistence. No free-form text is written directly into business-critical fields (skill proficiency, gap scores, ranking).
- Every AI call has a deterministic fallback path if the call fails or fails validation twice (see [06](docs/06_AI_PERSONALIZATION_ARCHITECTURE.md) §Failure Fallback). The product must never hard-fail because the LLM is down.
- Never interpolate raw resume text or user input directly as system/instruction text — treat all user-sourced content as untrusted data inside a clearly delimited context block. See [06](docs/06_AI_PERSONALIZATION_ARCHITECTURE.md) §Prompt Injection.
- Never put an AI provider API key in frontend code or a `NEXT_PUBLIC_*` env var. AI calls happen only in the backend.
- Do not swap the AI provider or model without updating `ai/providers/` behind the existing interface — callers must not need to change.

## 9. Database Rules

- Every schema change goes through an Alembic migration. No manual `ALTER TABLE`, no editing the DB directly in Supabase Studio for anything that needs to persist across environments.
- Entities, relationships, and cardinalities are defined in [12_DATA_BACKEND_AND_API_ARCHITECTURE.md](docs/12_DATA_BACKEND_AND_API_ARCHITECTURE.md). Do not add a table that duplicates an existing source of truth (e.g., do not re-store computed skill gaps as the primary record — they're computed on demand; snapshots are explicitly for history only).
- Seed data (skills, career roles, resources, projects, certifications, interview questions) lives in `seed/` and is idempotent to re-run.

## 10. API Rules

- Every endpoint validates input via a Pydantic request schema and returns a Pydantic response schema — see conventions in [12](docs/12_DATA_BACKEND_AND_API_ARCHITECTURE.md).
- Every endpoint that touches student data requires a verified Clerk JWT; the backend derives `user_id`/`profile_id` from the token, never from a client-supplied field.
- Errors return a consistent envelope (`{"error": {"code", "message"}}`) with correct HTTP status codes — no bare 500s for expected failure modes (validation, not-found, AI failure).
- APIs are domain-level operations (`POST /resume/upload`, `POST /roadmap/generate`), not generic CRUD over every table.

## 11. Frontend Rules

- Every data-fetching screen implements all four UX states: loading (skeleton), error, empty, success. See [design.md](design.md).
- Use shadcn/ui primitives before writing a custom component. Use Tailwind utility classes; no new CSS framework.
- Auth state and route protection go through Clerk's Next.js middleware — do not hand-roll session handling.
- Charts use Recharts exclusively.

## 12. Before Changing Architecture

An agent must not change the architecture (new service, new datastore, new auth provider, new AI provider, new deployment target, queue, background worker system) without going through this sequence:

1. Inspect existing documentation (`docs/`, `AGENT.md`) for the current decision and its **Reversal criteria**.
2. Inspect the current implementation to confirm the conflict is real (not a misunderstanding).
3. Identify the specific conflict or limitation forcing the change.
4. Write the change up as a decision update in the relevant `docs/NN_*.md` file, following the same Decision/Context/Alternatives/Rationale/Consequences/Constraints format already used there.
5. Record the change in `workdone.md` under "Architectural Decisions Changed During Development," including the old and new decision.
6. Only then implement.

If a change is small and clearly within an existing decision's stated flexibility (e.g., adding a new seeded career role, adding a new resource), it is **not** an architecture change and does not need this process.

## 13. Testing Rules

Full detail: [.agent/skills/testing-and-verification/SKILL.md](.agent/skills/testing-and-verification/SKILL.md). Summary: every P0 golden-path step needs at least a smoke-level check (API test or manual verification recorded in `workdone.md`). Deterministic engines (skill-gap, ranking, roadmap ordering) need real unit tests because they are the product's credibility. AI-dependent flows need a fallback test (what happens when the AI call fails).

## 14. Documentation Rules

After any meaningful implementation work:

1. Update `workdone.md` with what was built, what broke, what the user said, and what future agents should know — using the structured entry format defined there. This is mandatory, not optional.
2. If an architectural decision changed, update the relevant `docs/NN_*.md` file (don't leave it only in `workdone.md`).
3. If scope changed (a feature moved between P0/P1/P2/P3, a phase was skipped or reordered), update `phases.md` and `PRD.md`'s priority matrix so they agree.
4. Never let two documents disagree about the tech stack, schema, or scope. If you notice a contradiction, fix it immediately as part of your change, not later.

## 15. Definition of Done

A feature is **not done** because it compiles or renders. Done means:

- [ ] Implemented per the relevant `docs/` spec (or the spec was updated first if it needed to change)
- [ ] Integrated end-to-end (frontend calls real backend endpoint, backend persists to real schema — no hardcoded mock data left behind on a "done" feature)
- [ ] Input validated, errors handled with the standard error envelope
- [ ] AI outputs (if any) validated against their schema with a working fallback
- [ ] Frontend covers loading/error/empty/success states
- [ ] Tests exist where practical per §13
- [ ] `workdone.md` updated
- [ ] Manually verified against the acceptance criteria in `phases.md`/`PRD.md` for that feature

## 16. Explicitly Out of Scope for This Hackathon

Microservices, Kubernetes, message brokers/queues, multi-agent autonomous systems, enterprise RBAC, social/collaboration features, mobile apps, gamification beyond a simple streak/readiness score, large knowledge graphs, notification infrastructure, multi-region deployment, custom observability platforms. Full list and rationale: `PRD.md` §Out of Scope and [13](docs/13_INFRASTRUCTURE_SECURITY_AND_DEPLOYMENT.md).

## 17. Golden Rule

> Simple + Working + Personalized + Deployable beats Complex + Theoretically Scalable + Unfinished.

When any two of these documents disagree, treat it as a bug and fix the inconsistency before writing more code.
