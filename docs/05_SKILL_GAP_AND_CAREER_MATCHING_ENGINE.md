# 05 — Skill Gap & Career Matching Engine

This engine is **entirely deterministic**. No LLM call is on the critical path of computing a gap or a readiness number — see `AGENT.md` §7 and [06](06_AI_PERSONALIZATION_ARCHITECTURE.md). This is what makes the product's core claim ("evidence-based readiness") credible instead of a plausible-sounding hallucination.

## Inputs

- `career_role_skills` for the student's selected `career_goals.career_role_id` (required skill + `required_proficiency` + `importance`).
- `student_skills` for the student's `profile_id`.

## Career Roles

Seeded (see [03](03_STUDENT_PROFILE_AND_SKILL_INTELLIGENCE.md)): Frontend Engineer, Backend Engineer, Full-Stack Engineer, Data Analyst, Data Scientist / ML Engineer, DevOps / Cloud Engineer. Each role's required-skill set is curated by hand in `seed/career_roles.py` (or `.json`), not generated at runtime — this is what keeps gap analysis trustworthy and fast.

## Gap Calculation Methodology

For each required skill `r` in the target role:

```
current = student_skills.proficiency for skill r  (0 if no row exists)
gap = max(0, r.required_proficiency - current)
```

Classification per required skill:

- **Mastered**: `current >= r.required_proficiency` → gap = 0. Not surfaced as an action item (explicitly excluded from roadmap/recommendations — see "avoiding redundant recommendations" below).
- **Partially learned**: `0 < current < r.required_proficiency` → gap > 0 but student has *some* evidence.
- **Missing**: `current == 0` (no evidence at all) → gap = r.required_proficiency.

## Priority

Each required skill gets a **priority score**, not just a raw gap number, because a 1-point gap on a `core` skill matters more than a 3-point gap on a `nice_to_have` one:

```
importance_weight = { core: 3, important: 2, nice_to_have: 1 }
priority_score = gap * importance_weight[r.importance]
```

Priority bucket (used for roadmap phase assignment, [08](08_LEARNING_ROADMAP_ARCHITECTURE.md), and recommendation filtering, [07](07_RECOMMENDATION_ENGINE_ARCHITECTURE.md)):

| priority_score | Bucket |
|---|---|
| ≥ 9 (e.g., core skill, gap ≥ 3) | High |
| 4–8 | Medium |
| 1–3 | Low |
| 0 | N/A (mastered) |

This is a simple, explainable weighting — not a tuned ML ranking model. It is intentionally legible so the UI can show *why* a gap is high-priority ("core skill for this role, and you have no evidence of it yet").

## Career Readiness / Matching Score

A single 0-100 score summarizing overall fit, shown on the dashboard ([11](11_PROGRESS_AND_ANALYTICS_ARCHITECTURE.md) owns the dashboard presentation; this document owns the formula since it's derived from the same gap data):

```
readiness = 100 * (Σ min(current, required_proficiency) across required skills)
                 / (Σ required_proficiency across required skills)
```

This rewards partial progress (a student at proficiency 2 against a required 4 contributes 2/4, not 0), never exceeds 100 (capped via the `min`), and moves visibly as `student_skills` improves or roadmap items are completed and re-derived skill proficiency increases (see [11](11_PROGRESS_AND_ANALYTICS_ARCHITECTURE.md) for how roadmap-completion feeds back into proficiency).

## Output Shape

`GET /api/skill-gap?career_role_id=` returns (see [12](12_DATA_BACKEND_AND_API_ARCHITECTURE.md) for the full endpoint contract):

```json
{
  "career_role": {"id": 1, "name": "Data Analyst"},
  "readiness_score": 42,
  "mastered_skills": [{"skill_id": 5, "name": "Excel", "proficiency": 4}],
  "gaps": [
    {
      "skill_id": 12, "name": "SQL", "current_proficiency": 0,
      "required_proficiency": 3, "importance": "core",
      "gap": 3, "priority_score": 9, "priority_bucket": "high"
    }
  ]
}
```

`gaps` is sorted by `priority_score` descending — this order is what the roadmap engine consumes directly.

## Avoiding Redundant Recommendations

Because `mastered_skills` (gap = 0) are explicitly separated from `gaps`, the roadmap and recommendation engines only ever build plans from the `gaps` list — a skill the student has already demonstrated proficiency in is structurally excluded from being recommended again. This is the mechanism (not an LLM instruction) that guarantees the product never tells a student to "learn Python" when their resume already shows advanced Python evidence — see `PRD.md` §17 Personalization Requirements.

## Confidence & Uncertainty

Gap calculation uses `student_skills.proficiency` regardless of `confidence` — the gap number itself is not confidence-weighted, to keep the formula simple and explainable. `confidence` is surfaced in the UI (e.g., a subtle "not fully verified" indicator on low-confidence skills) so the student understands *why* a gap might look smaller/larger than expected, without complicating the core scoring formula. Confidence-weighted gap scoring is a documented P2 idea, not built for MVP.

## Constraints for Future Agents

- Do not move any part of this calculation into an LLM prompt. If personalization language is needed around a gap, that's a *separate* AI call that takes the computed gap as read-only input (see [06](06_AI_PERSONALIZATION_ARCHITECTURE.md)).
- Do not persist gap results as the primary source of truth — they are computed on demand from `student_skills` + `career_role_skills`. The only persisted gap-related table is `skill_gap_snapshots` (P1), which exists purely for historical trend charts (see [11](11_PROGRESS_AND_ANALYTICS_ARCHITECTURE.md)), not as an alternate source of truth.
- If the weighting constants (`importance_weight`, bucket thresholds) change, they must change in exactly one place (`services/skill_gap.py`) — do not duplicate the formula in the roadmap or recommendation services; they should import/call this service.
