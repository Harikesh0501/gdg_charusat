# 07 — Recommendation Engine Architecture

## Decision

Recommendations are produced by **deterministic candidate retrieval + scoring**, with the LLM adding only a personalized natural-language explanation per already-selected item. See [06](06_AI_PERSONALIZATION_ARCHITECTURE.md) for why selection/ranking is never delegated to the LLM.

### Context
Judging emphasizes "recommendation quality" — that requires *legible, defensible* reasons a resource was recommended, which a black-box LLM ranking cannot reliably provide, and requires visible personalization between students (`PRD.md` §17), which needs to be driven by the student's actual computed gap data.

### Alternatives Considered
- Pure LLM recommendation ("ask GPT to suggest resources") — fast to build, but ungrounded (can hallucinate resources/URLs), unscoreable, and hard to guarantee two different students get visibly different, *correct* results.
- Pure vector-similarity retrieval (embed student profile, embed resources, cosine top-K) — good semantic matching but ignores explicit structured signals (exact skill-gap match, importance/priority) that are cheap and more reliable here; used as a P1 *supplement*, not the primary mechanism.
- Full collaborative-filtering recommender (user-item interaction matrix) — needs interaction volume this product won't have during a hackathon demo.

### Decision Rationale
A small, curated, skill-tagged content pool (see [09](09_PROJECT_RESOURCE_AND_CERTIFICATION_SYSTEM.md)) makes structured filter + weighted score both fast to build and trivially explainable, which directly serves "recommendation quality" judging.

### MVP Justification
No ranking-model training, no interaction data collection needed — works correctly from the first user.

### Consequences
Recommendation quality is bounded by seed-data breadth/quality (see [09](09_PROJECT_RESOURCE_AND_CERTIFICATION_SYSTEM.md) for the seeding requirement) — this is an accepted tradeoff, not a hidden risk.

### Constraints
Do not replace the scoring formula with an LLM call. Do not add collaborative filtering or a trained ranking model in this build.

### Reversal Criteria
Add vector-similarity as a *blended* signal (P1, described below) once resource-embedding infra exists; only reconsider the deterministic-primary decision if the curated pool proves too small to differentiate — mitigate by growing seed data first.

## Pipeline

```
Student Profile (interests) + Career Goal + Skill Gaps (from 05) + Learning History (progress)
        │
        ▼
Candidate Retrieval   — resources/projects/certifications tagged with any gap skill_id
        │
        ▼
Filtering              — exclude items the student has already completed (learning_progress);
        │                 exclude items with zero overlap with current gaps
        ▼
Scoring                 — weighted sum, see formula below
        │
        ▼
Ranking                  — sort desc by score, top N per category (resources, projects, [P1] certs)
        │
        ▼
Personalized Explanation — one LLM call per surfaced item (batched into one call per request
                            where feasible), using use case #3 from doc 06
```

## Candidate Retrieval

`resource_skills` / `project_skills` / `certification_skills` join tables map each item to one or more `skill_id`s (see [09](09_PROJECT_RESOURCE_AND_CERTIFICATION_SYSTEM.md) for the full model). Candidates = any item whose skill tags intersect the student's current gap skill set for the active career goal.

## Scoring Signals & Formula

```
score = 3 * gap_priority_weight        # from 05: high=3, medium=2, low=1, using the item's best-matching gap skill
      + 2 * difficulty_fit             # 1 if item.difficulty is within ±1 of student's current proficiency-implied level, else 0
      + 1 * interest_match             # 1 if item's category/tags overlap profile.interests, else 0
      + 1 * skill_coverage             # min(len(matched_gap_skills), 3) — rewards items covering multiple gaps, capped
      - 1 * already_seen_penalty       # 1 if previously recommended and ignored across N sessions (P1; 0 in P0)
```

Weights are intentionally simple integers, not tuned coefficients — legibility over precision, consistent with the philosophy in [05](05_SKILL_GAP_AND_CAREER_MATCHING_ENGINE.md). `difficulty_fit`: student's implied level = their average current proficiency across the item's tagged skills (0-4 scale, same as `skills.difficulty` 1-5 scale rescaled — implementation detail documented in code comments, not re-derived here).

## When to Use What

| Technique | Used for |
|---|---|
| Exact/structured filter | Candidate retrieval (skill-tag intersection with gaps), completed-item exclusion |
| Deterministic scoring | Ranking within the filtered candidate pool (P0) |
| Vector similarity (pgvector, P1) | A secondary signal blended into scoring once resource embeddings exist: `score += 1.5 * cosine_similarity(query_embedding, resource.embedding)`, where `query_embedding` is computed from a short synthetic string ("student targeting {role}, needs {gap_skill_names}, interested in {interests}") — this catches resources whose free-text description matches intent but whose tags are incomplete. It is additive to, not a replacement for, structured scoring. |
| LLM | Only the final explanation text per already-ranked item (doc 06, use case 3) |

## Avoiding "The LLM Just Likes It"

The LLM is never given the candidate pool and asked to choose or rank. It receives exactly one resource/project + the one gap it addresses (already decided) and is asked only to explain *why this specific item addresses this specific gap for this specific student* — see the schema and context-construction pattern in [06](06_AI_PERSONALIZATION_ARCHITECTURE.md). If the AI call fails, the deterministic template fallback in doc 06 still produces a correct (if less flavorful) explanation, because the ranking/selection truth doesn't depend on the AI call succeeding.

## Output Shape

`GET /api/recommendations?category=resource|project|certification` (see [12](12_DATA_BACKEND_AND_API_ARCHITECTURE.md)):

```json
{
  "career_role_id": 4,
  "items": [
    {
      "id": 101, "type": "resource", "title": "SQL for Data Analysis",
      "matched_gap_skills": ["SQL"], "score": 8.5,
      "difficulty": 2, "estimated_hours": 6,
      "explanation": "Because SQL is a core, currently-missing requirement for Data Analyst and you already have strong Excel/stats fundamentals, this hands-on SQL course is the fastest path to closing your highest-priority gap."
    }
  ]
}
```

`recommendations` table logs the last-generated set per profile+category (for caching within a session and for progress/analytics history) — it is a cache/log, not the source of truth; recommendations are always recomputed on demand when gaps change (new resume, new career goal, or roadmap item completed).

## Constraints for Future Agents

- Do not add a resource that isn't skill-tagged — untagged items can never surface (by design, they'd never match candidate retrieval).
- Do not let `already_seen_penalty` or any future signal remove an item that is the *only* candidate for a high-priority gap (always guarantee at least one recommendation per uncovered high-priority gap, if any candidate exists at all) — an empty recommendation list for a real gap is a data-seeding bug, not acceptable product behavior; see [09](09_PROJECT_RESOURCE_AND_CERTIFICATION_SYSTEM.md) seeding requirements.
