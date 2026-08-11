---
name: resume-processing
description: Implementing or modifying the resume upload/extraction pipeline. Use for anything touching resumes, resume_extractions, or resume-driven student_skills population.
---

# Resume Processing

## When to Use

Building or changing any part of the pipeline in `docs/04_RESUME_PROCESSING_ARCHITECTURE.md`: upload validation, storage, text extraction, AI structured extraction, skill normalization, or the resume-review UI.

## Prerequisites

`docs/04` (full pipeline spec, canonical extraction schema, error handling table), `docs/03` (student_skills/profile_projects data model this pipeline writes into), `docs/06` (AI orchestration pattern — the extraction call must go through it, not a bespoke call).

## Workflow

```
1. Confirm which stage you're changing: validation / storage / text extraction /
   AI extraction / normalization / profile update — docs/04's pipeline diagram maps
   directly to service functions; know which one you're in.
2. If changing the AI extraction step: the schema in docs/04 ("Structured Extraction")
   is canonical — do not modify field names/shapes without updating that doc first
   (this schema is also referenced by docs/06's use-case table).
3. If changing skill normalization: it matches AI-extracted skill name strings against
   skills.name/aliases (case-insensitive then fuzzy via rapidfuzz). Unmatched strings
   are discarded, never inserted as new taxonomy rows — the skill taxonomy is
   seed-curated, not runtime-extensible (docs/03).
4. Confidence/proficiency assignment is deterministic post-processing (docs/04's
   "Deterministic Post-Processing" section) — do not move this logic into the AI
   prompt; the AI only extracts, evidence-strength-based scoring happens in code.
5. Never let this pipeline overwrite a student_skills row with source='self_reported'
   — a re-uploaded/re-processed resume only touches source='resume' rows.
6. Background execution: use FastAPI BackgroundTasks, not a queue (docs/04 decision) —
   do not introduce Celery/RQ/Redis here even if it seems like the "proper" fix for
   something.
7. Every failure mode in docs/04's error table must route to a real product state —
   never a dead end. Verify the manual-skill-entry fallback still works after your change.
```

## Verification

- Upload a real, varied resume (not a synthetic one-liner) and confirm plausible extraction end-to-end through to `student_skills`.
- Upload an invalid file type/oversized file and confirm the 400 + clear message path.
- Simulate an AI failure (e.g., temporarily point at an invalid API key) and confirm `resumes.status='failed'` routes to manual entry, not a stuck/broken UI.
- Re-upload a second resume for the same profile and confirm manually-edited skills survive.

## Common Mistakes

- Letting the AI extraction step's output write proficiency/confidence values directly instead of running it through the deterministic evidence-cross-referencing step (project/experience mention vs. bare list mention).
- Treating an unmatched extracted skill string as "close enough, just add it to the taxonomy at runtime" — this breaks the curated-taxonomy guarantee relied on throughout docs/05/07/08.
- Forgetting the 50-character near-empty-text check that catches scanned/image PDFs.

## Prohibited Behavior

Do not send raw resume text as part of the AI system/instruction prompt — it must go in the user message inside the delimited data block per `docs/06`'s prompt-injection mitigation. Do not add OCR/scanned-PDF support (explicitly out of scope, `docs/14`) without an explicit user request.

## Documentation Updates

Update `docs/04` if the extraction schema or pipeline stages change. Update `workdone.md` with any resume-format-specific parsing issues discovered — this is exactly the kind of "lesson" future agents need (per workdone-maintenance skill), since resume format variance is the flagged highest-risk area in `phases.md` Phase 2.
