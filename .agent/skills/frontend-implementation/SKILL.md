---
name: frontend-implementation
description: Patterns for building or modifying SkillForge Next.js screens and components. Use for any frontend/ change, including UI polish.
---

# Frontend Implementation

## When to Use

Building a new screen, modifying an existing one, adding a component, or doing UI polish work (this skill also covers what was separately proposed as "ui-polish" — it's not a distinct enough workflow to warrant its own playbook).

## Prerequisites

`design.md` (screen spec for the page you're building — purpose, required data, components, all four UX states), `docs/12` (API contract for the data this screen needs), `AGENT.md` §11 (frontend rules).

## Inputs

The relevant screen specification in `design.md`'s "Screen Specifications" section. If you're building something not listed there, add its spec to `design.md` first (small addition, not a big process) so the UX states are planned, not improvised mid-implementation.

## Workflow

```
1. Read the screen's spec in design.md — purpose, data dependencies, components, actions
2. Identify the API calls needed (docs/12) — write/extend a typed hook in lib/api/ 
   (one hook per endpoint, e.g. useSkillGap(careerRoleId)) rather than inline fetch calls
   scattered across components
3. Build the component using shadcn/ui primitives first — check if an existing shared
   pattern applies before creating a new component (the recommendation-card pattern and
   priority-colored-list-item pattern, per design.md, are meant to be reused, not
   reinvented per screen)
4. Implement all four states explicitly: loading (Skeleton matching real content shape),
   error (toast + inline retry where applicable), empty (per design.md's designed empty
   state for that screen, not a generic "no data"), success
5. Wire up actions (forms, buttons) to the real API — never leave mock/hardcoded data
   in a component you're calling "done"
6. Check responsive behavior at ~375px width (design.md Responsive Behavior) for any
   golden-path screen
7. Check accessibility basics (design.md Accessibility) — labels, keyboard nav,
   color-not-as-sole-signal for priority/status indicators
8. Manually test in a real browser against the running backend (not just visual review
   of the component in isolation) before considering it done
```

## Constraints

- Use Clerk's middleware for route protection — do not hand-roll session/redirect logic.
- Use Tailwind + shadcn/ui only — no new component/CSS library.
- Charts use Recharts exclusively, with `ResponsiveContainer`.
- One card pattern for recommendation-like items, one pattern for priority-colored list items — reuse, per `design.md` Component Philosophy.

## Implementation Patterns

Typed API hook pattern (`lib/api/skillGap.ts`):

```ts
export function useSkillGap(careerRoleId: number) {
  return useQuery({
    queryKey: ["skill-gap", careerRoleId],
    queryFn: () => apiClient.get<SkillGapResponse>(`/api/skill-gap?career_role_id=${careerRoleId}`),
  });
}
```

(Exact data-fetching library — e.g. TanStack Query vs. plain SWR vs. server actions — is an implementation detail not fixed by architecture docs; pick one in Phase 0 and use it consistently everywhere, don't mix approaches across screens.)

## Verification

Load the screen with: no data (empty state), a slow/failed API call (loading then error state), and real data (success state) — all three, not just the happy path, before marking a screen done. This directly enforces `AGENT.md` §15's "Frontend covers loading/error/empty/success states" Definition-of-Done item.

## Common Mistakes

- Shipping a screen that only handles the success case, with a bare spinner for loading and no error handling — this fails Definition of Done even if it "looks fine" in a quick demo click-through.
- Leaving hardcoded/mock data wired into a component after the real backend endpoint exists.
- Inventing a new visual pattern for something `design.md` already has a pattern for (check before building).

## Prohibited Behavior

Do not add a new UI library, new CSS approach, or new charting library. Do not build a screen not described in `design.md` without adding its spec there first.

## Documentation Updates

If a screen's real requirements diverge from what `design.md` describes (e.g., a data field turns out to be needed that wasn't planned), update `design.md`'s screen spec in the same change. Update `workdone.md` per the workdone-maintenance skill.
