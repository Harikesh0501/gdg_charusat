---
name: database-migration
description: How to make any schema change to the SkillForge database safely. Use for any new table, column, index, or constraint.
---

# Database Migration

## When to Use

Any change to `backend/app/models/` (SQLAlchemy models) — new table, new column, changed column type/constraint, new index, new enum value.

## Prerequisites

`docs/12_DATA_BACKEND_AND_API_ARCHITECTURE.md` (authoritative schema — the change must either already be reflected there, or you update it in the same change), `AGENT.md` §9 (database rules).

## Workflow

```
1. Confirm the change against docs/12 — is this schema already documented? If not,
   update docs/12's schema block first (new table/column with its purpose stated) —
   this is not bureaucracy, it's what keeps docs/12 the actual source of truth instead
   of drifting from reality.
2. Modify the SQLAlchemy model(s) in models/
3. Generate the migration: alembic revision --autogenerate -m "short_description"
4. Review the generated migration file by hand — autogenerate is a starting point,
   not a guarantee. Check especially: enum changes (autogenerate sometimes misses
   these), index creation, nullable/default value correctness, and that unrelated
   tables weren't accidentally included in the diff (can happen if the local DB state
   has drifted).
5. Write/verify the downgrade() function — do not leave it as a bare `pass` if the
   upgrade did anything non-trivial.
6. Run the migration locally against a dev database: alembic upgrade head
7. If the change affects existing rows (e.g., a new NOT NULL column on a table that
   may already have rows in a shared dev DB), include a data-backfill step in the
   migration or make the column nullable with an application-level default instead —
   do not write a migration that will fail against existing data.
8. Update any affected repositories/services/schemas in the same change — a schema
   change is rarely just a schema change.
```

## Constraints

- No manual `ALTER TABLE` / manual edits via Supabase Studio for anything that needs to persist across environments — `AGENT.md` §9. A manual DB edit made "just to test something quickly" must still be followed by a real migration, or reverted, before moving on.
- Do not add a table that duplicates an existing source of truth — check `docs/12`'s entity list first; e.g., skill gaps are computed on demand from `student_skills`/`career_role_skills`, not stored as a primary table (`skill_gap_snapshots` is an explicit, narrow exception for history only — see `docs/11`).
- Seed data scripts (`seed/`) must remain idempotent (safe to re-run) — if a migration changes a table seed data populates, verify the seed script still works after `alembic upgrade head`.

## Verification

- `alembic upgrade head` then `alembic downgrade -1` then `alembic upgrade head` again locally — confirms the downgrade path actually works, not just exists.
- Re-run relevant seed scripts after a migration that touches seeded tables.

## Common Mistakes

- Trusting autogenerate blindly on enum type changes (a common Alembic/Postgres rough edge) — always hand-verify these.
- Adding a `NOT NULL` column without a default against a table that might already have rows in the shared dev/staging database, causing the migration to fail on deploy.
- Forgetting to update `docs/12` — the most common way this document quietly goes stale.

## Prohibited Behavior

Do not skip writing a migration for a "quick" schema tweak. Do not commit a migration whose `downgrade()` would leave the database in a broken state.

## Documentation Updates

Update `docs/12_DATA_BACKEND_AND_API_ARCHITECTURE.md`'s schema section in the same change as any schema-altering migration. Update `workdone.md` per the workdone-maintenance skill, especially if the migration revealed a design assumption in `docs/12` that was wrong.
