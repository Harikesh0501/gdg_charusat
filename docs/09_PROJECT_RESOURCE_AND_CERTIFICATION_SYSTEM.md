# 09 — Project, Resource & Certification System

This is the content backbone the recommendation engine ([07](07_RECOMMENDATION_ENGINE_ARCHITECTURE.md)) and roadmap engine ([08](08_LEARNING_ROADMAP_ARCHITECTURE.md)) depend on. Its quality directly determines demo quality — a thin or mistagged seed set makes personalization invisible even if the engines are correct.

## Data Model

```
resources
├── id, title, url, provider (e.g. "freeCodeCamp", "Coursera", "MDN"), type enum(course, article, video, doc)
├── description        text (also the embedding source, P1)
├── difficulty          int 1-5
├── estimated_hours     int
└── embedding            vector(1536) nullable   (pgvector, populated P1)

projects
├── id, title, description, difficulty, estimated_hours
└── career_relevance     text[]   (role slugs this project is especially relevant to, informational)

certifications
├── id, title, provider, url, level enum(entry, associate, professional)

resource_skills / project_skills / certification_skills   (join tables)
├── {resource_id|project_id|certification_id}, skill_id
```

Every item in `resources`/`projects`/`certifications` **must** have at least one row in its corresponding `_skills` join table — enforced by seed-time validation (a seed script check, not a DB constraint, to keep migrations simple), because untagged items are structurally invisible to the recommendation engine (see [07](07_RECOMMENDATION_ENGINE_ARCHITECTURE.md) constraints).

## Source of Truth

Curated, hand-picked seed data in `seed/resources.py`, `seed/projects.py`, `seed/certifications.py` (or equivalent JSON), loaded by a one-time/idempotent seed script. **Not** scraped, not user-submitted, not AI-generated at runtime in MVP — this keeps URLs valid and content quality controlled under time pressure (an AI-hallucinated course URL would be a worse demo failure than a smaller curated set).

## Seeding Requirement (Coverage Target)

For the 6 seeded career roles ([03](03_STUDENT_PROFILE_AND_SKILL_INTELLIGENCE.md)) to produce visibly different, non-empty roadmaps and recommendations:

- Every `core`-importance skill across all 6 roles must have **at least 2 tagged resources and 1 tagged project**.
- Aim for ~80-150 total resources and ~30-50 projects across the full skill taxonomy, concentrated on the ~40-60 skills that actually appear in `career_role_skills` (breadth beyond that is low-value effort during the hackathon).
- Certifications are lower priority (P1 feature) — a smaller set (~20-30) covering the most common core skills per role is sufficient.

This is a concrete, checkable acceptance bar — before declaring recommendations/roadmap "done" for a phase, run the seed-coverage check described in `.agent/skills/testing-and-verification/SKILL.md`.

## Project Recommendation Logic (Restated From 07, Applied Here)

Projects are recommended the same way resources are (candidate retrieval + scoring in [07](07_RECOMMENDATION_ENGINE_ARCHITECTURE.md)), with one addition: a project scores higher when it covers **multiple** current gap skills at once (the `skill_coverage` signal), because that's the concrete value proposition of a project over a single-skill course:

```
Missing: SQL + FastAPI + ML Deployment
Recommended: "Build an ML Prediction API with FastAPI and PostgreSQL"
Why: Addresses 3 of your current gaps in one project — SQL (core), FastAPI (core),
     and deployment practices (important) — sized at ~15 hours.
```

The "Why" line is the AI explanation from [06](06_AI_PERSONALIZATION_ARCHITECTURE.md) use case 3, grounded in the deterministic `matched_gap_skills` list — never invented.

## Semantic Embedding (P1)

`resources.embedding` populated by a one-time seed-time embedding pass (`EmbeddingProvider.embed(description)`) rather than at request time — keeps recommendation requests fast (no embedding call per request; only the small synthetic query string is embedded on demand, see [07](07_RECOMMENDATION_ENGINE_ARCHITECTURE.md)). If a resource is added/edited after initial seeding, its embedding must be regenerated (`seed/embed_resources.py`, idempotent — re-run safe).

## Metadata Fields, Justified

- `difficulty` (1-5): used for the `difficulty_fit` scoring signal in [07](07_RECOMMENDATION_ENGINE_ARCHITECTURE.md) — without it, recommendations can't distinguish "too easy" from "too hard" for a given student.
- `estimated_hours`: shown in the UI and summed for roadmap phase totals ([08](08_LEARNING_ROADMAP_ARCHITECTURE.md)) — gives the student a concrete time-commitment signal, a usability requirement, not decoration.
- `career_relevance` on projects: informational tag surfaced in the UI ("Especially relevant for: Backend Engineer"); not used in scoring math (scoring already uses skill-tag matching against the *student's actual* target role, which is more precise than a project-level static tag).

## Constraints for Future Agents

- Do not add a resource/project/certification without tagging it in the corresponding `_skills` join table in the same change.
- Do not fetch or generate resource metadata via LLM at request time — seed data is curated ahead of time; if the team wants to *use* AI to help draft the seed set (e.g., "suggest 10 SQL resources"), that's an offline authoring aid, not a runtime code path, and any URLs it suggests must be manually verified before being committed to `seed/`.
- Do not remove the join-table constraint check from the seed script "to save time" — an untagged item silently breaking recommendations is a very hard bug to notice during a demo.
