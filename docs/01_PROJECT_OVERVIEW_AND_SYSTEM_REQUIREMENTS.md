# 01 — Project Overview & System Requirements

## System Purpose

SkillForge AI converts a student's resume and stated career goal into a structured, personalized plan for closing the gap to that goal: an ordered roadmap, ranked learning resources and projects, interview practice, and a readiness dashboard. It exists because generic "roadmap" content ignores what a specific student already knows.

## Product Vision

See `PRD.md` §2. This document covers the *system* — its boundaries, requirements, and architecture — not the product narrative.

## Problem / Solution Recap

Problem: students get generic recommendations instead of adaptive, evidence-based guidance. Solution: combine a structured skill/career data model (deterministic) with AI interpretation and personalization (LLM) so recommendations are both grounded and adaptive. See [06](06_AI_PERSONALIZATION_ARCHITECTURE.md) for exactly where the line between the two sits.

## Actors

- **Student** — primary user. Authenticated via Supabase Auth. Owns one profile.
- **Career Mentor (Backend System)** — core business logic engine. Evaluates skills, generates roadmaps, computes recommendations, evaluates interview answers.
- **AI Provider (Groq)** — external LLM service (`meta-llama/llama-4-scout-17b-16e-instruct`), called only from the backend, never trusted for business-critical numeric output.
- **Admin/seed process** — not a runtime actor; a one-time/occasional script (`seed/`) that populates skills, career roles, resources, projects, certifications, and interview questions. There is no admin UI in the MVP.

## System Boundaries

In scope: everything under the golden path in `PRD.md` §11.1, plus the P1 items in the priority matrix if time allows.

Out of scope (system boundary, not just feature scope): payment processing, third-party job-board integration, real course delivery/video hosting, resume *generation* (only ingestion), multi-tenant organization accounts, mobile native apps.

## High-Level Architecture

```
Next.js (Vercel)  ──REST/JSON (JWT: Supabase)──▶  FastAPI (Render)  ──▶  PostgreSQL + pgvector (Supabase)
      │                                                │                       │
      ▼                                                ▼                       ▼
Supabase Auth                                     Groq Provider            Supabase Storage
                                             (Llama 4 Scout)               (resumes)
```

This is a **modular monolith**: one deployable frontend, one deployable backend, one database. Internal modularity (by domain) replaces the need for service separation. See [14](14_TECHNOLOGY_STACK_AND_FUTURE_ROADMAP.md) for when this would need to change (it should not, during the hackathon).

## Functional Requirements

See `PRD.md` §14 (FR1–FR11) — this document does not duplicate them, it is the architectural response to them.

## Non-Functional Requirements

See `PRD.md` §15 (NFR1–NFR6).

## MVP Scope

See `PRD.md` §12–13. Restated as a system checklist:

- [ ] Auth working end-to-end (Supabase Auth ↔ Next.js ↔ FastAPI JWT verification)
- [ ] Resume upload → storage → AI extraction → structured `student_skills`
- [ ] Career role catalog seeded, selectable
- [ ] Deterministic skill-gap engine
- [ ] Roadmap generation (deterministic structure + AI personalization layer)
- [ ] Recommendation engine (deterministic scoring + AI explanation)
- [ ] Progress tracking + readiness score
- [ ] Deployed to a public URL

## Core Workflows

1. **Onboarding & Resume Ingestion** — see [04](04_RESUME_PROCESSING_ARCHITECTURE.md)
2. **Skill Intelligence** — see [03](03_STUDENT_PROFILE_AND_SKILL_INTELLIGENCE.md)
3. **Skill Gap & Career Matching** — see [05](05_SKILL_GAP_AND_CAREER_MATCHING_ENGINE.md)
4. **Roadmap Generation** — see [08](08_LEARNING_ROADMAP_ARCHITECTURE.md)
5. **Recommendations** — see [07](07_RECOMMENDATION_ENGINE_ARCHITECTURE.md), [09](09_PROJECT_RESOURCE_AND_CERTIFICATION_SYSTEM.md)
6. **Interview Preparation** — see [10](10_INTERVIEW_PREPARATION_ARCHITECTURE.md)
7. **Progress & Analytics** — see [11](11_PROGRESS_AND_ANALYTICS_ARCHITECTURE.md)

## Major Modules (Backend)

`auth`, `profile`, `resume`, `skills`, `career` (roles + goals + gap engine), `roadmap`, `recommendations` (resources/projects/certs), `interview`, `progress`, and the cross-cutting `ai/` package used by several of the above.

## Constraints

- 3-day effective build window; every decision must pass the "can a small student team implement, test, deploy, and demo this before the deadline?" test (see `AGENT.md` §3, §17).
- Zero-cost AI provider choice (`meta-llama/llama-4-scout-17b-16e-instruct` on Groq free tier).
- No dedicated DevOps/infra person — deployment must be push-button (Vercel/Render/Supabase managed platforms only).

## Assumptions

- Judges will test with real or realistic resumes in PDF/DOCX, English language, 1-3 pages.
- Traffic during judging is low (tens of concurrent users at most) — no load-testing requirement.
- The team has API keys for Groq and Supabase available before Phase 0 completes (see `phases.md`).

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Resume parsing fails on an unusual format | Golden path blocked | Manual skill self-report fallback (FR4, PRD §11.2) |
| AI provider latency/outage during judging | Personalization steps hang or fail | Deterministic fallback content + timeout + retry-once (see [06](06_AI_PERSONALIZATION_ARCHITECTURE.md)) |
| Seed data too thin to show personalization | Judging criteria "personalization" not demonstrated | Seed enough resources/projects per skill (see [09](09_PROJECT_RESOURCE_AND_CERTIFICATION_SYSTEM.md)) across ≥2 clearly different career paths before demo |
| Deployment misconfiguration late in the build | No public URL at submission | Deploy early (Phase 0/10 dry run), not only at the end — see `phases.md` Phase 10 |
| Scope creep into P2/P3 | P0 incomplete at deadline | Priority matrix in `PRD.md` is binding; `AGENT.md` §16 lists explicit non-goals |

## Success Criteria

Matches `PRD.md` §23 Acceptance Criteria verbatim — this document does not restate them to avoid drift; update both together if they change.

## Hackathon Acceptance Criteria (Judging Alignment)

- **Recommendation quality** → [07](07_RECOMMENDATION_ENGINE_ARCHITECTURE.md) scoring signals + explanation quality.
- **Usability** → `design.md` UX states, golden-path screen count.
- **AI integration** → [06](06_AI_PERSONALIZATION_ARCHITECTURE.md) five AI use cases, structured outputs, visible in UI.
- **Personalization** → `PRD.md` §17, demonstrated via two-different-students test in Acceptance Criteria #2.
- **Overall UX** → `design.md`, golden demo path timing (3–5 minutes).
