# 04 — Resume Processing Architecture

## Pipeline

```
Upload (PDF/DOCX, ≤5MB)
   → Validation (type, size, non-empty)
   → Storage (Supabase Storage, private bucket)
   → resumes row created (status=uploaded)
   → Background task starts (status=processing)
       → Text Extraction (pdfplumber / python-docx)
       → Normalization (whitespace, section heuristics)
       → Structured Extraction (AI, structured output — see schema below)
       → Skill Normalization (fuzzy-match extracted skill strings → skills.id via name/alias)
       → Confidence assignment
       → Student Profile Update (upsert student_skills, profile_projects)
   → resumes.status = processed | failed
   → Frontend polls / re-fetches status
```

## Decision: Background Task, Not a Queue

### Context
Resume processing takes several seconds (text extraction + one LLM call) — too slow to block the HTTP response, but not slow/heavy enough to justify infrastructure.

### Alternatives Considered
- Synchronous processing in the request (simplest, but blocks the client 5-20s with no feedback and risks request timeouts on the hosting platform).
- Dedicated task queue (Celery/RQ + Redis) — real infra for a problem this size doesn't require it.

### Decision Rationale
FastAPI's built-in `BackgroundTasks` runs the pipeline after the upload response is returned; the frontend polls `GET /api/resume/{id}/status` (or re-fetches profile) every ~2s until `processed`/`failed`. This gives async UX without a queue, a broker, or a worker deployment.

### MVP Justification
Single backend process, single demo-scale user count — no need for durable job retry across restarts or horizontal worker scaling.

### Consequences
If the backend process restarts mid-processing, that one resume's job is lost and the resume stays `processing` — acceptable for hackathon scale; a "reprocess" button (P1) mitigates this without needing a queue.

### Constraints
Do not introduce Celery/RQ/Redis for this. If resume volume or processing time ever becomes a real problem post-hackathon, that's a documented future upgrade (see [14](14_TECHNOLOGY_STACK_AND_FUTURE_ROADMAP.md)), not a hackathon change.

### Reversal Criteria
Only if background task loss becomes visibly disruptive during judging rehearsal — mitigate first with a manual "reprocess" retry button before considering infra.

## Supported File Types & Constraints

- `.pdf`, `.docx` only (MVP). `.doc`/images/scanned PDFs explicitly unsupported — validation rejects with a clear error, student falls back to manual skill entry (`PRD.md` §11.2).
- Max size: 5MB.
- One active resume per profile for MVP simplicity; re-uploading replaces the active one (previous resume + extraction rows retained for history but not re-processed). `resumes.is_active` boolean, only one true per profile.

## Validation

Server-side, before storage: MIME type check against an allowlist (not just file extension), size check, and a basic "is this actually parseable text" check post-extraction (reject if extracted text < ~50 characters — likely a scanned image).

## Storage

Supabase Storage, private bucket `resumes/`, path pattern `resumes/{profile_id}/{resume_id}.{ext}`. Bucket is not publicly readable; backend generates short-lived signed URLs only when needed (there is no product feature that displays the raw file back to the user in MVP — storage is write-once, read-by-backend-only).

## Text Extraction

- PDF: `pdfplumber` (pure-Python, no external binary dependency, good enough for typical resume layouts).
- DOCX: `python-docx`.
- Output: a single normalized plain-text string (whitespace collapsed, page breaks stripped) passed to the AI extraction step.

## Structured Extraction (AI)

Single LLM call per resume, structured JSON output validated against a Pydantic schema (this is the canonical schema — do not duplicate/fork it elsewhere):

```json
{
  "skills": [
    {"name": "string", "evidence": "string", "confidence_hint": "low|medium|high"}
  ],
  "education": [
    {"institution": "string", "degree": "string", "field": "string", "graduation_year": "int|null"}
  ],
  "projects": [
    {"title": "string", "description": "string", "skills_used": ["string"]}
  ],
  "experience": [
    {"role": "string", "organization": "string", "duration": "string", "description": "string", "skills_used": ["string"]}
  ],
  "certifications": [
    {"name": "string", "issuer": "string|null"}
  ]
}
```

Prompt architecture, retry, and fallback behavior for this call follow the pattern defined in [06_AI_PERSONALIZATION_ARCHITECTURE.md](06_AI_PERSONALIZATION_ARCHITECTURE.md) — this document defines *what* is extracted, doc 06 defines *how* the AI call is made safely.

## Deterministic Post-Processing

The AI's job ends at "here is the unstructured-to-structured mapping of what the resume says." Everything after that is deterministic, in `services/resume.py`:

1. **Skill normalization**: for each `skills[].name` string, match against `skills.name`/`skills.aliases` (case-insensitive, then fuzzy match e.g. via `rapidfuzz` at a similarity threshold). Unmatched strings are **discarded**, not invented as new taxonomy rows — the skill taxonomy is curated seed data (see [03](03_STUDENT_PROFILE_AND_SKILL_INTELLIGENCE.md)); the AI does not get to silently expand it at runtime.
2. **Confidence assignment**: `confidence_hint` (low/medium/high, from the AI) maps to a numeric confidence (e.g., 0.4/0.6/0.85); evidence *strength* (project/experience mention vs. bare list mention, determined deterministically by cross-referencing `skills_used` in `projects`/`experience` against the flat `skills` list) can bump this — a skill appearing in both the flat skill list *and* a project's `skills_used` gets higher confidence and a higher initial `proficiency` (3, Intermediate) than one only in the flat list (proficiency 2, Beginner; see scale in [03](03_STUDENT_PROFILE_AND_SKILL_INTELLIGENCE.md)).
3. **Student Profile Update**: upsert into `student_skills` with `source='resume'`; upsert `profile_projects` from `projects[]`. This never overwrites a `student_skills` row the student has manually edited (`source='self_reported'` rows are protected from being silently downgraded by a re-processed resume — a re-upload only adds/updates `resume`-sourced rows).

## Error Handling

| Failure point | Behavior |
|---|---|
| Invalid file type/size | 400 at upload time, never reaches background task |
| Text extraction yields near-empty text | `resumes.status='failed'`, reason stored, UI prompts manual skill entry |
| AI call fails / fails schema validation twice | `resumes.status='failed'` for the *AI step specifically*, but any deterministic partial progress (e.g., raw text stored) is retained; UI prompts manual entry, does not silently pretend success |
| Backend crash mid-processing | Resume stuck at `processing`; P1 "reprocess" button re-triggers from stored raw text (skips re-extraction of text, re-runs AI step) |

## Duplicate / Versioning

Re-uploading sets the previous `resumes` row `is_active=false` and creates a new one; `resume_extractions` rows are never deleted (history retained for `workdone.md`-style debuggability, not exposed as a feature in MVP UI).

## Processing States

`resumes.status`: `uploaded → processing → processed | failed`. Frontend shows a progress indicator while `processing`, and the extracted-skills review screen once `processed` (see `design.md`).

## Privacy Considerations

Resume files and extracted text contain PII (name, contact info, education history). They are stored only in the private Supabase bucket and the backend DB — never sent to any third party except the single AI provider call required for extraction, and never used as AI *system* instructions (see prompt-injection handling in [06](06_AI_PERSONALIZATION_ARCHITECTURE.md)). No resume content is logged in plaintext in application logs beyond what's needed for debugging during the hackathon (and even that should prefer resume IDs over raw text in log lines).
