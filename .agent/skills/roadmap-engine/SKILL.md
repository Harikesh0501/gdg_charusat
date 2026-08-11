---
name: roadmap-engine
description: Implementing or modifying roadmap generation (structure, sequencing, narrative). Use for anything touching docs/08.
---

# Roadmap Engine

## When to Use

Building or changing roadmap phase/item generation, prerequisite ordering, or the AI narrative layer.

## Prerequisites

`docs/08_LEARNING_ROADMAP_ARCHITECTURE.md` (full pipeline), `docs/05` (gap input), `docs/03` (`skill_prerequisites` model this engine sorts against), `docs/07` (resource/project candidates this engine attaches to items).

## Workflow

```
1. Structure generation is entirely deterministic (docs/08 decision) — sequence
   comes from: priority-sorted gaps (docs/05) → prerequisite-constrained topological
   sort over skill_prerequisites → phase chunking (~2-4 skills/phase) → resource/project
   attachment from the top-ranked candidates per skill (docs/07).
2. Only after structure is fully built does the AI narrative call happen (docs/06 use
   case 2) — it receives the finished structure as read-only context and returns only
   phase_summaries and overall_reasoning text. It must never be able to alter phase
   order, item selection, or attached resources.
3. If a skill has no prerequisite edges configured, sequencing degrades gracefully to
   pure priority order — this is expected behavior, not a bug to "fix" by inventing
   prerequisite relationships that aren't in the seed data.
4. Regeneration triggers only on: career goal change, or an explicit user-initiated
   "regenerate" action — never automatically on every student_skills edit (would be
   disruptive mid-progress, per docs/08).
5. Changing career goal archives the prior active roadmap (status='archived') rather
   than deleting it — history is retained for docs/11 progress tracking.
```

## Verification

- Two students with different gaps targeting the same role must get visibly different roadmaps (different phase count, different skill ordering, different attached resources) — this is the concrete example in docs/08 ("Student A" / "Student B"); reproduce something like it manually after any change to this engine.
- Confirm no roadmap ever sequences a skill before a prerequisite that's also a gap for that student.
- Confirm no roadmap ever includes an already-mastered skill (gap=0 items are structurally excluded via docs/05's `gaps` list).
- Confirm the roadmap still generates correctly (structure intact) when the AI narrative call is forced to fail — narrative fields fall back to the templated string from docs/06, structure is unaffected.

## Common Mistakes

- Asking the LLM to produce the phase structure or item ordering directly instead of only the narrative text.
- Regenerating the roadmap automatically on every skill edit, silently discarding in-progress item completions.
- Skipping the prerequisite sort "since the graphs are small anyway" — small graphs are exactly why this is cheap to do correctly; skipping it produces visibly wrong sequences (e.g., Kubernetes before Docker) that undermine the product's credibility.

## Prohibited Behavior

Do not build a general graph-relationship-inference engine — `skill_prerequisites` is a deliberately minimal join table, not a knowledge graph (`AGENT.md` §16).

## Documentation Updates

Update `docs/08` if the phase-chunking heuristic or sequencing algorithm changes materially. Update `workdone.md` per workdone-maintenance skill, especially any seed-data gaps in `skill_prerequisites` discovered while testing real roadmaps.
