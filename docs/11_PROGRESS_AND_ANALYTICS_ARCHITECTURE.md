# 11 — Progress & Analytics Architecture

## Purpose

Turn roadmap/interview activity into a small set of trustworthy, deterministic metrics that answer the student's real question: "am I actually getting closer to this career, and where should I focus next?" Every metric here must be derivable from stored events/state — none are AI-estimated.

## Learning Activity Events

`learning_progress`:

```
├── id, profile_id
├── event_type    enum(roadmap_item_completed, skill_updated, project_completed, interview_attempt)
├── ref_id, ref_type   (points at the roadmap_item / student_skill / profile_project / interview_attempt row)
├── metadata            jsonb  (event-specific extra detail, e.g. previous/new proficiency)
└── created_at
```

Append-only log. Every mutating action in the product that should move the readiness needle writes exactly one row here — this is the single event stream analytics reads from, avoiding scattered ad-hoc counters.

## Roadmap Item Completion → Skill Proficiency Feedback Loop

When a student marks a `roadmap_items` row of `type='skill'` complete (or completes its attached resource/project), the backend:

1. Sets the item `status='completed'`.
2. Bumps the corresponding `student_skills.proficiency` toward (not necessarily to) the role's `required_proficiency` for that skill — concretely, `proficiency = min(required_proficiency, current_proficiency + 1)`, `source` stays `resume`/`self_reported` as before unless it was 0, in which case `source='self_reported'` is set (the student has now asserted engagement with it) with `confidence=0.8`.
3. Writes a `learning_progress` row (`event_type='skill_updated'`, metadata capturing old/new proficiency) and one for the completion itself.

This is the deterministic mechanism (not a vague "progress increases") by which completing roadmap work measurably moves the readiness score in [05](05_SKILL_GAP_AND_CAREER_MATCHING_ENGINE.md) — required for `PRD.md` Acceptance Criteria #5.

## Skill Gap Snapshots (P1 — Historical Trend)

`skill_gap_snapshots`:

```
├── id, profile_id, career_role_id
├── computed_at
└── gaps_json     jsonb   (a serialized copy of the 05 output at that point in time)
```

Written once per meaningful change (roadmap generation, or a manual "refresh" action) — **not** on every request, to avoid an unbounded table and because gap computation is cheap enough to redo live for the *current* value; snapshots exist purely to chart "gap count over time" (P1 dashboard chart). This table is explicitly a history log, not a cache the rest of the system reads from — [05](05_SKILL_GAP_AND_CAREER_MATCHING_ENGINE.md) remains the sole live source of truth for current gaps.

## Dashboard Metrics (Deterministic, Computed on Read Unless Noted)

| Metric | Formula / Source |
|---|---|
| Readiness score | [05](05_SKILL_GAP_AND_CAREER_MATCHING_ENGINE.md) formula, live |
| Skills mastered (count) | `len(mastered_skills)` from live gap computation |
| High-priority gaps remaining | `len([g for g in gaps if g.priority_bucket == 'high'])` |
| Roadmap completion % | `completed roadmap_items / total roadmap_items` for the active roadmap |
| Projects completed | `count(learning_progress where event_type='project_completed')` |
| Interview readiness (P1) | rolling average of last 5 `interview_attempts.score`, or `null`/"not started" if none |
| Career readiness (composite, dashboard headline) | = the readiness score above; the dashboard does not invent a second, differently-weighted composite — one readiness number, shown once, to avoid contradictory signals |

## Explicitly Avoided Metrics

Page views, session counts, click-through rates, streak-for-streak's-sake gamification, or any metric that doesn't directly answer "how close am I and what's next" — consistent with `PRD.md` §21 and `AGENT.md` §16 (no gamification infrastructure beyond, at most, a simple non-blocking "days active" display if trivial to add — not a P0/P1 requirement).

## Progress API

`GET /api/progress` returns the dashboard metrics table above in one response (see [12](12_DATA_BACKEND_AND_API_ARCHITECTURE.md) for the exact contract) — the dashboard should not need to call five different endpoints and reassemble state client-side.

## Constraints for Future Agents

- Do not compute readiness or gap counts differently here than in [05](05_SKILL_GAP_AND_CAREER_MATCHING_ENGINE.md) — this document's dashboard metrics call the same service functions, never reimplement the formula.
- Do not write to `skill_gap_snapshots` on every page load — only on roadmap generation/regeneration or an explicit user-triggered refresh.
- Do not add a metric that requires data this product doesn't collect (e.g., time-on-page) — if it's not in `learning_progress` or derivable from existing tables, it doesn't belong on the dashboard for this build.
