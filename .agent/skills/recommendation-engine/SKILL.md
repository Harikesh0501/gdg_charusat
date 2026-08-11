---
name: recommendation-engine
description: Implementing or modifying resource/project/certification recommendations and their seed content. Use for anything touching docs/07 or docs/09.
---

# Recommendation Engine

## When to Use

Building or changing candidate retrieval, scoring, ranking, or seed content for resources/projects/certifications.

## Prerequisites

`docs/07_RECOMMENDATION_ENGINE_ARCHITECTURE.md` (pipeline, scoring formula), `docs/09_PROJECT_RESOURCE_AND_CERTIFICATION_SYSTEM.md` (data model, seeding requirements), `docs/05` (this engine consumes its gap output directly — read it first if you're not already familiar).

## Workflow

```
1. Candidate retrieval: skill-tag intersection between the item's _skills join rows
   and the student's current gap skill set for the active career goal (docs/07).
2. Filtering: exclude completed items (learning_progress) and items with zero gap
   overlap.
3. Scoring: use the exact weighted formula in docs/07 — do not substitute a different
   weighting scheme without going through architecture-review (the weights are
   deliberately simple/legible, not tuned; changing them is a product decision, not a
   drive-by tweak).
4. If adding seed content (resources/projects/certifications): every item MUST get at
   least one row in its corresponding _skills join table in the same change — an
   untagged item is invisible to retrieval by construction, and this is the single
   easiest way to silently break the demo.
5. Check seed-coverage against docs/09's requirement: every core-importance skill
   across the 6 seeded career roles needs ≥2 tagged resources and ≥1 tagged project.
   Run (or write, if it doesn't exist yet) the seed-coverage check script referenced
   in the testing-and-verification skill before considering seeding "done."
6. AI explanation (docs/06 use case 3) is generated per already-selected item — never
   feed the candidate pool to the LLM and ask it to choose/rank.
```

## Verification

- Two students with different gap sets against the same role must get visibly different recommendation lists (this is the core personalization proof for this module — verify it explicitly, don't assume).
- Confirm no high-priority gap for any seeded role returns an empty recommendation list.
- Confirm a mastered skill (gap=0) never contributes a recommendation.

## Common Mistakes

- Seeding a resource/project without tagging it — it silently never appears anywhere, and this is hard to notice without the coverage check.
- Letting `difficulty_fit` or another signal zero out the only candidate for a high-priority gap — always guarantee at least one recommendation per uncovered high-priority gap when any candidate exists.
- Asking the LLM to pick which resources to show, instead of only explaining an already-ranked selection.

## Prohibited Behavior

Do not implement collaborative filtering or a trained ranking model (explicitly deferred, `docs/14`). Do not fetch/generate resource metadata via LLM at request time — seed data is curated ahead of time (`docs/09`).

## Documentation Updates

Update `docs/09`'s seed-coverage numbers if the seeded skill/role set grows. Update `workdone.md` with any scoring-formula tuning and the reasoning (per workdone-maintenance skill) — formula changes are exactly the kind of decision a future agent needs the "why" for.
