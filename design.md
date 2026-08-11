# design.md — Product UX & Design System

Governs how the product looks and behaves. Implementation uses Tailwind CSS + shadcn/ui + Recharts only (`AGENT.md` §11) — this document defines the choices made within that toolset, not a license to add new UI libraries.

## Design Principles

1. **Evidence over vibes.** Every claim the UI makes ("you're missing SQL," "72% ready") must be traceable to real data on screen or one click away. No decorative fake precision.
2. **Progress is always visible.** The student should never wonder "did that do anything?" — every action (upload, complete an item, set a goal) has an immediate, visible state change.
3. **Small, not sparse.** This is a focused tool with ~9 screens, not a sprawling app. Resist adding screens/nav items beyond the golden path.
4. **Personalization must be legible.** When two students would see different content, the UI should make it obvious *why* (a gap, a skill, a role) is driving what's shown — never an unexplained "AI suggests..." black box.

## Brand Direction

Professional-but-approachable "career tool," not a childish EdTech product and not a sterile enterprise dashboard. Calm, confident, data-forward — closer to a clean analytics/productivity tool than a marketing site.

## Color Strategy

Use shadcn/ui's default theming (CSS variables, Tailwind `slate` neutral base) as the foundation — do not hand-roll a new palette from scratch. Layer on:

- **Primary accent**: one confident brand hue (e.g., indigo/violet family) for primary actions, active nav, and key data highlights (readiness score, primary CTA buttons).
- **Semantic colors for priority/status** (used consistently everywhere a gap/status appears — skill profile, gap view, roadmap, recommendations):
  - High-priority gap / not-started: warm red-orange
  - Medium-priority gap / in-progress: amber
  - Low-priority gap: neutral slate
  - Mastered / completed: green
- Never use color as the *only* signal for priority/status — pair with a label/icon (accessibility, see below).
- Support light mode only for MVP (dark mode is a P2 nicety, not worth the QA time across every state this build already has to cover).

## Typography

System font stack via Tailwind default (`font-sans`), no custom font loading (avoids FOUT/perf work for zero judging benefit). Scale: one clear display size (dashboard headline numbers, e.g. readiness score), one heading scale (h1-h3 via Tailwind defaults), one body size, one small/caption size for metadata (dates, confidence badges).

## Spacing & Layout

Tailwind's default spacing scale, consistent `4`/`6`/`8` (1rem/1.5rem/2rem) rhythm for section gaps; card padding consistently `p-6`. A single content max-width (e.g., `max-w-5xl`) centered, consistent across all dashboard screens — no per-screen bespoke widths.

## Component Philosophy

- shadcn/ui primitives first (`Card`, `Button`, `Badge`, `Tabs`, `Progress`, `Skeleton`, `Toast`, `Dialog`) — compose, don't reinvent.
- Exactly **one** card pattern for "recommendation-like" items (resource card, project card, certification card, interview question card) — same visual shell (title, meta row, badge row, action), differing only in content, so the codebase has one component to maintain, not four.
- Exactly **one** pattern for "priority-colored list item" — reused for gap list, roadmap item list.

## Responsive Behavior

Golden-path screens (dashboard, skills, gap, roadmap, recommendations) must be usable (not pixel-perfect) at a 375px mobile width: single-column stacking, nav collapses to a bottom bar or hamburger, charts (Recharts) resize to container width via `ResponsiveContainer`. Full desktop layout is the primary design target; mobile is "does not break," not "separately designed."

## Navigation Architecture

Single authenticated app shell: left sidebar (desktop) / bottom nav or drawer (mobile) with items: **Dashboard, Resume, Skills, Roadmap, Recommendations, Interview [P1], Progress**. Career goal selection is not a permanent nav item — it's reached from the Dashboard ("change goal") and is a one-time/occasional action, not a frequent destination.

## Page Hierarchy

```
/ (public landing)
/sign-in, /sign-up (Clerk)
/onboarding
/(app shell — authenticated)
  /dashboard          (default post-login route)
  /resume
  /skills
  /career-goal         (reached via dashboard action, not primary nav)
  /skill-gap
  /roadmap
  /recommendations
  /interview            [P1]
  /progress
```

## Screen Specifications

### Landing (`/`)
- **Purpose/goal**: communicate the value prop in one screen, get the student to sign up.
- **Data**: none (static).
- **Components**: hero, 3-step value explanation ("Upload → Analyze → Plan"), CTA button.
- **Actions**: Sign up, Sign in.
- **API**: none.
- **States**: success only (static page) — no loading/error/empty applicable.

### Onboarding (`/onboarding`)
- **Purpose/goal**: collect minimal profile data to personalize later steps.
- **Data**: none required in; writes `profiles`.
- **Components**: form (name, education level, institution, graduation year, interests multi-select, bio optional).
- **Actions**: Submit → `PUT /api/profile` → redirect to `/resume`.
- **API**: `PUT /api/profile`.
- **Loading**: submit-button spinner. **Error**: inline field errors + toast on submit failure. **Empty**: n/a (form starts blank). **Success**: redirect (no separate success screen needed).

### Resume Upload & Review (`/resume`)
- **Purpose/goal**: get a resume in, show extraction working, let the student trust/edit the result.
- **Data in**: `GET /api/resume/latest`. **Data out**: `POST /api/resume/upload`.
- **Components**: dropzone/file picker, processing indicator (polling `GET /api/resume/{id}/status`), extracted-skills review list (post-processing), "skip and enter manually" link.
- **Actions**: Upload, (post-processing) confirm/edit extracted skills → continue to `/career-goal`, or skip to manual entry.
- **Loading**: processing state — an explicit, named progress indicator ("Reading your resume… Extracting skills…"), not a bare spinner, with a visible max-wait/timeout message if it runs long.
- **Error**: invalid file type/size → inline rejection message + retry; extraction failure → explicit fallback message routing to manual skill entry (never a dead end, per `PRD.md` §22).
- **Empty**: no resume uploaded yet → dropzone is the empty state itself.
- **Success**: extracted skill list shown, editable, with a clear "looks right → continue" action.

### Skill Profile (`/skills`)
- **Purpose/goal**: let the student see and correct their full skill picture.
- **Data**: `GET /api/profile/skills`, `GET /api/skills` (catalog, for the add-skill search).
- **Components**: skills grouped by category, each row showing proficiency (visual bar or dot scale, 0-4), source/confidence badge, edit/remove controls; "add skill" search+select.
- **Actions**: add/edit/remove via `PUT /api/profile/skills`.
- **Loading**: skeleton rows. **Error**: toast + retry. **Empty**: "No skills yet — upload a resume or add skills manually" with a CTA. **Success**: populated grouped list.

### Career Goal Selection (`/career-goal`)
- **Purpose/goal**: pick the target role that drives everything downstream.
- **Data**: `GET /api/career-roles`, `GET /api/career-goal` (current).
- **Components**: role cards (name, short description, category), current-selection highlight.
- **Actions**: select → `POST /api/career-goal` → redirect to `/skill-gap`.
- **Loading**: skeleton cards. **Error**: toast + retry. **Empty**: n/a (catalog always populated via seed). **Success**: selection confirmed, redirect.

### Skill Gap (`/skill-gap`)
- **Purpose/goal**: show the deterministic, evidence-based analysis — the credibility moment.
- **Data**: `GET /api/skill-gap?career_role_id=`.
- **Components**: readiness score (large, headline), mastered-skills list (green), prioritized gap list (color-coded by bucket, per Color Strategy), each gap row showing current vs. required proficiency.
- **Actions**: "Generate my roadmap" CTA → `POST /api/roadmap/generate`.
- **Loading**: skeleton. **Error**: toast + retry ("no active career goal" → redirect to `/career-goal`, this is a 409 case per [12](docs/12_DATA_BACKEND_AND_API_ARCHITECTURE.md)). **Empty**: n/a (always has a result once a goal is set). **Success**: full gap breakdown, CTA to roadmap.

### Roadmap (`/roadmap`)
- **Purpose/goal**: the concrete plan — phases, ordered items, resources/projects attached.
- **Data**: `GET /api/roadmap`.
- **Components**: phase accordion/timeline, item rows (skill/resource/project/milestone type icon, status toggle), phase summary text (AI narrative or fallback template — visually identical either way, per [06](docs/06_AI_PERSONALIZATION_ARCHITECTURE.md) "never expose which path was used").
- **Actions**: toggle item status → `PATCH /api/roadmap/items/{id}`; "regenerate" (explicit, not automatic) → `POST /api/roadmap/generate`.
- **Loading**: skeleton phases. **Error**: toast + retry. **Empty**: "No roadmap yet" CTA → generate (if goal is set) or → `/career-goal`. **Success**: full phased roadmap, progress visibly reflected (item checkmarks).

### Recommendations (`/recommendations`)
- **Purpose/goal**: concrete next actions beyond the roadmap skeleton — resources, projects, (P1) certifications.
- **Data**: `GET /api/recommendations?category=`.
- **Components**: tabs (Resources / Projects / Certifications), the shared recommendation card (title, type/provider badge, difficulty, estimated hours, matched-gap-skill badges, AI explanation text).
- **Actions**: external link out to the resource; mark project as started/completed.
- **Loading**: skeleton cards. **Error**: toast + retry. **Empty**: "No gaps to recommend against yet — set a career goal" (only reachable if goal unset; should not normally be empty once a goal + gaps exist, per [07](docs/07_RECOMMENDATION_ENGINE_ARCHITECTURE.md) guarantee). **Success**: ranked card grid/list.

### Interview Prep (`/interview`) [P1]
- **Purpose/goal**: practice, get feedback, tied to role/gaps/resume projects.
- **Data**: `GET /api/interview/questions?career_role_id=`, `GET /api/interview/attempts`.
- **Components**: question list (category badge), answer textarea, submit, feedback panel (score, strengths, weaknesses, next steps).
- **Actions**: submit answer → `POST /api/interview/attempts`.
- **Loading**: skeleton question list; feedback panel shows an explicit "evaluating your answer…" state. **Error**: AI evaluation failure → answer still shown as saved, feedback panel shows "feedback temporarily unavailable, try again shortly" (per [06](docs/06_AI_PERSONALIZATION_ARCHITECTURE.md) fallback — this is the one place a fallback is visibly named, since there's no good templated substitute for a real evaluation). **Empty**: n/a (question set always populated once a goal exists). **Success**: feedback displayed, attempt saved to history.

### Progress / Dashboard (`/dashboard`, `/progress`)
- **Purpose/goal**: default landing screen; "where am I, what's next" at a glance.
- **Data**: `GET /api/progress`, `GET /api/skill-gap` (top gap), `GET /api/roadmap` (next item).
- **Components**: readiness score (large, with a Recharts radial/progress ring), stat row (skills mastered, gaps remaining, roadmap %, projects completed, [P1] interview readiness), "next up" card (next incomplete roadmap item), (P1) gap-trend line chart from `skill_gap_snapshots`.
- **Actions**: "next up" card links directly into `/roadmap` at that item.
- **Loading**: skeleton stat tiles. **Error**: toast + retry. **Empty**: new user with no goal yet → dashboard shows a single "Get started: set your career goal" CTA instead of empty stat tiles (a designed empty state, not a broken-looking zeroed dashboard). **Success**: full stat dashboard.

## Loading States

Skeleton components (shadcn `Skeleton`) matching the shape of the content they replace — never a generic full-page spinner for content that has a known shape. Full-page spinners are reserved for auth/redirect transitions only. Any operation over ~3s (resume processing, roadmap generation) shows a named, multi-step progress indicator, not a static skeleton.

## Empty States

Every empty state is designed, not accidental — see per-screen specs above. Pattern: short explanatory line + one clear CTA, never a bare "No data."

## Error States

Inline field-level errors for form validation; toast (shadcn `Toast`) for action failures (save, generate, submit) with a retry affordance where the action is safely re-triggerable; full-page error only for a truly unrecoverable route-level failure (rare — most failures degrade to a fallback per [06](docs/06_AI_PERSONALIZATION_ARCHITECTURE.md)/`PRD.md` §22).

## Success States

Prefer in-place UI updates (item now shows a checkmark, score animates to new value) over interstitial "Success!" screens — the product should feel responsive, not ceremonial.

## Toast / Notification Strategy

Toasts for: save confirmations, background action completion (e.g., "Resume processed"), recoverable errors. Never for information the student needs to reference later (that belongs in-page). Auto-dismiss after ~4s; errors persist until dismissed or retried.

## Mobile Behavior

See Responsive Behavior above. No mobile-specific feature reduction — same screens, same data, stacked layout.

## Accessibility

- Color is never the sole signal (priority badges carry text/labels, not just color, per Color Strategy).
- All interactive elements keyboard-navigable (shadcn/ui + Radix primitives provide this by default — do not override focus/keyboard handling).
- Form inputs have associated labels (not placeholder-only labeling).
- Sufficient contrast for body text against background (verify against the chosen accent palette, not just assumed).
- Images/icons carry `alt`/`aria-label` where they convey meaning (status icons, chart elements).

This is a pragmatic accessibility baseline appropriate for a 3-day build — not a full WCAG audit, but not ignored either.

## Interaction Patterns

- Destructive/irreversible actions (removing a skill, regenerating a roadmap that archives the current one) get a confirmation step (shadcn `Dialog` or inline confirm), everything else is single-click.
- Optimistic UI updates for low-risk, easily-reversible actions (toggling a roadmap item's status) — update immediately, reconcile/revert on API failure with a toast.
- Long-running actions (resume processing, roadmap generation) are never blocking modals — the student can navigate away and come back; state persists server-side.
