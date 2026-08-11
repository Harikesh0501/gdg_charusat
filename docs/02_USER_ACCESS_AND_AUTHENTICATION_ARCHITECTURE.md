# 02 — User Access & Authentication Architecture

## Decision (Updated: 2026-08-11)

Use **Supabase Auth** as the managed identity provider for both frontend session management and backend request authentication (superseding the earlier Clerk decision per user preference and stack consolidation). The backend never stores passwords directly.

### Context

We need sign-up/sign-in/session/logout working reliably with zero cost, zero extra external accounts, integrated cleanly with Next.js (frontend via `@supabase/ssr` / `@supabase/supabase-js`) and FastAPI (backend JWT verification using Supabase JWT secret / public key).

### Alternatives Considered

- **Clerk** — originally considered for prebuilt UI components; replaced because the user requested no Clerk account dependency, and Supabase Auth consolidates auth directly into our existing database provider (Supabase) at zero cost.
- **Hand-rolled auth in FastAPI** — full control, but requires password hashing, reset flows, and session management code.
- **NextAuth.js / Auth.js** — good Next.js integration, but backend FastAPI JWT verification requires extra setup compared to Supabase Auth's standard JWTs.

### Decision Rationale

Supabase Auth is built into Supabase (our primary database and object storage host). It provides free email/password sign-up, session handling, and standard RS256/HS256 JWTs easily verifiable by FastAPI. Consolidating database, storage, and authentication into Supabase simplifies key management to a single project dashboard.

### MVP Justification

Zero cost, zero additional vendor sign-up required, built into our existing Supabase instance.

### Consequences

- Frontend uses `@supabase/ssr` / `@supabase/supabase-js` for auth flows and session management.
- Backend verifies Supabase JWTs (`Authorization: Bearer <supabase_jwt>`) using the Supabase JWT secret / public key in `get_current_user`.
- Single vendor for DB + Storage + Auth.

### Constraints (future agents must respect)

- Do not store Supabase service role keys in frontend code; only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are exposed client-side. The `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_JWT_SECRET` stay backend-only.

### Reversal Criteria

If Supabase Auth is unavailable, fall back to simple FastAPI JWT issuance.

---

## User Lifecycle

1. **Registration** — Supabase Auth `signUp()` (email/password).
2. **First login sync** — frontend calls `POST /api/auth/sync` after first successful Supabase sign-in. Backend verifies the JWT, and upserts a row into `users` (by `supabase_user_id`) and an empty `profiles` row if one doesn't exist. This is the *only* place `users`/`profiles` rows are created.
3. **Onboarding** — if `profiles.onboarding_completed = false`, frontend routes to `/onboarding` instead of `/dashboard` after login (see [03](03_STUDENT_PROFILE_AND_SKILL_INTELLIGENCE.md)).
4. **Login** — Supabase Auth `signInWithPassword()`.
5. **Logout** — Supabase Auth `signOut()`; clears session client-side, backend has no session state to invalidate (stateless JWT verification per request).
6. **Session refresh** — handled entirely by Supabase SDK (silent token refresh).

## Identity Provider Integration

- Frontend: `@supabase/ssr` middleware protects all routes under `/dashboard`, `/onboarding`, `/resume`, `/roadmap`, etc. Unauthenticated users are redirected to `/sign-in`. `/` (landing) is public.
- Backend: a FastAPI dependency `get_current_user` verifies the `Authorization: Bearer <token>` JWT against Supabase JWT verification, extracts `supabase_user_id` (the `sub` claim), and loads the corresponding `users`/`profiles` row. Every protected router depends on this.

## User / Profile Relationship

`users` (1) — (1) `profiles`. `users` mirrors Supabase identity minimally (`supabase_user_id`, `email`). `profiles` holds all product data (education, interests, onboarding state) and is the foreign key target for skills, resumes, roadmaps, etc. Rationale: keeps the "identity" concept separate from the "product profile" concept — see [03](03_STUDENT_PROFILE_AND_SKILL_INTELLIGENCE.md) and [12](12_DATA_BACKEND_AND_API_ARCHITECTURE.md) for the full schema.

## Authorization

MVP has a single role: authenticated student. There is no admin UI, no multi-role RBAC. Every protected endpoint's authorization rule is identical: "the requester's `profile_id`, derived from their verified JWT, must match the resource's owning `profile_id`." No cross-profile reads are ever permitted (a student cannot view another student's data — enforced by always filtering repository queries by the authenticated `profile_id`, never a client-supplied one).

## Protected Routes

Frontend: everything except `/`, `/sign-in`, `/sign-up` requires an authenticated session (Supabase SSR middleware config).

Backend: everything except `GET /api/health`, `GET /api/career-roles` (public catalog, read-only, no student data), and `GET /api/skills` (public catalog) requires a verified JWT.

## Backend Authentication Verification (Implementation Pattern)

```
Request → Authorization: Bearer <supabase_jwt>
        → get_current_user dependency
            → verify signature via Supabase JWT secret / public key
            → verify exp/iss/aud
            → extract sub (supabase_user_id)
            → SELECT users JOIN profiles WHERE supabase_user_id = sub
            → 401 if missing/invalid, 404-equivalent (not exposed) if user row absent → trigger sync flow client-side
        → route handler receives CurrentUser(profile_id, user_id)
```

## Failure Cases

| Case | Behavior |
|---|---|
| Missing/expired JWT | 401, standard error envelope, frontend redirects to `/sign-in` |
| Valid JWT, no `users` row yet | Frontend detects via `/api/auth/sync` response and completes sync before proceeding — should not normally reach other endpoints in this state |
| Supabase Auth service unreachable | 503 on protected endpoints; log the failure; this is a hard dependency outage, no local fallback |
| Malformed Authorization header | 401 |

## Security Considerations

- JWT verified on every request (no server-side session store to trust instead).
- `profile_id` never accepted from client input on any endpoint — always derived from the token server-side.
- CORS restricted to the deployed frontend origin + localhost dev origin (see [13](13_INFRASTRUCTURE_SECURITY_AND_DEPLOYMENT.md)).
- Supabase Service Role Key and JWT Secret stored only in backend environment variables, never committed, never exposed to frontend bundle.
