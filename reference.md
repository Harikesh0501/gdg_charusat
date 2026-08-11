# reference.md — Technical Reference Index

Curated pointers to official documentation this project depends on. Each entry says what it is, why we use it, which module depends on it, and what to actually learn from it — not a link dump. Prefer this list over an open-ended web search when implementing; it's scoped to what this project actually needs.

## Frontend

### Next.js (App Router)
- **What**: React framework, file-based routing, server/client components.
- **Why**: chosen frontend framework, [01](docs/01_PROJECT_OVERVIEW_AND_SYSTEM_REQUIREMENTS.md), [14](docs/14_TECHNOLOGY_STACK_AND_FUTURE_ROADMAP.md).
- **Depends on it**: entire `frontend/` app.
- **Learn**: App Router data-fetching patterns (server components vs. client components — most of this product's authenticated screens need client-side fetching since they depend on the Clerk session; know when a server component is still the right call for static content like the landing page), route groups (`(app shell)`), middleware for route protection.
- **Docs**: https://nextjs.org/docs

### Clerk (Next.js SDK)
- **What**: managed auth provider.
- **Why**: [02_USER_ACCESS_AND_AUTHENTICATION_ARCHITECTURE.md](docs/02_USER_ACCESS_AND_AUTHENTICATION_ARCHITECTURE.md).
- **Depends on it**: `frontend/middleware.ts`, all protected routes, `api/auth`, `core/auth.py` (backend JWT verification).
- **Learn**: `clerkMiddleware` route matching, `<SignIn>`/`<SignUp>`/`<UserButton>` components, how to get a session JWT client-side to attach to backend requests, and how to verify that JWT server-side against Clerk's JWKS endpoint (needed for the FastAPI dependency).
- **Docs**: https://clerk.com/docs, specifically the Next.js quickstart and the "Verify a session token" backend guide.

### Tailwind CSS
- **What**: utility-first CSS framework.
- **Why**: [AGENT.md](AGENT.md) §11, [design.md](design.md).
- **Learn**: configuring the theme (colors, spacing) via `tailwind.config.ts` to match `design.md`'s color/spacing strategy.
- **Docs**: https://tailwindcss.com/docs

### shadcn/ui
- **What**: copy-in component library built on Radix primitives + Tailwind.
- **Why**: [design.md](design.md) component philosophy — no runtime UI-library dependency, full control over generated code.
- **Learn**: the CLI (`npx shadcn@latest add <component>`), theming via CSS variables (this is how the accent color from `design.md` gets applied globally).
- **Docs**: https://ui.shadcn.com/docs

### Recharts
- **What**: charting library for React.
- **Why**: readiness ring, gap bars, progress dashboard ([11](docs/11_PROGRESS_AND_ANALYTICS_ARCHITECTURE.md), [design.md](design.md)).
- **Learn**: `ResponsiveContainer` (required for the mobile-responsive requirement in `design.md`), `RadialBarChart` (readiness score), `BarChart`/`LineChart` (gap breakdown, P1 trend).
- **Docs**: https://recharts.org/en-US/api

## Backend

### FastAPI
- **What**: async Python web framework.
- **Why**: [01](docs/01_PROJECT_OVERVIEW_AND_SYSTEM_REQUIREMENTS.md), [12](docs/12_DATA_BACKEND_AND_API_ARCHITECTURE.md).
- **Depends on it**: entire `backend/app/api/` layer.
- **Learn**: dependency injection (`Depends`, used for `get_current_user` and DB session), `BackgroundTasks` (resume processing, [04](docs/04_RESUME_PROCESSING_ARCHITECTURE.md)), exception handlers (standard error envelope, [12](docs/12_DATA_BACKEND_AND_API_ARCHITECTURE.md)).
- **Docs**: https://fastapi.tiangolo.com/

### SQLAlchemy 2.0 (async)
- **What**: ORM.
- **Why**: [12](docs/12_DATA_BACKEND_AND_API_ARCHITECTURE.md) `models/`, `repositories/`.
- **Learn**: 2.0-style declarative models, async session usage with FastAPI dependencies, relationship loading strategies (avoid N+1 on `roadmap_phases`→`roadmap_items`, `career_role_skills`→`skills`).
- **Docs**: https://docs.sqlalchemy.org/en/20/

### Alembic
- **What**: migration tool for SQLAlchemy.
- **Why**: [AGENT.md](AGENT.md) §9 — every schema change is a migration.
- **Learn**: autogenerate workflow, reviewing generated diffs, writing `downgrade()`.
- **Docs**: https://alembic.sqlalchemy.org/en/latest/

### Pydantic v2
- **What**: validation/schema library.
- **Why**: API request/response schemas *and* AI structured-output schemas ([06](docs/06_AI_PERSONALIZATION_ARCHITECTURE.md), [12](docs/12_DATA_BACKEND_AND_API_ARCHITECTURE.md)).
- **Learn**: `Field` constraints (`max_length`, `ge`/`le` — used throughout the AI schemas in doc 06), `model_validate`, JSON schema export (needed to hand a schema to OpenAI's structured-output mode).
- **Docs**: https://docs.pydantic.dev/latest/

## Database

### PostgreSQL
- **Why**: [12](docs/12_DATA_BACKEND_AND_API_ARCHITECTURE.md) primary datastore.
- **Docs**: https://www.postgresql.org/docs/

### pgvector
- **What**: Postgres extension for vector similarity search.
- **Why**: `resources.embedding`, P1 semantic recommendation blending ([07](docs/07_RECOMMENDATION_ENGINE_ARCHITECTURE.md), [09](docs/09_PROJECT_RESOURCE_AND_CERTIFICATION_SYSTEM.md)).
- **Learn**: enabling the extension in Supabase, the `vector` column type, cosine-distance operators (`<=>`), when/how to add an IVFFlat/HNSW index (not needed until resource count is much larger than MVP seed scale — [12](docs/12_DATA_BACKEND_AND_API_ARCHITECTURE.md) explicitly defers this).
- **Docs**: https://github.com/pgvector/pgvector

### Supabase (Postgres + Storage)
- **Why**: managed DB + object storage host, [13](docs/13_INFRASTRUCTURE_SECURITY_AND_DEPLOYMENT.md).
- **Learn**: connection string format for SQLAlchemy, Storage bucket privacy settings + signed URL generation (resumes must stay private, [04](docs/04_RESUME_PROCESSING_ARCHITECTURE.md)).
- **Docs**: https://supabase.com/docs

## AI Provider

### OpenAI API
- **What**: LLM (`gpt-4o-mini`) + embeddings (`text-embedding-3-small`).
- **Why**: [06_AI_PERSONALIZATION_ARCHITECTURE.md](docs/06_AI_PERSONALIZATION_ARCHITECTURE.md).
- **Depends on it**: `ai/providers/openai_provider.py` exclusively — no other module should import the OpenAI SDK directly.
- **Learn**: Structured Outputs (`response_format={"type": "json_schema", ...}`, strict mode) — this is the mechanism doc 06's "Structured Outputs & Validation" section relies on; the embeddings endpoint for batch embedding resource descriptions.
- **Docs**: https://platform.openai.com/docs/guides/structured-outputs, https://platform.openai.com/docs/guides/embeddings

### Prompt Engineering (Internal Convention, Not External Doc)
Prompt structure/injection-mitigation conventions are defined in [06_AI_PERSONALIZATION_ARCHITECTURE.md](docs/06_AI_PERSONALIZATION_ARCHITECTURE.md) — that document is authoritative for this project; do not import a generic "prompt engineering guide" pattern that conflicts with the delimited-block/system-separation rule already established there.

## Resume Parsing

### pdfplumber
- **Why**: PDF text extraction, [04](docs/04_RESUME_PROCESSING_ARCHITECTURE.md).
- **Learn**: `.extract_text()` per page, handling multi-column layouts (common resume-parsing failure mode — know the limitation, don't over-engineer a fix).
- **Docs**: https://github.com/jsvine/pdfplumber

### python-docx
- **Why**: DOCX text extraction, [04](docs/04_RESUME_PROCESSING_ARCHITECTURE.md).
- **Docs**: https://python-docx.readthedocs.io/

### rapidfuzz
- **Why**: skill-name fuzzy matching against the `skills`/`aliases` taxonomy during normalization, [04](docs/04_RESUME_PROCESSING_ARCHITECTURE.md).
- **Docs**: https://rapidfuzz.github.io/RapidFuzz/

## Deployment

### Vercel
- **Why**: frontend hosting, [13](docs/13_INFRASTRUCTURE_SECURITY_AND_DEPLOYMENT.md).
- **Learn**: environment variable configuration per environment (production vs. preview), custom domains if used.
- **Docs**: https://vercel.com/docs

### Render
- **Why**: backend hosting (Docker web service), [13](docs/13_INFRASTRUCTURE_SECURITY_AND_DEPLOYMENT.md).
- **Learn**: Docker-based web service deploys, environment groups, health check configuration.
- **Docs**: https://render.com/docs

## Security

- OWASP API Security Top 10 — background awareness for [PRD.md](PRD.md) §19 and [13](docs/13_INFRASTRUCTURE_SECURITY_AND_DEPLOYMENT.md): https://owasp.org/www-project-api-security/
- OWASP guidance on LLM prompt injection — background for [06](docs/06_AI_PERSONALIZATION_ARCHITECTURE.md) §Prompt Injection Considerations: https://owasp.org/www-project-top-10-for-large-language-model-applications/

## UI Reference

- Radix UI primitives (underlying shadcn/ui): https://www.radix-ui.com/primitives/docs/overview/introduction — useful when a shadcn component needs behavior customization beyond the default.
