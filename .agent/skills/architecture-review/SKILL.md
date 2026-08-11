---
name: architecture-review
description: Determines whether a requested change fits the existing SkillForge architecture or requires a documented decision update. Use before adding a new datastore, service, AI provider, endpoint pattern, or any structural change.
---

# Architecture Review

## When to Use

Before making any change that could be a "new abstraction" rather than a use of an existing one: a new database, a new service/deployment target, a new AI provider, a background job system, a new top-level API pattern, a new frontend state-management approach, or anything that contradicts a stated decision in `docs/01`-`14`. Also use it whenever you're unsure whether something is "just implementation" or "an architecture change."

## Prerequisites

Read the specific `docs/NN_*.md` file governing the area in question — every major decision there has a **Constraints** and **Reversal Criteria** section; you need both before concluding anything.

## Workflow

```
1. Locate the governing decision — find the exact docs/NN_*.md section (most decisions
   use the Decision/Context/Alternatives/Rationale/Consequences/Constraints/Reversal
   format; find it before concluding "there's no existing guidance")
2. Check the Constraints — does the requested change violate a stated constraint?
   If yes, it needs this full process. If the change is within the decision's stated
   flexibility (e.g., adding a new career role within the existing 6-role model,
   adding a new seeded resource), it is NOT an architecture change — implement it
   directly, no review process needed.
3. Check the Reversal Criteria — does the actual situation match what the doc says
   would justify revisiting this decision? If not, the answer is "don't change it,"
   even if the alternative seems technically nicer — explain the tradeoff to the user
   instead of silently implementing it.
4. Confirm the conflict is real — inspect the current implementation (not just docs)
   to verify the limitation you're hitting is actually blocking, not a misunderstanding
   of how the existing architecture already handles the case.
5. If a change is genuinely warranted: write it up as a decision update in the same
   docs/NN_*.md file, using the same ADR format (Decision/Context/Alternatives/
   Rationale/MVP justification/Consequences/Constraints/Reversal criteria) — replacing
   or appending to the existing entry, clearly marked as superseding the prior one.
6. Record the change in workdone.md under "Architectural Decisions Changed During
   Development," with both the old and new decision (see workdone-maintenance skill).
7. Only then implement.
```

## Classification Guide (Is This Actually an Architecture Change?)

| Change | Architecture change? |
|---|---|
| New seeded career role / skill / resource / project | No — within existing data model flexibility |
| New API endpoint following existing conventions (docs/12) | No — but add it to docs/12's endpoint table in the same change |
| New database table for an existing domain (e.g., a new field on `student_skills`) | No, but requires a migration (see database-migration skill) and a docs/12 update |
| New top-level entity/table not in docs/12 | Borderline — usually fine if it's additive and fits an existing domain; write a one-paragraph note in docs/12 either way |
| Second AI provider | Yes — see docs/06 Reversal Criteria |
| Background job queue (Celery/RQ/Redis) | Yes — see docs/04 Reversal Criteria |
| Different auth provider | Yes — see docs/02 Reversal Criteria |
| Different deployment target | Yes, but pre-approved fallbacks exist (Railway for backend) — check docs/13 before treating as novel |
| Moving business logic (gap calc, ranking, roadmap ordering) into an LLM prompt | Always requires explicit user approval — this contradicts a core, repeatedly-stated principle (AGENT.md §7, docs/05/07/08), not just one decision doc |

## Constraints

- Do not perform unnecessary refactoring under the banner of "architecture review" — this skill exists to gate *additions/changes to* the architecture, not to justify rewriting working code to a different style.
- Do not silently implement a workaround that technically avoids the letter of a constraint while violating its intent (e.g., adding a second HTTP client library instead of a second provider, but still coupling a service directly to it instead of the `LLMProvider` interface).

## Prohibited Behavior

Do not change a documented architectural decision without completing steps 5-6 above. A code change that contradicts `docs/` without a corresponding docs update is treated as a bug, per `AGENT.md` §17.

## Documentation Updates

This skill's entire output, when a change is warranted, IS a documentation update (step 5-6) — it is not a side effect, it's the primary deliverable of running this skill.
