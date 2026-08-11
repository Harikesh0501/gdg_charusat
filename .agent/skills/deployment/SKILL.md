---
name: deployment
description: Step-by-step playbook for deploying SkillForge to Vercel + Render + Supabase. Use for Phase 0's initial deploy and Phase 10's final deploy/verification.
---

# Deployment

## When to Use

Phase 0 (initial skeleton deploy — do this early, not at the end, per `phases.md`) and Phase 10 (final deploy + verification before submission). Also any time deployment configuration changes (new env var, new dependency needing a platform-level setup change).

## Prerequisites

`docs/13_INFRASTRUCTURE_SECURITY_AND_DEPLOYMENT.md` (full env var list, platform choices, checklist — authoritative), accounts provisioned for Vercel, Render (or Railway fallback), Supabase, Clerk, OpenAI.

## Workflow

```
1. Provision Supabase project — enable the pgvector extension, create the private
   'resumes' storage bucket (not public), note the connection string and service
   role key.
2. Run Alembic migrations against the Supabase Postgres instance:
   alembic upgrade head
3. Run seed scripts (skills, career_roles, career_role_skills, resources, projects,
   certifications, and later interview_questions) — idempotent, safe to re-run.
4. Deploy backend to Render as a Docker web service:
   - Set all backend env vars from docs/13's list (DATABASE_URL, SUPABASE_URL,
     SUPABASE_SERVICE_ROLE_KEY, CLERK_JWKS_URL, CLERK_SECRET_KEY if used,
     OPENAI_API_KEY, ALLOWED_ORIGINS)
   - Verify GET /api/health returns 200 from the Render URL directly (curl or browser)
   before moving on — do not proceed to frontend deploy on an unverified backend.
5. Deploy frontend to Vercel:
   - Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and NEXT_PUBLIC_API_BASE_URL (pointing at
     the Render backend URL from step 4)
6. Configure Clerk's allowed origins/redirect URLs to include the Vercel production
   domain (Clerk dashboard, not code).
7. Update backend ALLOWED_ORIGINS (Render env var) to include the Vercel production
   domain, then redeploy the backend (env var changes require a redeploy on most
   platforms — confirm it took effect).
8. Run the full golden-path smoke test against the PUBLIC URL (not localhost):
   sign up → onboarding → resume upload → skill review → career goal → skill gap →
   roadmap → recommendations → (interview if shipped) → progress dashboard.
9. Run docs/13's Production Checklist explicitly, item by item.
```

## Verification

The deployment is not "done" until the smoke test in step 8 passes against the live public URL, performed by actually clicking through the app — not inferred from "the deploy succeeded" build logs. Do this at least twice: once right after the Phase 0/10 deploy, and once as a final check immediately before submission (code or config can drift between them).

## Common Mistakes

- Deploying frontend before verifying the backend is actually reachable and healthy — wastes a debugging cycle chasing a frontend error that's actually a backend connectivity problem.
- Forgetting to update `ALLOWED_ORIGINS` after the Vercel domain is known, causing CORS failures that only show up once both pieces are live together.
- Leaving a Vercel preview-deployment password/auth wall enabled, which blocks judges from reaching the app (`docs/13` checklist explicitly calls this out).
- Treating Phase 0's deploy as throwaway and not keeping it working continuously — the whole point of deploying early is to catch platform issues before they're urgent; if Phase 0's deployment is allowed to silently rot, that benefit is lost.

## Prohibited Behavior

Do not introduce a fifth infrastructure vendor or a different deployment mechanism (manual VM, custom CI/CD) without going through the architecture-review skill first — `docs/13` pre-approves Railway as the backend fallback specifically so this situation has a documented answer already.

## Documentation Updates

If the actual deployment process deviates from this playbook (a platform-specific quirk, an extra required step), update this file and `docs/13` in the same change — this playbook is only useful if it stays accurate to what deploying this specific project actually requires.
