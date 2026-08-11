# phases.md — Implementation Roadmap

Binding sequence. Do not jump ahead to a later phase's feature while an earlier phase's acceptance criteria are unmet — see `AGENT.md` §7 ("stay within scope"). If a phase must be cut short for time, follow its **Fallback** entry rather than skipping silently, and record the decision in `workdone.md`.

Target calendar (today: 2026-08-11, submission: 2026-08-15 — see `AGENT.md` §3):

| Day | Date | Phases |
|---|---|---|
| Day 1 | 2026-08-12 | Phase 0, Phase 1, Phase 2, start Phase 3 |
| Day 2 | 2026-08-13 | Finish Phase 3, Phase 4, Phase 5, Phase 6 |
| Day 3 | 2026-08-14 | Phase 7 (if time), Phase 8, Phase 9, Phase 10 |
| Day 4 | 2026-08-15 | Buffer, final verification, submission |

This allocation is a guide, not a hard lock — if Phase 2 (resume processing, historically the riskiest) overruns, pull time from Phase 7 (P1, cuttable) first, never from Phase 10 (deployment, must happen with margin, not at the last hour).

---

## Phase 0 — Project Foundation

**Goal**: Repo scaffolding for both apps, deployable "hello world" on real infra, before any product feature is built.

**Why it matters**: Deploying late is the single most common hackathon failure mode. Proving the full pipeline (Vercel↔Render↔Supabase↔Clerk) works on day 1 removes that risk from every later phase.

**Dependencies**: None. Requires: Clerk account+keys, Supabase project, OpenAI API key, Vercel account, Render account — provision all before starting.

**Files/modules**: `frontend/` (Next.js init, Tailwind, shadcn/ui init), `backend/` (FastAPI init, `core/config.py`, `core/db.py`, `alembic/` init), `seed/` (empty scaffolding), `.env.example` (both apps).

**Database changes**: Initial Alembic migration creating `users`, `profiles` only (enough to prove the pipeline).

**API changes**: `GET /api/health`, `POST /api/auth/sync` (see [02](docs/02_USER_ACCESS_AND_AUTHENTICATION_ARCHITECTURE.md)).

**Frontend changes**: Landing page shell, Clerk sign-in/sign-up wired, a protected `/dashboard` placeholder page that calls `/api/auth/sync` then `GET /api/profile`.

**AI changes**: None yet — but scaffold `ai/providers/base.py` + `ai/providers/openai_provider.py` with a trivial "ping" method to prove the OpenAI key works.

**Tests**: Manual smoke test only at this phase (automated test harness setup itself is part of this phase — pytest for backend, minimal).

**Acceptance criteria**:
- [ ] Signing up on the deployed Vercel URL creates a `users`/`profiles` row visible in Supabase.
- [ ] `/api/health` returns 200 from the deployed Render URL.
- [ ] A trivial OpenAI call succeeds from the deployed backend (not just localhost).

**Definition of done**: All three deployed pieces (Vercel, Render, Supabase) are live and talking to each other with a real auth flow — not just individually working in isolation.

**Risks**: Platform account setup delays (billing verification, etc.) — provision accounts before Phase 0 starts, ideally the moment the hackathon is confirmed.

**Fallback**: If Render setup stalls, deploy backend to Railway instead (pre-approved in [13](docs/13_INFRASTRUCTURE_SECURITY_AND_DEPLOYMENT.md)) rather than losing a day debugging one platform.

---

## Phase 1 — Authentication + Onboarding

**Goal**: Full auth lifecycle + onboarding form persisting to `profiles`.

**Dependencies**: Phase 0.

**Files/modules**: `api/profile.py`, `services/profile.py`, `repositories/profile.py`, `schemas/profile.py`; frontend `app/onboarding/`, `app/(dashboard)/layout.tsx` shell.

**Database changes**: Extend `profiles` migration with `education_level`, `institution`, `graduation_year`, `interests`, `bio`, `onboarding_completed` if not already in Phase 0's migration.

**API changes**: `GET /api/profile`, `PUT /api/profile`.

**Frontend changes**: Onboarding form (multi-field, single page acceptable for MVP — no need for a multi-step wizard), redirect logic (`onboarding_completed` gates `/dashboard` access per [02](docs/02_USER_ACCESS_AND_AUTHENTICATION_ARCHITECTURE.md)).

**AI changes**: None.

**Tests**: API test for `PUT /api/profile` validation (missing required fields → 400); manual test of full sign-up→onboarding→dashboard flow.

**Acceptance criteria**:
- [ ] New user cannot reach `/dashboard` before completing onboarding.
- [ ] Onboarding data persists and is editable afterward.

**Definition of done**: Matches `AGENT.md` §15 checklist.

**Risks**: Low. **Fallback**: N/A — this phase is small and required, no cuttable sub-scope.

---

## Phase 2 — Resume Ingestion + Extraction

**Goal**: Upload → storage → text extraction → AI structured extraction → normalized `student_skills`/`profile_projects`. Full pipeline in [04](docs/04_RESUME_PROCESSING_ARCHITECTURE.md).

**Dependencies**: Phase 1 (needs `profile_id`). Needs `skills` taxonomy seeded (pull forward the skills-seed part of Phase 3's seed data now, since resume normalization depends on it — see note in Phase 3).

**Files/modules**: `api/resume.py`, `services/resume.py`, `repositories/resume.py`, `ai/prompts/resume_extraction/`, `ai/schemas/resume_extraction.py`, `seed/skills.py` (pulled forward, see above).

**Database changes**: `resumes`, `resume_extractions`, `skills`, `skill_prerequisites`, `student_skills`, `profile_projects`.

**API changes**: `POST /api/resume/upload`, `GET /api/resume/latest`, `GET /api/resume/{id}/status`.

**Frontend changes**: Upload screen (drag/drop or file picker), processing state (poll status), extracted-skills review screen (editable list, per [03](docs/03_STUDENT_PROFILE_AND_SKILL_INTELLIGENCE.md)).

**AI changes**: First real use case — resume structured extraction (use case 1 in [06](docs/06_AI_PERSONALIZATION_ARCHITECTURE.md)), including the orchestrator (`ai/orchestrator.py`) built generically enough for reuse by later phases.

**Tests**: Unit test for skill-normalization matching (aliases, fuzzy match); API test for upload validation (bad file type/size → 400); one integration test with a real sample resume text through extraction (can mock the LLM call for CI, but must be manually verified against the real API at least once).

**Acceptance criteria**:
- [ ] Uploading a real resume produces a plausible, editable skill list within ~20s.
- [ ] Uploading an invalid file type is rejected with a clear message and doesn't block onboarding.
- [ ] Manual skill entry works as a complete substitute path (student can skip resume entirely).

**Definition of done**: Matches `AGENT.md` §15. This is the riskiest phase — allocate buffer.

**Risks**: PDF text extraction quality varies by resume template; AI extraction schema mismatches.

**Fallback**: If a specific resume format fails, that's expected (documented limitation, [14](docs/14_TECHNOLOGY_STACK_AND_FUTURE_ROADMAP.md)) — the manual entry path is the hard requirement, not perfect parsing of every resume.

---

## Phase 3 — Student Profile + Skill Intelligence (Finish)

**Goal**: Complete the skill taxonomy seed data and the skill-profile UI (viewing/editing, grouped by category).

**Note**: `skills`/`skill_prerequisites` seeding and schema were pulled into Phase 2 since resume normalization needs them — this phase finishes breadth (full ~150-250 skill seed set, not just enough for a smoke test) and builds the dedicated skill-profile screen.

**Dependencies**: Phase 2.

**Files/modules**: `seed/skills.py` (completed), frontend `app/(dashboard)/skills/`.

**Database changes**: None new (schema already exists from Phase 2) — data population only.

**API changes**: `GET /api/skills` (public catalog, search/filter), `GET /api/profile/skills`, `PUT /api/profile/skills` (manual add/edit/remove).

**Frontend changes**: Skill profile screen — grouped-by-category list, proficiency indicator, source/confidence badge, add/edit/remove UI.

**AI changes**: None (pure deterministic CRUD + display).

**Tests**: API test for `PUT /api/profile/skills` (manual edit sets `source='self_reported', confidence=1.0` and is protected from resume overwrite, per [03](docs/03_STUDENT_PROFILE_AND_SKILL_INTELLIGENCE.md)/[04](docs/04_RESUME_PROCESSING_ARCHITECTURE.md)).

**Acceptance criteria**:
- [ ] Full skill taxonomy seeded (~150-250 rows) with the 6 career roles' required skills fully covered.
- [ ] Student can view and manually adjust their skill profile.

**Definition of done**: Matches `AGENT.md` §15.

**Risks**: Seed-data authoring time is easy to underestimate. **Fallback**: prioritize breadth for the 6 seeded roles' required skills first; general taxonomy breadth beyond that can be thinner if time is short.

---

## Phase 4 — Career Goal + Skill-Gap Engine

**Goal**: Career role catalog + selection + the deterministic gap engine ([05](docs/05_SKILL_GAP_AND_CAREER_MATCHING_ENGINE.md)).

**Dependencies**: Phase 3 (needs `student_skills` populated).

**Files/modules**: `seed/career_roles.py`, `api/career.py`, `services/skill_gap.py`, `repositories/career.py`.

**Database changes**: `career_roles`, `career_role_skills`, `career_goals`.

**API changes**: `GET /api/career-roles`, `POST /api/career-goal`, `GET /api/career-goal`, `GET /api/skill-gap?career_role_id=`.

**Frontend changes**: Career goal selection screen (role cards), skill-gap visualization screen (mastered vs. gaps, priority-colored).

**AI changes**: None — this engine is fully deterministic, verify no AI call is on this path.

**Tests**: **Unit tests are mandatory here** (this is the product's credibility core) — gap formula, priority bucketing, readiness score formula, mastered-skill exclusion, and the two-different-students test (same role, different `student_skills` → different gap output).

**Acceptance criteria**:
- [ ] Selecting a role shows correct mastered/gap split matching the formula in [05](docs/05_SKILL_GAP_AND_CAREER_MATCHING_ENGINE.md).
- [ ] Two students with different skills targeting the same role get visibly different gap results.
- [ ] A skill already at/above required proficiency never appears in `gaps`.

**Definition of done**: Matches `AGENT.md` §15, with unit tests passing (not just "where practical" — this phase is the exception, tests are required).

**Risks**: Low (pure logic). **Fallback**: N/A.

---

## Phase 5 — Personalized Roadmap

**Goal**: Deterministic roadmap structure generation + AI narrative layer ([08](docs/08_LEARNING_ROADMAP_ARCHITECTURE.md)).

**Dependencies**: Phase 4 (gaps), Phase 6's data model partially (roadmap items reference resources/projects — see note: seed a minimal resource/project set now if Phase 6 hasn't started, or sequence Phase 5/6 seed data together).

**Files/modules**: `api/roadmap.py`, `services/roadmap.py`, `repositories/roadmap.py`, `ai/prompts/roadmap/`, `ai/schemas/roadmap.py`.

**Database changes**: `roadmaps`, `roadmap_phases`, `roadmap_items`.

**API changes**: `POST /api/roadmap/generate`, `GET /api/roadmap`, `PATCH /api/roadmap/items/{id}`.

**Frontend changes**: Roadmap visualization screen (phased, ordered, with item status toggles).

**AI changes**: Use case 2 (roadmap narrative) — structure must work correctly even if this AI call fails (verify the fallback path per [06](docs/06_AI_PERSONALIZATION_ARCHITECTURE.md)).

**Tests**: Unit test for the prerequisite topological sort; unit test for phase-chunking; manual verification of the two-different-students roadmap difference (per [08](docs/08_LEARNING_ROADMAP_ARCHITECTURE.md) concrete example).

**Acceptance criteria**:
- [ ] Roadmap never sequences a skill before its prerequisite.
- [ ] Roadmap never includes an already-mastered skill.
- [ ] Marking an item complete updates its status and (via Phase 8's feedback loop, may stub this call now and finish in Phase 8) is ready to feed progress.

**Definition of done**: Matches `AGENT.md` §15.

**Risks**: Needs at least a minimal resource/project seed set to attach items to — coordinate with Phase 6. **Fallback**: if full resource seeding isn't ready, roadmap items can reference skills only (`type='skill'`) first and resource/project attachment lands when Phase 6 completes — acceptable partial state, not a blocker, as long as it's finished before Phase 9 polish.

---

## Phase 6 — Recommendations (Resources, Projects, Certifications)

**Goal**: Seed content + deterministic scoring engine + AI explanations ([07](docs/07_RECOMMENDATION_ENGINE_ARCHITECTURE.md), [09](docs/09_PROJECT_RESOURCE_AND_CERTIFICATION_SYSTEM.md)).

**Dependencies**: Phase 4 (gaps).

**Files/modules**: `seed/resources.py`, `seed/projects.py`, `seed/certifications.py`, `api/recommendations.py`, `services/recommendations.py`, `ai/prompts/recommendation_explanation/`.

**Database changes**: `resources`, `projects`, `certifications`, `resource_skills`, `project_skills`, `certification_skills`, `recommendations`.

**API changes**: `GET /api/recommendations?category=`.

**Frontend changes**: Recommendation cards (resource/project/certification), each showing score-derived rationale (matched gap skills) + AI explanation text.

**AI changes**: Use case 3 (recommendation explanation).

**Tests**: Seed-coverage check (every core skill across the 6 roles has ≥2 tagged resources, ≥1 tagged project — automatable as a script, run in CI or manually before each demo rehearsal); unit test for the scoring formula.

**Acceptance criteria**:
- [ ] No high-priority gap for a seeded role returns zero recommendations (seed-coverage requirement from [09](docs/09_PROJECT_RESOURCE_AND_CERTIFICATION_SYSTEM.md)).
- [ ] Recommendations visibly differ between two students with different gaps.

**Definition of done**: Matches `AGENT.md` §15. Certifications may ship as P1 if resources+projects consume the available time — see priority matrix in `PRD.md`.

**Risks**: Seed-content authoring is the largest time sink in the whole build. **Fallback**: prioritize resources > projects > certifications, in that order, if time runs short.

---

## Phase 7 — Interview Preparation [P1]

**Goal**: Question retrieval/generation + answer evaluation ([10](docs/10_INTERVIEW_PREPARATION_ARCHITECTURE.md)). **Only start after Phases 0-6 are fully working and deployed.**

**Dependencies**: Phase 4 (gaps), Phase 2 (resume projects for project-specific questions).

**Files/modules**: `seed/interview_questions.py`, `api/interview.py`, `services/interview.py`, `ai/prompts/interview/`.

**Database changes**: `interview_questions`, `interview_attempts`.

**API changes**: `GET /api/interview/questions`, `POST /api/interview/attempts`, `GET /api/interview/attempts`.

**Frontend changes**: Interview practice screen (question display, answer submission, feedback display).

**AI changes**: Use cases 4 and 5.

**Tests**: Manual verification of the fallback (AI evaluation failure still saves the answer).

**Acceptance criteria**: Student can practice ≥1 personalized question per category and receive feedback.

**Definition of done**: Matches `AGENT.md` §15.

**Risks**: Time pressure — this is the first phase to cut. **Fallback**: ship with seeded questions only (skip AI generation, use case 4) if time is critically short, but still attempt AI evaluation (use case 5) since it's the more differentiating half; if even that's too much, cut this entire phase and clearly mark it "not implemented" in `workdone.md` rather than half-shipping a broken UI.

---

## Phase 8 — Progress + Analytics

**Goal**: `learning_progress` event stream, skill-proficiency feedback loop, dashboard metrics ([11](docs/11_PROGRESS_AND_ANALYTICS_ARCHITECTURE.md)).

**Dependencies**: Phase 5 (roadmap items to complete), Phase 4 (readiness formula).

**Files/modules**: `api/progress.py`, `services/progress.py`, `repositories/progress.py`.

**Database changes**: `learning_progress`, `skill_gap_snapshots` [P1].

**API changes**: `GET /api/progress`. Finish the `PATCH /api/roadmap/items/{id}` feedback loop stubbed in Phase 5.

**Frontend changes**: Dashboard screen — readiness score, skills mastered, gaps remaining, roadmap completion %, (P1) interview readiness.

**AI changes**: None — fully deterministic.

**Tests**: Unit test for the roadmap-completion → proficiency-bump → readiness-change chain (this directly proves `PRD.md` Acceptance Criteria #5).

**Acceptance criteria**:
- [ ] Completing a roadmap item visibly changes the readiness score.
- [ ] Dashboard is the default post-login screen and communicates state at a glance.

**Definition of done**: Matches `AGENT.md` §15.

**Risks**: Low. **Fallback**: `skill_gap_snapshots` trend chart is P1-cuttable; the live metrics are not.

---

## Phase 9 — UI Polish + Integration

**Goal**: Loading/error/empty/success states everywhere (per `design.md`), responsive pass, remove any remaining mock data, cross-screen navigation coherence.

**Dependencies**: All prior P0 phases functionally complete.

**Files/modules**: Frontend-wide pass across all screens; no backend changes expected unless a UX gap reveals a missing API field (add it to [12](docs/12_DATA_BACKEND_AND_API_ARCHITECTURE.md) if so, don't invent it silently).

**Tests**: Full manual walkthrough of the golden demo path end-to-end, timed (must fit 3-5 minutes per `PRD.md` §24).

**Acceptance criteria**: Matches the golden demo requirement in `PRD.md` §24 and `design.md`.

**Definition of done**: No dead-end/broken state anywhere in the golden path.

**Risks**: Underestimating polish time. **Fallback**: prioritize the exact golden-path screens over secondary/edge screens.

---

## Phase 10 — Deployment + Verification

**Goal**: Final, verified public deployment. See `.agent/skills/deployment/SKILL.md` for the exact playbook and [13](docs/13_INFRASTRUCTURE_SECURITY_AND_DEPLOYMENT.md) for the checklist.

**Dependencies**: All above.

**Acceptance criteria**: `PRD.md` §25 Submission Requirements met in full, verified against the live URL, not localhost.

**Definition of done**: Golden path runs start-to-finish on the public URL with no developer intervention, at least twice (once right after deploy, once as a final pre-submission check).

**Risks**: Deploying for the "first time" under deadline pressure. **Mitigation already applied**: Phase 0 deploys the skeleton early precisely to avoid this.
