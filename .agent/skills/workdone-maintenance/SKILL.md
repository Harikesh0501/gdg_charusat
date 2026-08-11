---
name: workdone-maintenance
description: When and how to update workdone.md, the project's persistent engineering memory. Use after any implementation work, user correction, or rejected approach.
---

# Workdone Maintenance

## When to Use

- After completing any implementation work (feature, bugfix, phase) — mandatory per `AGENT.md` §14, not optional.
- Immediately when the user corrects your approach or rejects something you proposed — don't wait until end of session, the correction can be forgotten or diluted by the time you'd otherwise write it up.
- Immediately when the user confirms a non-obvious approach worked ("yes exactly," "keep doing that") — quiet confirmations matter as much as corrections; they prevent a future agent from re-litigating a settled, validated choice.
- When an architectural decision changes (in coordination with the architecture-review skill, which updates `docs/`; this skill records the change in memory).

## Prerequisites

Read the "How to Use This File" section at the top of `workdone.md` itself — it is the authoritative format guide; this skill summarizes it but `workdone.md` wins if they ever diverge (update this skill file if that happens).

## Workflow

```
1. Determine which section(s) need an update:
   - New implementation → "Implementation History" (always, one dated entry)
   - A rejected suggestion/approach → "Rejected Approaches"
   - Explicit user feedback/preference → "User Preferences / Explicit Feedback"
   - A changed architectural decision → "Architectural Decisions Changed During
     Development" (old decision + new decision, both stated)
   - A durable rule discovered while implementing (not project-specific fact, but a
     "how we work here" rule) → "Engineering Rules Learned During Implementation"
2. Write the Implementation History entry using the full structured template already
   defined in workdone.md: Task, Intended Outcome, Implementation, Files Changed,
   Problems Encountered, Agent Mistakes, Why the Mistake Happened, User Feedback,
   Requested Changes, Final Decision, Verification, Remaining Issues, Lessons for
   Future Agents.
3. Be honest in "Agent Mistakes" and "Why the Mistake Happened" — this section only
   has value if it's candid; a sanitized account that omits what actually went wrong
   defeats the entire purpose of the file.
4. Convert relative dates in your own entry to absolute dates (matches the project
   convention already used elsewhere, e.g. in phases.md).
5. Cross-check: if this entry describes an architectural decision changing, confirm
   the corresponding docs/NN_*.md file was also updated (architecture-review skill) —
   workdone.md is memory of the change, not a substitute for updating current truth.
```

## Constraints

- Do not write a changelog-style one-liner ("implemented resume upload") as a substitute for the structured entry — the value is in the *why* and the *mistakes/lessons*, which a one-liner discards.
- Do not batch multiple unrelated features into a single entry — one dated entry per meaningful unit of work, so future agents can find the specific one relevant to them.
- Do not delete or rewrite past entries to "clean up" the file — this is a historical record; if a past decision was later reversed, add a new entry noting the reversal (with a reference back), don't erase the original.

## Common Mistakes

- Forgetting to record a rejection because it happened mid-conversation and felt "obvious in the moment" — it won't be obvious to an agent reading this file cold in a future session.
- Writing "Lessons for Future Agents" as generic advice ("write clean code") instead of something specific and non-obvious to this exact feature/module.

## Prohibited Behavior

Do not skip this update because a task felt small — the threshold is "meaningful implementation work," which includes most feature/bugfix work, not just full phases. Trivial one-line typo fixes are the main exception.

## Documentation Updates

This skill's entire purpose is a documentation update. There is no separate "documentation updates" step beyond executing this skill correctly.
