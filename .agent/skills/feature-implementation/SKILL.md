---
name: feature-implementation
description: The default workflow for implementing any SkillForge feature or phase. Use before writing code for any P0/P1 feature from phases.md.
---

# Feature Implementation

## When to Use

Any time you're about to write code for a feature listed in `phases.md`, or a change requested by the user that maps to functionality described in `PRD.md`/`docs/`. This is the default entry point — not optional, not just for "big" features. A one-line bug fix does not need this full sequence; a new endpoint, screen, or business-logic change does.

## Prerequisites

You must have already read (this session or verified still current): `AGENT.md`, `PRD.md`, the relevant `docs/NN_*.md` file(s), `phases.md` (to know which phase this belongs to and its dependencies), `design.md` (if touching UI), `workdone.md` (check for prior mistakes/rejections on this exact area).

## Workflow

```
1. Read PRD.md — confirm the feature is in scope (P0/P1) and understand its acceptance criteria
2. Read the relevant docs/NN_*.md — this is where the "how" lives; do not guess
3. Read AGENT.md — confirm no principle/constraint is being violated
4. Read workdone.md — search for this feature/module; any past rejected approach or lesson?
5. Inspect existing implementation — grep/read the actual current code in the affected
   modules (api/, services/, repositories/, frontend equivalents). Never assume a
   module's current state from documentation alone — docs describe intent, code is truth
   for "what exists right now."
6. Identify affected modules — list every file you expect to touch or create, cross-
   checked against the module structure in docs/12 (backend) and AGENT.md §6 (frontend)
7. Plan — for anything non-trivial, sketch the approach before editing (mentally or,
   for multi-step work, using a todo list) — especially confirm which parts are
   deterministic logic (services/) vs. AI-touched (ai/) per docs/06
8. Implement — follow the layering rule (api → services → repositories/ai, docs/12);
   reuse existing schemas/services before creating new ones
9. Test — per testing-and-verification skill; deterministic engines need real unit tests
10. Verify integration — run it end-to-end, not just in isolation (frontend calling the
    real backend endpoint, not a mock)
11. Review against requirements — re-read the acceptance criteria from PRD.md/phases.md
    for this feature and check each one explicitly
12. Update workdone.md — per the workdone-maintenance skill, this is not optional
```

## Constraints

- Do not start editing files before step 5 (inspecting existing implementation). An agent that jumps straight to writing code without checking what's already there is the most common source of duplicated logic and contradicted architecture in this project.
- Do not implement a feature "roughly matching" a docs/ spec and move on — if the spec is wrong or incomplete for a real case you hit, update the spec first (see architecture-review skill for when that requires more than a docs edit), then implement against the corrected spec.
- Do not skip to a later phase's feature because it seems easier or more interesting — `phases.md` sequencing exists because later phases depend on earlier ones being solid (e.g., recommendations depend on the gap engine being correct).

## Common Mistakes

- Building a feature against an assumed API/schema shape instead of the one in `docs/12_DATA_BACKEND_AND_API_ARCHITECTURE.md` — always that document's shape wins; if you need a different shape, that's an architecture-review-skill situation, not a silent deviation.
- Letting an AI call compute something `docs/05`/`docs/07`/`docs/11` define as deterministic (see `AGENT.md` §7 and `docs/06`).
- Leaving a feature "done" with mock/hardcoded data still wired in the frontend instead of the real endpoint — this violates the Definition of Done in `AGENT.md` §15.

## Prohibited Behavior

Do not mark a todo/task complete, or tell the user a feature is "done," if any item in `AGENT.md` §15's Definition of Done checklist is unmet.

## Documentation Updates

Always update `workdone.md` after implementation (see workdone-maintenance skill). Update the relevant `docs/NN_*.md` only if an actual decision changed (see architecture-review skill) — do not edit docs just to restate what code already makes obvious.
