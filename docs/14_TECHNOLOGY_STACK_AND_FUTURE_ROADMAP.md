# 14 — Technology Stack & Future Roadmap

## CURRENT MVP

| Layer | Technology | Version guidance | Why (see full ADR in the relevant doc) |
|---|---|---|---|
| Frontend framework | Next.js (App Router) | 14.x+ | Doc 01, 12 |
| Language | TypeScript | 5.x | Type-safe contract with backend Pydantic schemas |
| Styling | Tailwind CSS | 3.x | Fast iteration, no design-system build needed |
| Components | shadcn/ui | latest | Copy-in components, no runtime dependency bloat |
| Charts | Recharts | 2.x | Lightweight, React-native API, sufficient for gap bars/radar/progress ring |
| Backend framework | FastAPI | 0.11x | Doc 01, 12 |
| Language | Python | 3.11+ | |
| ORM | SQLAlchemy | 2.0 (async) | |
| Migrations | Alembic | latest | Doc 12 |
| Validation | Pydantic | v2 | Backbone of both API and AI structured-output contracts (doc 06, 12) |
| Database | PostgreSQL | 15+ (Supabase-managed) | Doc 12 |
| Vector extension | pgvector | via Supabase | Doc 07, 09, 12 (P1 semantic resource matching) |
| Object storage | Supabase Storage | | Doc 04 |
| Auth | Supabase Auth | | Doc 02 (zero-cost, consolidated with DB) |
| LLM | Groq (`meta-llama/llama-4-scout-17b-16e-instruct`) | | Doc 06 (Llama 4 Scout, free tier API, high speed) |
| Embeddings | NVIDIA Nemotron 3 Embed 1B (OpenRouter free) / FastEmbed | | Doc 06, 07 (free embeddings) |
| Frontend package manager | Bun | latest | Fast JS runtime & package manager |
| Backend package manager | uv | latest | Ultra-fast Python package & venv manager |
| Frontend hosting | Vercel | | Doc 13 |
| Backend hosting | Render (Docker web service) | | Doc 13 |

## Alternatives Considered (Consolidated)

Already documented per-decision in docs 02 (auth), 04 (background processing), 06 (AI provider), 07 (recommendation approach), 08 (roadmap generation approach), 13 (deployment targets). This document does not re-litigate them — it exists to give a future agent (or judge) a single scannable table of *what* was chosen, cross-referencing *why*.

## Known Limitations of the Current MVP

- Single AI provider — an OpenAI outage degrades personalization quality (to templated fallbacks, doc 06) across all five AI use cases simultaneously.
- Resume parsing is best-effort on PDF/DOCX text-layer extraction — scanned/image-based resumes are not supported (doc 04).
- Recommendation/roadmap quality is bounded by curated seed-data breadth (doc 09) — not a live content pipeline.
- No horizontal scaling — one backend process; background resume processing has no durable retry across restarts (doc 04).
- No admin UI — seed data managed via scripts, not a web interface.
- Career role catalog is fixed at 6 roles — adding a role requires a seed-data change and a deploy, not a self-service flow.

## Future System (Post-Hackathon — Not Built Now)

These are documented so a future agent doesn't accidentally "rediscover" and build them mid-hackathon, mistaking them for MVP scope:

- **Multi-provider AI with automatic failover** (e.g., OpenAI primary, Anthropic secondary) behind the existing `LLMProvider` interface — the interface is already provider-agnostic, so this is additive, not a rewrite.
- **Durable background job processing** (Celery/RQ + Redis, or a managed queue) if resume/roadmap generation volume or reliability requirements grow beyond what in-process `BackgroundTasks` can support.
- **Richer skill graph** with weighted relationship strength, more sophisticated prerequisite inference, possibly community-contributed skill relationships — today's `skill_prerequisites` join table is intentionally minimal.
- **Assessment-based proficiency verification** (`student_skills.source='assessment'` is already reserved in the enum for this) — short skill quizzes that raise confidence beyond self-report/resume-inferred levels.
- **Collaborative-filtering or learned ranking model** for recommendations, once real interaction/completion data exists at volume — today's weighted deterministic scorer (doc 07) is intentionally simple and would be the baseline to beat.
- **Admin/content-management UI** for skills, career roles, and resource seeding, replacing script-based seeding.
- **Notification infrastructure** (email/push reminders to continue a roadmap) — explicitly out of scope per `AGENT.md` §16.
- **Multi-region deployment / horizontal scaling** — not a concern until real production traffic exists.
- **Resume OCR support** for scanned/image PDFs.

## Trade-offs Accepted for the Hackathon

| Traded away | For | Because |
|---|---|---|
| Multi-provider AI resilience | Single-provider simplicity | One integration surface, faster to ship, fallback templates cover outage risk adequately at demo scale (doc 06) |
| Durable job queue | In-process background tasks | No infra to stand up/monitor; failure mode (lost job on crash) is rare and low-impact at demo scale (doc 04) |
| Learned recommendation ranking | Deterministic weighted scoring | Explainable, correct from user #1, no training data needed (doc 07) |
| Large skill knowledge graph | Minimal prerequisite join table | Sufficient for phase ordering; a full graph engine is unjustified complexity (doc 08) |
| Admin CMS | Script-based seeding | No time to build a UI that only the team itself would use during the hackathon (doc 09) |

This table is the single most important artifact for a future agent deciding "should I build X" — if X appears in "Future System" above, the answer is no, unless the user explicitly instructs otherwise (`AGENT.md` §12 governs how that instruction gets recorded).
