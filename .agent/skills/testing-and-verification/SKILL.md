---
name: testing-and-verification
description: What and how to test in SkillForge given the 3-day timeline. Use before marking any feature done, and always for the deterministic engines (gap, roadmap, recommendations).
---

# Testing & Verification

## When to Use

Before marking any feature "done" per `AGENT.md` §15. Testing depth should match the feature's importance to product credibility — this skill tells you where to invest real test-writing time and where a manual smoke check is sufficient, given the hackathon timeline.

## Prerequisites

`AGENT.md` §13 (testing rules summary), the critical path definition below.

## Critical Path

```
Authentication → Resume → Extraction → Skills → Career Goal → Skill Gap
→ Roadmap → Recommendations → Interview [P1] → Progress
```

Every step here needs at least a smoke-level check before submission. This is the golden demo path (`PRD.md` §24) — if any link breaks, the demo breaks.

## Where Real Unit Tests Are Required (Not Optional)

- **Skill-gap engine** (`docs/05`): gap formula, priority bucketing, readiness score, mastered-skill exclusion. This is the product's credibility core — a wrong number here undermines every downstream feature. Include the two-different-students test explicitly (same role, different `student_skills` → different, correct gap output).
- **Roadmap sequencing** (`docs/08`): prerequisite topological sort, phase chunking. A visibly wrong sequence (e.g., an advanced skill before its prerequisite) is an obvious, embarrassing bug a judge could spot.
- **Recommendation scoring** (`docs/07`): the weighted formula, and the guarantee that no high-priority gap with an available candidate returns empty.
- **Progress feedback loop** (`docs/11`): roadmap-item-completion → proficiency bump → readiness-score change chain — this directly proves `PRD.md` Acceptance Criteria #5.

## Where API Tests Are Expected

Every endpoint in `docs/12`'s table: at minimum, one test for the success path and one for its most likely validation/error failure (missing auth → 401, invalid input → 400, business-rule conflict like "no active career goal" → 409).

## Where Manual/Smoke Verification Is Sufficient

- AI-touched endpoints' happy path (mocking the LLM call in automated tests is fine; the real API should be exercised manually at least once per use case, not just mocked forever).
- Frontend screens — full manual walkthrough per the frontend-implementation skill's four-states check, not automated E2E (not worth the setup time at this scope).
- File upload edge cases (bad type/size) — manual check against docs/04's error table.

## Fallback/Failure-Path Testing (Do Not Skip)

Every AI use case's fallback (`docs/06`'s table) must be exercised at least once, not just implemented and assumed to work — temporarily break the AI provider connection (bad key, or a deliberately malformed schema) and confirm the product degrades to its documented fallback instead of erroring out. This is a required check, not a nice-to-have, because NFR1 in `PRD.md` (reliability under AI outage) is explicitly a judged requirement.

## Seed-Data Coverage Check

Before considering Phase 6/9 done, verify (script or manual query): every `core`-importance skill across the 6 seeded career roles has ≥2 tagged resources and ≥1 tagged project (`docs/09`'s seeding requirement). An easy automatable check:

```sql
-- core skills with fewer than 2 tagged resources
SELECT s.name FROM skills s
JOIN career_role_skills crs ON crs.skill_id = s.id AND crs.importance = 'core'
LEFT JOIN resource_skills rs ON rs.skill_id = s.id
GROUP BY s.id HAVING COUNT(rs.resource_id) < 2;
```

## Golden Demo Timing Check

Before Phase 10, time a full manual run of the golden path end-to-end — must fit the 3-5 minute window (`PRD.md` §24). If it doesn't, that's a UX/flow issue to fix in Phase 9, not a testing issue to ignore.

## Prohibited Behavior

Do not claim a feature is tested because "it compiled" or "the happy path worked once during development." Do not skip unit tests for the deterministic engines listed above under time pressure — cut scope elsewhere first (per `phases.md` fallback guidance), not test coverage on the product's credibility core.

## Documentation Updates

Record any bug found and its root cause in `workdone.md` (per workdone-maintenance skill) — especially if it revealed a wrong assumption in a `docs/` spec, which should then be corrected.
