# 03 — Student Profile & Skill Intelligence

This is the data model everything else in the product reads from. Get this right and skill-gap, roadmap, and recommendations all follow naturally.

## Student Profile

`profiles` (1:1 with `users`):

| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | FK → users | unique |
| full_name | text | from onboarding |
| education_level | enum(`high_school`,`undergraduate`,`postgraduate`,`other`) | |
| institution | text nullable | |
| graduation_year | int nullable | |
| interests | text[] | free-tag list, student-entered during onboarding (e.g., "web dev", "data", "ML") — used as a recommendation signal, see [07](07_RECOMMENDATION_ENGINE_ARCHITECTURE.md) |
| bio | text nullable | optional, shown on dashboard |
| onboarding_completed | bool default false | gates routing, see [02](02_USER_ACCESS_AND_AUTHENTICATION_ARCHITECTURE.md) |
| created_at, updated_at | timestamptz | |

Education, experience, and projects extracted from a resume are **not** separate profile columns — they live in `resume_extractions.extracted_json` (raw AI output) and, where relevant to skill intelligence, are normalized into `student_skills` (skills) and a lightweight `profile_projects` table (see below) so the roadmap/recommendation engines don't need to re-parse JSON blobs.

`profile_projects` (student-attributed projects, from resume or manual entry):

| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| profile_id | FK | |
| title | text | |
| description | text nullable | |
| skill_ids | int[] | skills this project demonstrates (matched during extraction) |
| source | enum(`resume`,`manual`) | |
| created_at | timestamptz | |

## Skill Model

`skills` (the curated taxonomy — seed data, not user-editable at runtime):

```
Skill
├── id            serial PK
├── name          text (canonical display name, e.g. "PostgreSQL")
├── slug          text unique (e.g. "postgresql")
├── category      enum(programming_language, framework_library, database,
│                       cloud_devops, data_ml, tool, soft_skill, concept)
├── aliases       text[]   (e.g. ["postgres", "psql"] — used for fuzzy match
│                            during resume skill normalization)
├── parent_skill_id  int nullable FK → skills.id  (e.g. "React" parent "JavaScript" — optional, used for related-skill inference, not for gap math)
├── difficulty    int 1-5  (intrinsic learning difficulty, used by roadmap sequencing)
└── description   text nullable (used as AI context / embedding source)
```

Seed target: ~150-250 skills across the categories above, weighted toward what the seeded career roles (see [05](05_SKILL_GAP_AND_CAREER_MATCHING_ENGINE.md)) actually require, plus enough breadth that resume extraction has a reasonable chance of matching what real resumes contain.

**Prerequisites and related skills**: modeled via `parent_skill_id` (single-parent, e.g., framework → language) plus an explicit `skill_prerequisites` join table for many-to-many cases (e.g., "Docker" prerequisite-of "Kubernetes"):

```
skill_prerequisites
├── skill_id            FK → skills.id   (the skill that has a prerequisite)
└── prerequisite_skill_id FK → skills.id
```

This is deliberately simple — a DAG via a join table, not a generalized graph engine. It's enough for roadmap phase ordering (see [08](08_LEARNING_ROADMAP_ARCHITECTURE.md)).

## Student Proficiency Representation

`student_skills` (one row per student per skill they have *any* evidence for):

| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| profile_id | FK | |
| skill_id | FK → skills.id | unique(profile_id, skill_id) |
| proficiency | int 0-4 | see scale below |
| source | enum(`resume`,`self_reported`,`inferred`,`assessment`) | how we came to know this |
| confidence | float 0.0-1.0 | see below |
| evidence | text nullable | short excerpt/reference (e.g., "Mentioned in 'E-commerce API' project") |
| updated_at | timestamptz | |

**Proficiency scale (0-4)**:

| Value | Label | Meaning |
|---|---|---|
| 0 | None | Not present — implicit (no row) rather than stored, in practice; kept in the enum for explicit "student marked as not knowing" cases |
| 1 | Aware | Mentioned/exposed, no evidence of applied use |
| 2 | Beginner | Used in a coursework/tutorial context |
| 3 | Intermediate | Used in a real/substantial project |
| 4 | Advanced | Used across multiple projects, or explicitly claimed as a strength with corroborating evidence |

We deliberately **do not** claim this is an objective skill assessment. It is a best-effort estimate from self-report and resume evidence. `confidence` exists precisely to represent that uncertainty:

- `source = resume`: confidence set by the resume extraction step based on how explicit the evidence was (e.g., "5 years of X" → higher confidence than a bare skill-list mention). See [04](04_RESUME_PROCESSING_ARCHITECTURE.md).
- `source = self_reported`: confidence fixed at a moderate value (e.g., 0.7) — the student says so, but it's unverified.
- `source = inferred`: confidence lower (e.g., 0.4) — derived indirectly (e.g., "React" implies some "JavaScript" exposure even if not separately listed). Used sparingly; not a P0 feature (P1/P2).
- `source = assessment`: reserved for a future quiz/assessment feature (P2, not built in MVP) — would carry high confidence.

Downstream consumers (skill-gap engine, roadmap) use `proficiency` as the primary signal and may use `confidence` to decide whether to prompt the student to confirm a low-confidence skill (P1 UX nicety, not required for P0 correctness).

**Manual edit path**: the student can always add, remove, or adjust any `student_skills` row via `PUT /api/profile/skills` (see [12](12_DATA_BACKEND_AND_API_ARCHITECTURE.md)); a manual edit sets `source = self_reported`, `confidence = 1.0` (explicit user assertion overrides prior inference/extraction for that skill).

## Skill Categories

Enum on `skills.category`, fixed set (see model above). Used for grouping in the UI (skill profile view grouped by category) and lightly in scoring (e.g., not over-recommending within one category — P2 refinement, not required for P0).

## Career Roles & Role-Required Skills

See [05](05_SKILL_GAP_AND_CAREER_MATCHING_ENGINE.md) for the full matching engine; the data model lives here because it's part of skill intelligence:

```
career_roles
├── id, slug, name, description, category

career_role_skills
├── career_role_id  FK
├── skill_id        FK
├── required_proficiency  int 0-4
└── importance      enum(core, important, nice_to_have)
```

Seed target: 6 roles for MVP breadth without diluting seed-data effort — **Frontend Engineer, Backend Engineer, Full-Stack Engineer, Data Analyst, Data Scientist / ML Engineer, DevOps / Cloud Engineer**. Each role has ~10-20 required skills spanning `core` (must-have) to `nice_to_have`, so gap analysis has real texture (see [05](05_SKILL_GAP_AND_CAREER_MATCHING_ENGINE.md) for how `importance` feeds priority).

## What Skill Intelligence Explicitly Does Not Do (MVP)

- No graph-based skill-relationship inference engine (P3 — "large knowledge graphs" explicitly out of scope, `AGENT.md` §16).
- No continuous re-scoring from external signals (GitHub activity, LinkedIn) — resume + self-report only.
- No per-skill assessment/quiz to verify proficiency (P2).
