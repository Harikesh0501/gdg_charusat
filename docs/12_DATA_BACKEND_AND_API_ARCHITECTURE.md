# 12 — Data, Backend & API Architecture

This is the implementation-level reference. When in doubt about a table, endpoint, or module boundary, this document (not memory, not inference from other docs) is authoritative — other docs describe *why*; this one describes *what exists*.

## Backend Module Structure

```
backend/app/
├── api/            # FastAPI routers — one file per domain, thin: parse request, call service, return response
│   ├── auth.py, profile.py, resume.py, skills.py, career.py,
│   │   roadmap.py, recommendations.py, interview.py, progress.py
├── services/       # business logic — one module per domain, framework-agnostic where possible
│   ├── resume.py, skill_gap.py, roadmap.py, recommendations.py,
│   │   interview.py, progress.py
├── repositories/    # DB access — one module per aggregate root, no business logic here
├── models/            # SQLAlchemy models, one file per table group
├── schemas/            # Pydantic request/response models, mirrors api/ structure
├── ai/
│   ├── providers/       # base.py (interfaces) + groq_provider.py
│   ├── prompts/          # resume_extraction/, roadmap/, recommendation_explanation/, interview/
│   ├── schemas/           # structured-output Pydantic models (06)
│   └── orchestrator.py     # shared generate-validate-retry-fallback helper
├── core/
│   ├── config.py            # env var loading (pydantic-settings)
│   ├── auth.py                # Supabase JWT verification dependency
│   ├── db.py                   # SQLAlchemy session/engine
│   └── errors.py                # standard error envelope + exception handlers
└── alembic/                       # migrations
```

**Layering rule**: `api/` calls `services/`, `services/` calls `repositories/` and `ai/`, `repositories/` calls `models/`. No layer is skipped (a router never queries the DB directly; a service never imports FastAPI request/response types).

## Database Schema (Authoritative)

```
users
  id uuid PK, supabase_user_id text unique, email text, created_at

profiles
  id uuid PK, user_id FK→users unique, full_name text, education_level enum,
  institution text?, graduation_year int?, interests text[], bio text?,
  onboarding_completed bool default false, created_at, updated_at

profile_projects
  id uuid PK, profile_id FK, title text, description text?, skill_ids int[],
  source enum(resume,manual), created_at

skills
  id serial PK, name text, slug text unique, category enum, aliases text[],
  parent_skill_id int? FK→skills, difficulty int(1-5), description text?

skill_prerequisites
  skill_id int FK→skills, prerequisite_skill_id int FK→skills   (composite PK)

student_skills
  id uuid PK, profile_id FK, skill_id int FK→skills, proficiency int(0-4),
  source enum(resume,self_reported,inferred,assessment), confidence float,
  evidence text?, updated_at            UNIQUE(profile_id, skill_id)

career_roles
  id serial PK, slug text unique, name text, description text, category text

career_role_skills
  career_role_id FK, skill_id FK, required_proficiency int(0-4),
  importance enum(core,important,nice_to_have)      (composite PK)

career_goals
  id uuid PK, profile_id FK, career_role_id FK, target_date date?,
  is_active bool, created_at

resumes
  id uuid PK, profile_id FK, file_url text, file_name text, file_size int,
  mime_type text, status enum(uploaded,processing,processed,failed),
  is_active bool, uploaded_at, processed_at?

resume_extractions
  id uuid PK, resume_id FK, raw_text text, extracted_json jsonb,
  model_used text, confidence float, created_at

resources
  id serial PK, title text, url text, provider text, type enum(course,article,video,doc),
  description text, difficulty int(1-5), estimated_hours int, embedding vector(1536)?

projects
  id serial PK, title text, description text, difficulty int(1-5),
  estimated_hours int, career_relevance text[]

certifications
  id serial PK, title text, provider text, url text, level enum(entry,associate,professional)

resource_skills / project_skills / certification_skills
  {resource_id|project_id|certification_id} FK, skill_id FK    (composite PK, each)

recommendations
  id uuid PK, profile_id FK, category enum(resource,project,certification),
  item_id int, score float, explanation text, generated_at

roadmaps
  id uuid PK, profile_id FK, career_role_id FK, status enum(active,completed,archived),
  generated_at, model_used text?

roadmap_phases
  id uuid PK, roadmap_id FK, order_index int, title text, summary text

roadmap_items
  id uuid PK, phase_id FK, type enum(skill,resource,project,milestone),
  ref_skill_id int? FK, ref_resource_id int? FK, ref_project_id int? FK,
  title text, order_index int, status enum(not_started,in_progress,completed)

learning_progress
  id uuid PK, profile_id FK, event_type enum(roadmap_item_completed,skill_updated,
  project_completed,interview_attempt), ref_id uuid, ref_type text, metadata jsonb,
  created_at

skill_gap_snapshots  [P1]
  id uuid PK, profile_id FK, career_role_id FK, computed_at, gaps_json jsonb

interview_questions  [P1]
  id uuid PK, career_role_id FK?, skill_id FK?, category enum(technical,behavioral,
  project_specific,role_specific), difficulty int(1-5), question_text text,
  ideal_answer_points text[], source enum(seed,ai_generated)

interview_attempts  [P1]
  id uuid PK, profile_id FK, question_id FK, answer_text text, score int(0-100),
  strengths text[], weaknesses text[], feedback text, created_at
```

### Key Relationships & Cardinalities

- `users` 1—1 `profiles`
- `profiles` 1—N `student_skills`, `profile_projects`, `resumes`, `career_goals`, `roadmaps`, `learning_progress`, `interview_attempts`
- `skills` N—N `career_roles` via `career_role_skills`; N—N `resources`/`projects`/`certifications` via the `_skills` join tables; self-referential N—N via `skill_prerequisites`
- `profiles` — exactly one `career_goals` row with `is_active=true` at a time (enforced in service layer, not a DB constraint, to keep migrations simple)
- `roadmaps` 1—N `roadmap_phases` 1—N `roadmap_items`

### Indexes (Minimum Required)

`student_skills(profile_id)`, `student_skills(profile_id, skill_id)` unique, `career_role_skills(career_role_id)`, `resource_skills/project_skills/certification_skills(skill_id)` (reverse lookup for candidate retrieval), `learning_progress(profile_id, created_at)`, `roadmap_items(phase_id)`, and a `pgvector` IVFFlat or HNSW index on `resources.embedding` once P1 semantic search is implemented (not needed at seed-data scale for MVP — a full scan over ~150 rows is fine; add the index when it's implemented, not preemptively).

## Vector Fields

Only `resources.embedding` (P1). No `skill_embeddings` or `project_embeddings` tables in MVP — not enough distinct value over structured tagging at this content scale to justify the seeding/maintenance cost (see [07](07_RECOMMENDATION_ENGINE_ARCHITECTURE.md) reversal criteria).

## Migrations

Alembic, one migration per schema change, auto-generated from SQLAlchemy models then hand-reviewed (never hand-edit a generated migration's `upgrade()` without also fixing `downgrade()`). Migration naming: `NNNN_short_description.py`. Run via `alembic upgrade head` in deploy pipeline (see [13](13_INFRASTRUCTURE_SECURITY_AND_DEPLOYMENT.md)).

## API Conventions

- Base path: `/api`.
- Auth: `Authorization: Bearer <supabase_jwt>` required on all routes except `GET /api/health`, `GET /api/career-roles`, `GET /api/skills`.
- Request/response bodies: JSON, validated by Pydantic schemas named `<Domain><Action>Request` / `<Domain><Action>Response`.
- Pagination: simple `limit`/`offset` query params on any list endpoint that could exceed ~50 items (`GET /api/skills`, `GET /api/recommendations`); response includes `{"items": [...], "total": int}`. Most MVP list endpoints are small enough that pagination is present but rarely exercised.
- Errors: `{"error": {"code": "string", "message": "string"}}`, standard HTTP status codes (400 validation, 401 auth, 404 not found, 409 conflict, 422 unprocessable AI-adjacent failure, 500 unexpected).
- Filtering: query params, e.g. `?career_role_id=`, `?category=`.

## API Endpoints

| Method | Path | Purpose | Auth |
|---|---|---|---|
| POST | `/api/auth/sync` | Upsert `users`/`profiles` after first Supabase login | Yes |
| GET | `/api/profile` | Fetch current student's profile | Yes |
| PUT | `/api/profile` | Update onboarding fields | Yes |
| POST | `/api/resume/upload` | Upload resume file, create `resumes` row, kick off background processing | Yes |
| GET | `/api/resume/latest` | Latest resume + status + extraction summary | Yes |
| GET | `/api/resume/{id}/status` | Poll processing status | Yes |
| GET | `/api/skills` | Public skill catalog (search/filter by category) | No |
| GET | `/api/profile/skills` | Student's `student_skills`, joined with skill info | Yes |
| PUT | `/api/profile/skills` | Add/edit/remove a `student_skills` row (manual entry) | Yes |
| GET | `/api/career-roles` | Public catalog of the 6 seeded roles | No |
| POST | `/api/career-goal` | Set active career goal (archives roadmap for prior goal) | Yes |
| GET | `/api/career-goal` | Current active goal | Yes |
| GET | `/api/skill-gap?career_role_id=` | Deterministic gap analysis (05) | Yes |
| POST | `/api/roadmap/generate` | Generate/regenerate roadmap for active goal (08) | Yes |
| GET | `/api/roadmap` | Active roadmap, phases + items | Yes |
| PATCH | `/api/roadmap/items/{id}` | Update item status (triggers progress feedback loop, 11) | Yes |
| GET | `/api/recommendations?category=` | Ranked, explained recommendations (07) | Yes |
| GET | `/api/interview/questions?career_role_id=` [P1] | Personalized question set (10) | Yes |
| POST | `/api/interview/attempts` [P1] | Submit answer, get AI evaluation (10) | Yes |
| GET | `/api/interview/attempts` [P1] | Attempt history | Yes |
| GET | `/api/progress` | Dashboard metrics (11) | Yes |
| GET | `/api/health` | Liveness check | No |

### Endpoint Detail Example (Pattern to Follow for Any New Endpoint)

```
POST /api/roadmap/generate
Auth: required
Request: {} (uses active career goal from server-side state; no body needed)
Response: RoadmapResponse { id, career_role, status, phases: [...], generated_at }
Errors:
  409 — no active career goal set (student must select one first)
  502 — AI narrative step failed after retry (roadmap still returned with
        templated summaries — see 06 fallback table; this is NOT an error
        response, included here only to clarify it never happens)
Validation: none beyond auth (no request body)
Side effects: archives prior active roadmap for this profile, if any
Database ops: INSERT roadmaps/roadmap_phases/roadmap_items, SELECT student_skills/
  career_role_skills/skill_prerequisites/resources/projects
AI operations: one call to RoadmapNarrative (06, use case 2), non-blocking for
  structure — falls back to templated text on failure
```

## Response Format Consistency

All list responses: `{"items": [...], "total": n}`. All single-resource responses: the resource object directly (no unnecessary envelope). All mutation responses: the updated resource. This consistency matters because the frontend's data-fetching hooks (`lib/api/*.ts`) are written once against this shape — deviating breaks that layer silently.

## Constraints for Future Agents

- Do not add a table not listed here without updating this document in the same change.
- Do not add a generic `/api/{table}` CRUD endpoint — every endpoint is a domain operation (see `AGENT.md` §10).
- Do not bypass the `services/` layer from a router "just this once" — it's what keeps `AGENT.md` §7's "don't let the LLM replace deterministic logic" enforceable in code review, since services are where that logic lives.
