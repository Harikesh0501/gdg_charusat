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
- **2026-08-11**: "what if we use groq because i not have money" — Switched primary LLM provider from OpenAI (`gpt-4o-mini`) to Groq (`meta-llama/llama-4-scout-17b-16e-instruct` / Llama 4 Scout), utilizing Groq's 100% free API tier and FastEmbed for zero-cost embeddings.

## Architectural Decisions Changed During Development

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

**Remaining Issues**: None documentation-level. Implementation has not started — Phase 0 (`phases.md`) is the next work item. Career-role and skill seed-data content still needs to be authored (referenced throughout docs 03/05/09 as a required but not-yet-created artifact).

**Lessons for Future Agents**:
- This documentation set is intentionally opinionated and specific (exact table names, exact endpoint paths, exact scoring formulas) precisely so implementation doesn't require re-deriving design decisions. If you find yourself inventing a table name, endpoint path, or formula not in `docs/12` or the relevant domain doc, stop and check whether it already exists under a different name before adding a new one.
- The single highest-risk area flagged during planning is resume parsing quality/format variance ([04](docs/04_RESUME_PROCESSING_ARCHITECTURE.md)) and seed-content authoring time ([09](docs/09_PROJECT_RESOURCE_AND_CERTIFICATION_SYSTEM.md)) — both are called out explicitly in `phases.md` as needing buffer time. If either overruns, the documented fallback is to protect the P0 golden path and cut from Phase 7 (interview prep, P1) first.
- Do not begin implementation by reading only this file — it has no implementation content yet. Start at `AGENT.md`, then `phases.md` Phase 0.
