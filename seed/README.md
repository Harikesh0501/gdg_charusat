# SkillForge AI — Idempotent Seed Data Scaffolding

This directory contains database seeding scripts for SkillForge AI. Seed scripts populate initial catalog data required for deterministic gap analysis, roadmaps, recommendations, and interview practice:

- `skills.py` — Curated skills taxonomy (~150-250 skills across categories)
- `career_roles.py` — The 6 core seeded career roles (Frontend Engineer, Backend Engineer, Full-Stack Engineer, Data Analyst, Data Scientist/ML Engineer, DevOps/Cloud Engineer)
- `resources.py` — Curated courses, articles, videos, and documentation tagged with skills
- `projects.py` — Hands-on portfolio project templates
- `certifications.py` — Industry certification catalog
- `questions.py` — Interview question bank

## Execution

Run seed scripts via `uv` from the repository root:

```bash
uv run python -m seed.skills
uv run python -m seed.career_roles
```
