---
name: interview-system
description: Implementing the P1 interview preparation feature — question retrieval/generation and answer evaluation. Use only after the P0 golden path is complete.
---

# Interview System

## When to Use

Building or modifying interview question retrieval/generation or answer evaluation — `docs/10_INTERVIEW_PREPARATION_ARCHITECTURE.md`. This is a **P1** feature (`PRD.md` priority matrix, `phases.md` Phase 7) — before starting, confirm Phases 0-6 (the full P0 golden path) are complete and deployed. If they're not, that work takes priority; do not start this skill's work out of sequence.

## Prerequisites

`docs/10` (full spec), `docs/06` (use cases 4 and 5 — question generation and answer evaluation), `docs/03` (`profile_projects` — source for project-specific questions).

## Workflow

```
1. Seed the static question bank first (technical + behavioral + role-specific,
   docs/10 categories) — this is the deterministic grounding layer and the fallback
   for AI generation failure; it must exist before the AI-generation path is useful.
2. Question retrieval: deterministic, weighted toward the student's current
   high/medium-priority gap skills (same priority data as docs/05/07) — reinforces
   the roadmap, doesn't quiz on already-mastered skills.
3. Project-specific questions: only generate via AI (use case 4) when the student has
   profile_projects and the seeded pool is thin for that combination — persist
   generated questions (source='ai_generated') so they're reusable across sessions,
   never regenerate on every page load.
4. Answer evaluation (use case 5): grounded by ideal_answer_points (never shown to
   the student — it's evaluation context only, not a hint). If the AI call fails,
   the student's answer must still be saved (docs/06 fallback) — losing a submitted
   answer on an AI failure is not acceptable.
5. Emit a learning_progress event (event_type='interview_attempt') per attempt for
   docs/11's interview-readiness metric.
```

## Verification

- Confirm the question set for a given role/gap combination is a mix of categories (not all-seed or all-AI-generated), per docs/10's balanced-set requirement.
- Confirm a submitted answer is persisted even when the evaluation AI call is forced to fail.
- Confirm `ideal_answer_points` never appears in any API response sent to the frontend.

## Common Mistakes

- Building this before the P0 golden path is solid — this is the single most likely phase to be cut or rushed under time pressure (`phases.md` Phase 7 fallback), so starting it early steals time from higher-priority work.
- Regenerating AI questions on every request instead of persisting them.
- Showing `ideal_answer_points` to the student, which would let them game their own practice.

## Prohibited Behavior

Do not build this feature if P0 phases are incomplete, without an explicit user instruction to reprioritize (see `AGENT.md` §12 process for architecture/scope changes — reordering `phases.md` priority is a scope change, record it in `workdone.md` and `phases.md` if the user asks for it).

## Documentation Updates

Update `docs/10` if question categories or the evaluation schema change. Update `workdone.md` per workdone-maintenance skill, and update `phases.md`/`PRD.md` if this feature is cut or descoped for time (per `AGENT.md` §14 — scope changes must be reflected in both).
