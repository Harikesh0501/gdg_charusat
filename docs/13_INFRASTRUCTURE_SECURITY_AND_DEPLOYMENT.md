# 13 — Infrastructure, Security & Deployment

## Decision: Deployment Targets

**Frontend → Vercel. Backend → Render (Docker web service). Database + Storage + Auth → Supabase. AI → Groq.**

### Context
Team has no dedicated infra time; every target must be a managed platform reachable with a git push and a handful of env vars.

### Alternatives Considered
- Backend on Railway or Fly.io instead of Render — equally valid, same tradeoffs (both are simple git-push Docker/Python deploys with free/low tiers). Render is the documented default to avoid the team splitting effort evaluating options; if Render has a specific blocker (e.g., cold-start latency hurting the demo), Railway is the pre-approved fallback with no architecture change required.
- Self-hosted VM (EC2/DigitalOcean droplet) — full control, but costs setup time (OS, reverse proxy, TLS, process supervision) with zero judging-criteria benefit.
- Vercel serverless functions for the backend instead of a separate FastAPI service — would fragment the "one backend service" mental model, complicate background-task processing (§ below relies on a long-lived process), and serverless cold starts hurt the AI-call-latency-sensitive endpoints.

### Decision Rationale
Each platform is chosen for the piece it's already best-known for (Vercel↔Next.js, Supabase↔Postgres/pgvector/Storage/Auth, Render↔long-running Python services, Groq↔fast free AI inference) — minimizing platform-specific glue code.

### MVP Justification
All platforms have generous free tiers sufficient for hackathon-scale demo traffic; all support "connect GitHub repo, set env vars, deploy" workflows with no custom CI/CD needed.

### Consequences
Fewer separate vendor dashboards to configure — Database, Storage, and Auth are consolidated under Supabase.

### Constraints
Do not introduce an extra infrastructure vendor without updating this document. Do not move off any of these targets without the [12](12_DATA_BACKEND_AND_API_ARCHITECTURE.md)/[06](06_AI_PERSONALIZATION_ARCHITECTURE.md) docs being re-validated for compatibility.

### Reversal Criteria
Only if a specific platform has a hard blocker discovered during Phase 10 deployment (`phases.md`) — swap to the documented fallback (Railway/Fly for backend) rather than redesigning.

## Local Development

- Backend: `uvicorn app.main:app --reload`, Postgres via a local Supabase CLI instance or a shared dev Supabase project (team's choice, not architecturally significant — document whichever is chosen in `reference.md` once decided).
- Frontend: `next dev`.
- Both read config from `.env.local` (frontend) / `.env` (backend), never committed (`.gitignore`'d from Phase 0).

## Environment Variables

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_BASE_URL=          # points at deployed or local FastAPI
```

**Backend** (`.env` / Render dashboard):
```
DATABASE_URL=                       # Supabase Postgres connection string
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=          # storage access, backend-only
SUPABASE_JWT_SECRET=                # for Supabase JWT verification
GROQ_API_KEY=                       # Groq API key for Llama 4 Scout
ALLOWED_ORIGINS=                    # CORS allowlist, comma-separated
```

No secret listed above is ever prefixed `NEXT_PUBLIC_` or shipped to the browser bundle, except the Supabase *anon* key, which is designed to be public.

## Secrets Management

Managed via each platform's environment variable dashboard (Vercel project settings, Render environment tab). No secrets file committed to the repo. `.env.example` (committed, no real values) documents the required var names for onboarding a new contributor/agent.

## CORS

FastAPI `CORSMiddleware` restricted to `ALLOWED_ORIGINS` (the deployed Vercel URL + `http://localhost:3000` for dev). No wildcard `*` origin, since credentials (JWT) are involved.

## HTTPS

Provided automatically by Vercel and Render for their respective domains — no manual TLS configuration needed.

## File Upload Validation

See [04](04_RESUME_PROCESSING_ARCHITECTURE.md) — MIME allowlist, 5MB cap, enforced server-side before any storage write.

## Rate Limiting

Minimal, practical: a simple per-user in-memory or DB-backed counter on the two AI-cost-bearing endpoints most exposed to accidental abuse (`POST /api/resume/upload`, `POST /api/roadmap/generate`) — e.g., no more than 5 calls per 10 minutes per profile. This is a cost/abuse guard, not a security-critical control; a full API gateway/rate-limiter service is explicitly out of scope (`AGENT.md` §16).

## Privacy

Resume files and extracted PII are stored in a private Supabase bucket and DB rows scoped to `profile_id`, never exposed via a public URL (see [02](02_USER_ACCESS_AND_AUTHENTICATION_ARCHITECTURE.md) authorization rule — no cross-profile reads). No analytics/tracking pixels beyond what Vercel/Supabase Auth provide by default.

## Logging & Monitoring

Structured logging (`logging` module, JSON-ish key-value lines) for backend requests and AI call outcomes (success/fallback/failure — not full prompt/response content by default, to limit PII exposure in logs). Render's built-in log viewer is sufficient monitoring for hackathon scope — no separate observability platform (Datadog/Grafana etc.) — consistent with `AGENT.md` §16.

## Error Handling (Infra Level)

FastAPI global exception handler converts any unhandled exception into the standard error envelope ([12](12_DATA_BACKEND_AND_API_ARCHITECTURE.md)) with a 500 status and a generic message (no stack trace leaked to the client); full detail goes to server logs only.

## Backups

Supabase's default automated backups for the project tier in use are relied upon; no custom backup tooling built for this hackathon.

## Deployment Process

See `.agent/skills/deployment/SKILL.md` for the step-by-step playbook. Summary:

```
1. Provision Supabase project (DB + Storage bucket + Auth enabled)
2. Run Alembic migrations against it
3. Run seed scripts (skills, career roles, resources, projects, certifications)
4. Deploy backend to Render, set env vars, verify /api/health
5. Deploy frontend to Vercel, set env vars pointing at the Render backend URL
6. Configure Supabase Auth allowed origins/redirect URLs for the Vercel domain
7. Update backend ALLOWED_ORIGINS to the Vercel domain
8. Run the full golden-path smoke test against the public URL
```

## Production Checklist (Before Submission)

- [ ] Public frontend URL loads and is not behind any preview-deployment auth wall
- [ ] Sign-up → onboarding → resume upload → skills → career goal → gap → roadmap → recommendations works against the deployed URL (not just localhost)
- [ ] CORS allows the deployed frontend origin
- [ ] No secret keys present in frontend bundle (spot-check via browser devtools network/source tab)
- [ ] Database has seed data loaded (career roles, skills, resources, projects)
- [ ] `/api/health` returns 200
- [ ] At least one full smoke-test run performed *after* the final pre-submission deploy, not only during development

## Rollback Strategy

Both Vercel and Render support one-click rollback to a previous successful deployment from their dashboards — this is the entire rollback strategy for this build; no blue-green/canary tooling is warranted at this scale.
