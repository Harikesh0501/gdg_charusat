# 10 — Interview Preparation Architecture

Priority: **P1**. Build only after the P0 golden path (resume → skills → gap → roadmap → recommendations → progress) is fully working and deployed. See `phases.md` Phase 7.

## Data Model

```
interview_questions
├── id
├── career_role_id     FK nullable  (role-specific question)
├── skill_id            FK nullable  (skill-specific question)
├── category             enum(technical, behavioral, project_specific, role_specific)
├── difficulty            int 1-5
├── question_text
├── ideal_answer_points   text[]   (bullet points used as evaluation grounding, not shown to student)
└── source                 enum(seed, ai_generated)

interview_attempts
├── id, profile_id, question_id
├── answer_text
├── score                  int 0-100
├── strengths / weaknesses  text[]
├── feedback                 text
└── created_at
```

## Question Model & Categories

- **Technical**: role-general technical knowledge (e.g., "Explain the difference between INNER JOIN and LEFT JOIN" for a Data Analyst path) — seeded, tagged to a `skill_id`.
- **Behavioral**: general professional/soft-skill questions (e.g., "Describe a time you handled conflicting priorities") — seeded, role-agnostic, small shared pool.
- **Project-specific**: generated (AI, P1) from the student's own `profile_projects` (from resume extraction, [03](03_STUDENT_PROFILE_AND_SKILL_INTELLIGENCE.md)) — e.g., "You mentioned building an e-commerce API — how did you handle authentication?" This is the most clearly "personalized" category and the one worth prioritizing if time is short within P1.
- **Role-specific**: seeded per career role (e.g., system design basics for Backend Engineer) plus AI-generated variants tied to the student's current gap skills.

## Personalization Sources (Restated From PRD §17)

Adaptive question selection considers, in this priority order: (1) target career role, (2) current high-priority skill gaps (favor questions on skills the student is actively learning, reinforcing the roadmap — not on skills they've already mastered), (3) resume projects (for project-specific questions), (4) previous interview-attempt performance (P2 — adjusting difficulty based on past scores; not required for P1).

## Question Retrieval & Generation Pipeline

```
GET /api/interview/questions?career_role_id=
   → Deterministic retrieval: seeded technical + behavioral + role-specific questions
     matching career_role_id, weighted toward questions tagged with the student's
     current high/medium-priority gap skills (same priority data as 05/07)
   → If < N questions available for project-specific category AND student has
     profile_projects: AI generation call (06, use case 4) using project descriptions
     as context, producing InterviewQuestionSet, persisted with source='ai_generated'
     so they're reusable/cacheable rather than regenerated every request
   → Merge, return a balanced set (e.g., 2 technical + 1 behavioral + 2 project-specific
     + 1 role-specific, adjustable, never all-AI or all-seed)
```

AI-generated questions are **persisted** (not ephemeral) so an `interview_attempts` row can reference a stable `question_id` — this also means the AI generation cost is paid once per student-project combination, not per practice session.

## Answer Submission & Evaluation

`POST /api/interview/attempts` — student submits `question_id` + `answer_text`. Backend calls AI use case 5 ([06](06_AI_PERSONALIZATION_ARCHITECTURE.md)) with the question, its `ideal_answer_points` (grounding, not shown to the student), and the submitted answer, producing the `InterviewEvaluation` schema (score, strengths, weaknesses, feedback, next_steps). Persisted to `interview_attempts`.

**Why evaluation is AI, not deterministic**: free-text answer quality assessment is fundamentally a natural-language judgment task with no reliable deterministic proxy at this scope — unlike gap/ranking math, there's no structured ground truth to compute against. This is the one place in the product where an LLM produces a "judgment" output rather than pure narrative/explanation, and it is scoped narrowly (one question+answer pair at a time, grounded by `ideal_answer_points`) and always has the fallback in [06](06_AI_PERSONALIZATION_ARCHITECTURE.md) (answer saved, feedback marked temporarily unavailable) so a failed AI call never loses the student's submitted answer.

## Progress Integration

Each `interview_attempts` row emits a `learning_progress` event (`event_type='interview_attempt'`) consumed by [11](11_PROGRESS_AND_ANALYTICS_ARCHITECTURE.md) for the (P1) interview-readiness metric — a simple rolling average of recent attempt scores, not a separate scoring model.

## Explicitly Avoided

Generic, role-agnostic interview question lists as the *default* experience (`PRD.md` §6 pain point) — the seeded pool exists as a grounding/fallback layer, not the primary personalization mechanism; role/gap/project-driven selection and AI generation are what make this feature distinct from a static LeetCode-style list.

## Constraints for Future Agents

- Do not build this before the P0 golden path works end-to-end and is deployed (`phases.md` sequencing).
- Do not show `ideal_answer_points` to the student — it's evaluation grounding only, revealing it would let students game their own practice.
- AI-generated questions must be persisted with `source='ai_generated'`, never regenerated silently on every page load (cost and consistency).
