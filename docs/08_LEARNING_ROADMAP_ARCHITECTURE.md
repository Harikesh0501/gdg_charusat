# 08 — Learning Roadmap Architecture

## Pipeline

```
Career Goal (career_role_id)
   → Required Skills (career_role_skills)
   → Current Skills (student_skills)
   → Skill Gaps (05: prioritized list, high/medium/low)
   → Dependency Graph (skill_prerequisites, from 03)
   → Learning Sequence (deterministic topological-ish ordering, see below)
   → Resources/Projects attachment (07: top-scored candidates per gap skill)
   → Roadmap persisted (roadmaps, roadmap_phases, roadmap_items)
   → AI Narrative pass (06, use case 2): phase summaries + overall reasoning, non-blocking for structure
```

## Decision: Structure Is Deterministic, Language Is AI

### Context
The roadmap is the single artifact judges will scrutinize most closely for "does this actually look personalized and correct," and it must never suggest a skill the student already has, or sequence a skill before its prerequisite.

### Alternatives Considered
- Full LLM-generated roadmap (ask the model to produce the phases and ordering directly) — fast to prototype, but risks incorrect sequencing, hallucinated resources/skills, and non-reproducible results between two similar students (undermining trust and the "recommendation quality" criterion).
- Fully static per-role roadmap template (no personalization) — fails the core Personalization Requirement in `PRD.md` §17 outright.

### Decision Rationale
Generate the roadmap's skeleton (phases, item order, which real resources/projects attach to which phase) entirely from data already proven correct in docs [05](05_SKILL_GAP_AND_CAREER_MATCHING_ENGINE.md) and [07](07_RECOMMENDATION_ENGINE_ARCHITECTURE.md), then use one AI call to write the connective narrative (phase summaries, overall reasoning) — this gets AI-quality language without AI-quality unreliability in the parts that must be correct.

### MVP Justification
Reuses the gap engine and recommendation engine already built — the roadmap generator adds only sequencing + phase-grouping logic, not a new data pipeline.

### Consequences
The roadmap "feels" AI-personalized (because it is — the underlying selection is per-student) even though its structure-generation step makes no LLM call; the LLM call only adds narrative polish and degrades gracefully if unavailable (doc 06 fallback table).

### Constraints
Do not let the narrative-generation step alter phase order, item selection, or attached resources — it receives the already-built structure as read-only context and only returns text fields.

### Reversal Criteria
None currently anticipated within the hackathon window; post-hackathon, a smarter sequencing model could be considered (see [14](14_TECHNOLOGY_STACK_AND_FUTURE_ROADMAP.md)) but must remain deterministic/reproducible or explicitly labeled as AI-suggested-and-editable.

## Learning Sequence (Deterministic Ordering)

1. Start from the `gaps` list from [05](05_SKILL_GAP_AND_CAREER_MATCHING_ENGINE.md) (already priority-sorted).
2. Expand prerequisites: for each gap skill, walk `skill_prerequisites` — if a prerequisite skill is itself a gap (student doesn't have it either), it must appear in an earlier or the same phase. Implementation: simple Kahn's-algorithm topological sort constrained to the gap-skill subgraph (small — typically under 20 nodes), falling back to priority order for skills with no prerequisite relationship. This is a straightforward DAG sort, not a generalized graph engine (per `AGENT.md` §16 — no large knowledge graphs).
3. Group the ordered skill list into **phases** of roughly 2-4 skills each (a simple chunking pass, not a separate optimization step) — phase count adapts to how many gaps exist (a near-ready student might get 1-2 phases; a beginner might get 3-4).
4. Each phase becomes a `roadmap_phases` row; each skill in the phase becomes a `roadmap_items` row of `type='skill'`, plus one attached `type='resource'` and (where a relevant one exists) one `type='project'` item per skill, pulled from the top-ranked candidates for that skill from [07](07_RECOMMENDATION_ENGINE_ARCHITECTURE.md).
5. A final milestone item (`type='milestone'`) closes each phase (e.g., "Complete a project demonstrating {phase skills}") to give the student a concrete checkpoint.

## Personalization in Practice (Concrete Example, per PRD §17)

**Student A** (Python, Pandas, SQL evidence) targeting **Data Analyst**: gaps might be `{Excel: low, Data Visualization (Tableau/PowerBI): medium}` — a short, 1-phase roadmap focused on visualization tooling, skipping SQL/Python entirely since they're mastered.

**Student B** (JavaScript, React, Node.js evidence) targeting **Frontend Engineer**: gaps might be `{TypeScript: medium, Testing (Jest): high, Accessibility: high}` — a different 2-phase roadmap, none of which overlaps with Student A's, because both are computed from each student's own `student_skills` rows against their respective role's `career_role_skills`.

This is the mechanism, not a promise — any future agent modifying the roadmap generator must preserve this property (verify with the two-student smoke test in `.agent/skills/testing-and-verification/SKILL.md`).

## Data Model

```
roadmaps
├── id, profile_id, career_role_id
├── status         enum(active, completed, archived)
├── generated_at
└── model_used      text nullable (which AI model produced the narrative, for debugging)

roadmap_phases
├── id, roadmap_id, order_index, title, summary (AI-personalized or fallback template)

roadmap_items
├── id, phase_id
├── type            enum(skill, resource, project, milestone)
├── ref_skill_id / ref_resource_id / ref_project_id   (nullable, only one set per row)
├── title, order_index
└── status           enum(not_started, in_progress, completed)
```

Only one `roadmaps` row per profile+career_role is `status='active'` at a time. Changing career goal archives the old roadmap (`status='archived'`) and generates a new one — history is retained, not deleted, for progress/analytics ([11](11_PROGRESS_AND_ANALYTICS_ARCHITECTURE.md)).

## Regeneration

Roadmap regenerates (new `roadmaps` row) when: (a) the student changes their active career goal, or (b) the student explicitly requests "regenerate" after updating their skills significantly (manual trigger, `POST /api/roadmap/generate`, not automatic on every skill edit — avoids surprising the student mid-progress). Completing individual `roadmap_items` does **not** regenerate the roadmap; it just updates that item's status and feeds [11](11_PROGRESS_AND_ANALYTICS_ARCHITECTURE.md) progress calculation.

## Estimated Effort

Each `roadmap_items` row of type `resource`/`project` inherits `estimated_hours` from the underlying `resources`/`projects` row (see [09](09_PROJECT_RESOURCE_AND_CERTIFICATION_SYSTEM.md)). Phase-level and roadmap-level totals are simple sums, computed on read, not stored redundantly.

## Constraints for Future Agents

- Do not generate roadmap structure via an LLM call. Structure = deterministic function of gaps + prerequisites + top recommendation candidates.
- Do not skip the prerequisite ordering step "to save time" — it's what prevents nonsensical sequences (e.g., Kubernetes before Docker) and is cheap (small graphs).
- If a career role's skill list has no prerequisite edges configured, the sort degrades gracefully to pure priority order — that's expected, not a bug.
