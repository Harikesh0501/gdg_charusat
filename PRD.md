# PRD — SkillForge AI

Status: Approved for hackathon MVP build. Owning doc for scope; `phases.md` sequences it, `docs/` explains how.

## 1. Product Name

**SkillForge AI** — Personalized Learning & Career Mentor

## 2. Product Vision

An AI-powered personal learning and career operating system for students: it turns a resume and a career goal into a concrete, personalized plan — what to learn, in what order, from what resources, which projects to build, and how to prepare for interviews — and shows the student their career readiness as it improves.

## 3. Problem Statement

Students struggle to translate "I want to become a [role]" into a concrete action plan. Generic course catalogs and static roadmaps ("just learn these 10 things") ignore what the student already knows, so recommendations feel irrelevant, redundant, or overwhelming. There is no single place that connects resume → skills → gaps → plan → practice → readiness.

## 4. Target Users

Primary: undergraduate/graduate students (India-centric hackathon context, but not geo-restricted) preparing for tech placements or internships, roughly final-year or penultimate-year, with some coursework/projects but no clear plan for closing the gap to a specific job role.

Secondary (not designed for in this MVP, but not blocked): early-career switchers self-teaching into tech roles.

## 5. Personas

**Priya — Final-year CS student, generalist.** Knows Python, some web dev from coursework, no clear specialization. Overwhelmed by choice. Needs: "tell me what to focus on for the role I want, in order."

**Rahul — Self-taught frontend learner.** Has done scattered tutorials, built 2-3 small React projects, resume is thin and unstructured. Needs: credible structure and validation of what he already knows vs. what's missing, plus interview practice since he has no CS-degree pedigree to fall back on.

**Ananya — Data-curious student targeting Data Analyst roles.** Strong in Excel/stats coursework, weak in SQL and tooling. Needs: a roadmap that doesn't repeat what she already knows (stats) and instead prioritizes the practical gaps (SQL, dashboards).

## 6. User Pain Points

- Generic "become a X in 6 months" roadmaps that don't account for prior skills.
- No single source of truth connecting resume content to a learning plan.
- Resource overload: too many course/tutorial links, no prioritization tied to an actual gap.
- Interview prep is generic (LeetCode-style lists) and not tied to the student's actual projects/resume/target role.
- No visibility into "how close am I" — readiness is a vague feeling, not a number backed by evidence.

## 7. Product Goals

1. Turn a resume + career goal into a personalized, ordered roadmap in under a minute of processing time.
2. Make personalization visibly real — two students with different skills get different plans, and the product shows why.
3. Give students a believable, evidence-based readiness signal, not a vanity score.
4. Ship a reliably deployable, demoable product within the hackathon window.

## 8. Non-Goals (for this build)

- Being a full LMS (no in-app course content/video hosting).
- Being a social network for students.
- Being a general-purpose chatbot / open-ended AI assistant.
- Perfect resume parsing across every conceivable format — best-effort with a manual-edit fallback is acceptable.
- Multi-language support.

## 9. Core Value Proposition

"Upload your resume, tell us your target role, and get a personalized roadmap, project and resource recommendations, and interview practice — built from what you actually know, not a generic checklist."

## 10. Positioning

Not a course marketplace (Coursera/Udemy — content, no personalization to the individual's existing skills). Not a resume builder (Zety-style — output, not planning). Not a generic AI chatbot wrapper (ChatGPT-with-a-prompt — no structured skill model, no persistence, no deterministic gap logic). SkillForge's differentiator is combining a **structured skill/career data model** with **AI-driven personalization on top of it** — see [06_AI_PERSONALIZATION_ARCHITECTURE.md](docs/06_AI_PERSONALIZATION_ARCHITECTURE.md).

## 11. User Journeys

### 11.1 Golden Path (primary, demo-critical)

Landing → Sign up/in (Clerk) → Onboarding (name, education, interests) → Upload resume → AI extracts skills/education/projects → Student reviews/edits extracted skill profile → Student selects a target career role → System computes skill gaps deterministically → System generates a personalized roadmap (phases, ordered items, resources/projects) → Student views recommended resources/projects/certifications with personalized explanations → Student practices interview questions tailored to their gaps/role → Student sees a career-readiness dashboard.

### 11.2 Secondary journeys

- Returning student: sign in → dashboard shows current state → mark roadmap items complete → readiness score updates.
- Student changes target career role → gap analysis and roadmap regenerate for the new role, old roadmap archived.
- Student without a resume: can manually self-report skills instead of uploading (fallback so the demo never blocks on parsing failure).

## 12. MVP Definition

The MVP is the golden path in §11.1, fully working, deployed at a public URL, completable by a judge in 3–5 minutes, with visibly different output for different input profiles (see §22 Personalization Requirement).

## 13. Priority Matrix

```
P0 = must work for submission
P1 = important if time permits
P2 = future enhancement
P3 = explicitly do not build during hackathon
```

### P0 — Must work

- Auth (sign up/in/out) via Clerk
- Minimal onboarding (name, education level, interests)
- Resume upload (PDF/DOCX) + AI extraction into structured skills/education/projects
- Manual skill self-report/edit fallback (in case extraction is thin or resume is skipped)
- Career role selection (from a curated list of ~6 roles)
- Deterministic skill-gap analysis vs. selected role
- Personalized roadmap generation (phased, ordered, tied to actual gaps)
- Recommendations: resources + projects (curated, scored, filtered to gaps), each with an AI-personalized explanation
- Progress tracking: mark roadmap items complete, readiness score updates
- Career readiness dashboard (single view tying it together)
- Public deployment (Vercel + Render + Supabase) reachable without VPN/login friction beyond normal auth

### P1 — Should work if time permits

- Certification recommendations
- AI-generated interview questions personalized to role/skills/resume
- AI evaluation/feedback on submitted interview answers
- Analytics: skill trend, gap trend over time (`skill_gap_snapshots`)
- pgvector-based semantic resource matching (upgrade to the P0 deterministic filter/score)

### P2 — Nice to have, do not block P0/P1 for these

- Richer project portfolio (attach links/screenshots to completed projects)
- Richer analytics (streaks, time-to-readiness projection)
- Resource embedding refresh pipeline
- Multiple concurrent career goals with comparison view

### P3 — Explicitly do not build for this submission

Microservices/Kubernetes, message queues, multi-agent autonomous systems, enterprise RBAC, social/collaboration features, mobile apps, gamification beyond a simple readiness score, large knowledge graphs, notification infrastructure (email/push), multi-region deployment, custom observability stack, real-time collaboration, chatbot-style open-ended Q&A interface.

## 14. Functional Requirements

- FR1: Users can create an account and sign in/out (Clerk-managed).
- FR2: Users complete a short onboarding form persisted to `profiles`.
- FR3: Users can upload a PDF/DOCX resume (max 5MB); the system extracts text, then structured skills/education/projects/experience via AI, and stores results with confidence.
- FR4: Users can view and manually edit their extracted skill profile (add/remove/adjust proficiency).
- FR5: Users can select one active target career role from a curated list.
- FR6: The system computes a skill gap (missing/partial/mastered skills, prioritized) between the student's profile and the target role's required skills.
- FR7: The system generates a phased, ordered learning roadmap addressing the prioritized gaps, referencing real seeded resources/projects.
- FR8: The system recommends resources, projects, and (P1) certifications ranked by relevance to the student's gaps and interests, each with a personalized natural-language explanation.
- FR9: Users can mark roadmap items / recommended projects as complete; this updates progress and readiness.
- FR10: (P1) Users can practice AI-generated interview questions tailored to their role/skills and receive AI feedback on submitted answers.
- FR11: Users can view a dashboard summarizing skills mastered, gaps remaining, roadmap progress, and an overall readiness score.

## 15. Non-Functional Requirements

- NFR1 (Reliability): The golden path must not hard-fail if the AI provider errors or times out — deterministic fallbacks apply (see [06](docs/06_AI_PERSONALIZATION_ARCHITECTURE.md)).
- NFR2 (Performance): Resume processing completes in under ~20s for a typical 1-2 page resume; roadmap generation under ~15s. Both show a loading state, not a blank screen.
- NFR3 (Availability): Public URL must be reachable for the duration of judging; no requirement beyond that (no SLA, no autoscaling needed).
- NFR4 (Security): See §19.
- NFR5 (Maintainability): Code follows the module boundaries in `AGENT.md` §6 so a new agent can locate any feature in under a minute.
- NFR6 (Cost): AI usage stays within a free/low-cost tier appropriate for demo-scale traffic (dozens of users, not thousands).

## 16. AI Requirements

- Every AI-touched feature has: a defined structured output schema, validation before persistence, and a deterministic fallback. See [06_AI_PERSONALIZATION_ARCHITECTURE.md](docs/06_AI_PERSONALIZATION_ARCHITECTURE.md) for the full list of AI use cases and their schemas.
- AI never computes the skill gap, ranking, or readiness score directly — those are deterministic (see [05](docs/05_SKILL_GAP_AND_CAREER_MATCHING_ENGINE.md), [07](docs/07_RECOMMENDATION_ENGINE_ARCHITECTURE.md), [11](docs/11_PROGRESS_AND_ANALYTICS_ARCHITECTURE.md)).
- AI is used to: interpret unstructured resume text, write personalized explanations/narratives, generate interview questions, and evaluate free-text interview answers.

## 17. Personalization Requirements

This is judging-critical (see §22). Concretely:

- Two students with different `student_skills` and the same target role must receive different skill-gap results (different missing/partial skill sets) and a different roadmap (different phase ordering and item selection), because both are computed from the individual's actual skill state, not a role-level static template.
- Recommendation explanations must reference the specific student's gap/interest, not generic marketing copy (e.g., "Because you're missing SQL for the Data Analyst path and already know Python, this course bridges that gap in 6 hours" — not "This is a great SQL course!").
- The roadmap for the same role must visibly differ in starting point/ordering between a beginner and an advanced student (advanced student's roadmap skips or shortens phases for skills they already have).

## 18. UX Requirements

- Every screen in the golden path implements loading, error, empty, and success states (see `design.md`).
- The user is never shown a raw stack trace or an unexplained spinner with no timeout/feedback.
- Dashboard is the default landing screen after login and must communicate current state at a glance (readiness score, next roadmap step, top gap).
- Mobile-responsive is required for the core screens (not pixel-perfect, but usable) since judges may view on varied devices.

## 19. Security Requirements

- No AI provider keys or database credentials in frontend code or `NEXT_PUBLIC_*` vars.
- All student-data endpoints require a verified Clerk JWT; `profile_id` is derived server-side from the token, never trusted from the client.
- Uploaded resumes are validated for file type/size before storage; stored resume files are private (not publicly listable) in Supabase Storage.
- Resume text is treated as untrusted content when passed to the LLM — never merged into system/instruction text (prompt-injection mitigation, detailed in [06](docs/06_AI_PERSONALIZATION_ARCHITECTURE.md)).
- CORS restricted to the deployed frontend origin (+ localhost in dev).

## 20. Data Requirements

Full entity list and schema: [12_DATA_BACKEND_AND_API_ARCHITECTURE.md](docs/12_DATA_BACKEND_AND_API_ARCHITECTURE.md). Summary of sources of truth:

- Skill taxonomy and career-role requirements: curated seed data (`seed/`), not user-generated, not AI-generated at runtime.
- Student skill state: derived from AI resume extraction + manual edits, always attributed with a `source` and `confidence`.
- Resources/projects/certifications: curated seed data with skill tags; not scraped or user-submitted in this MVP.
- Interview questions: curated seed set (P0) + AI-generated personalized questions (P1), both persisted so attempts can reference a stable question.

## 21. Analytics Requirements

Deterministic, derived from `learning_progress` events and skill-gap snapshots — see [11_PROGRESS_AND_ANALYTICS_ARCHITECTURE.md](docs/11_PROGRESS_AND_ANALYTICS_ARCHITECTURE.md). Metrics: skills mastered count, high-priority gaps remaining, roadmap completion %, projects completed, (P1) interview readiness, overall career readiness score. No vanity metrics (page views, session count) — only metrics that inform the student's plan.

## 22. Error Handling Expectations

- Resume upload failures (bad file type, too large, parsing totally fails) degrade to the manual skill self-report flow, never a dead end.
- AI call failures (timeout, malformed output after retry) fall back to a deterministic/templated result and the UI indicates "AI personalization limited" rather than blocking the flow.
- All API errors return the standard envelope from `AGENT.md` §10 with actionable messages surfaced in the UI (toast/inline), never a raw 500 page.

## 23. Acceptance Criteria (MVP)

1. A new user can go from landing page to viewing a personalized roadmap in under 5 minutes without developer intervention.
2. Uploading two different resumes (different skill sets) targeting the same career role produces two visibly different gap analyses and roadmaps.
3. All P0 features in §13 function against the deployed public URL, not just localhost.
4. No step in the golden path shows an unhandled error for the demo dataset.
5. Readiness score changes when a roadmap item is marked complete.

## 24. Demo Requirements

3–5 minute golden demo flow (detailed script maintained in `phases.md` Phase 9/10 and `design.md`): Resume → Extracted Skills → Career Goal → Skill Gaps → Personalized Roadmap → Personalized Recommendations → Interview Prep (if P1 shipped) → Progress/Readiness. Each step must show visible evidence of personalization (see §17).

## 25. Submission Requirements

- Publicly accessible deployed URL (frontend), functioning without judge-side setup.
- Repository with this documentation intact and a working README pointing to the deployed URL and demo script.
- No paid/gated access required for a judge to use the golden path (seed at least one demo-ready account or allow frictionless sign-up).
