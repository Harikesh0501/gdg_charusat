---
name: backend-api-development
description: Patterns for adding or modifying FastAPI endpoints in the SkillForge backend. Use for any api/, services/, or repositories/ change.
---

# Backend API Development

## When to Use

Adding a new endpoint, modifying an existing one, or changing business logic in `backend/app/api/`, `services/`, or `repositories/`.

## Prerequisites

`docs/12_DATA_BACKEND_AND_API_ARCHITECTURE.md` (conventions, schema, endpoint table — authoritative), the domain-specific doc for the feature (05/07/08/09/10/11 as applicable), `AGENT.md` §10 (API rules).

## Inputs

The endpoint's entry in `docs/12`'s API table (method, path, purpose, auth). If it's not there, this is an architecture-review-skill situation first (new endpoint = docs update in the same change, not a silent addition).

## Workflow

```
1. Confirm the endpoint exists in docs/12's table, or add it there first (with the
   full detail block: Request/Response/Errors/Validation/Side effects/DB ops/AI ops)
2. Write/extend the Pydantic schema in schemas/ — request and response separately,
   named <Domain><Action>Request / <Domain><Action>Response per convention
3. Write the router function in api/<domain>.py — thin: parse via the dependency-
   injected auth (get_current_user), call the service, return the schema. No business
   logic in the router.
4. Write/extend the service function in services/<domain>.py — this is where business
   logic lives. If it's deterministic logic (gap calc, scoring, ordering), it MUST NOT
   call any AI provider. If it needs AI, it calls ai/orchestrator.py, never the OpenAI
   SDK directly (see ai-integration skill).
5. Write/extend the repository function in repositories/<domain>.py — DB access only,
   no business logic. Always filter by the authenticated profile_id from the service
   layer's CurrentUser — never accept profile_id as a client-supplied parameter.
6. Handle errors via the standard envelope (core/errors.py) — map expected failure
   modes (not-found, validation, conflict, AI failure) to specific status codes, not
   a blanket 500.
7. Add/extend tests (see testing-and-verification skill).
8. Manually verify via the FastAPI /docs interactive UI or a real frontend call before
   considering it done.
```

## Constraints

- Layering is strict: `api/` → `services/` → `repositories/`/`ai/`. Never skip a layer.
- Every protected endpoint derives `profile_id` from the verified JWT (`core/auth.py` dependency) — never from a request body/query param, even if it seems convenient for testing.
- List endpoints return `{"items": [...], "total": n}`; single-resource endpoints return the resource directly — do not invent a third response shape.
- Domain-level operations only — do not add a generic CRUD-over-every-table endpoint (`AGENT.md` §10).

## Implementation Patterns

Standard error envelope: `{"error": {"code": "string", "message": "string"}}`. Standard dependency chain for a protected route:

```python
@router.get("/api/skill-gap")
async def get_skill_gap(
    career_role_id: int,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await skill_gap_service.compute_gap(db, current_user.profile_id, career_role_id)
```

## Verification

- Hit the endpoint via `/docs` (Swagger UI) with a real test JWT.
- Confirm a request with someone else's `profile_id` embedded in any payload field (if applicable) is ignored/rejected, not honored — cross-profile access must be structurally impossible, not just untested.
- Confirm error paths (missing auth, invalid input, not-found) return the standard envelope, not a raw traceback.

## Common Mistakes

- Putting a DB query directly in a router function "just this once."
- Returning ORM model instances directly instead of validated Pydantic response schemas (leaks internal fields, breaks the documented response contract).
- Forgetting to update `docs/12`'s endpoint table when adding a genuinely new endpoint.

## Prohibited Behavior

Do not implement an endpoint whose behavior isn't traceable to a `docs/` spec. Do not let a service function silently call an AI provider for something `docs/05`/`07`/`08`/`11` defines as deterministic.

## Documentation Updates

Update `docs/12` if the endpoint list/schema changed. Update `workdone.md` per the workdone-maintenance skill.
