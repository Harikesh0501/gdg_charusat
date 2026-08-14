from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.errors import http_exception_handler, unhandled_exception_handler
from app.api import health, auth, profile, resume, skills, career, roadmap, recommendations, interview, progress

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url="/api/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handlers
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

# Register Routers under /api
app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(resume.router, prefix="/api")
app.include_router(skills.router, prefix="/api")
app.include_router(career.router, prefix="/api")
app.include_router(roadmap.router, prefix="/api")
app.include_router(recommendations.router, prefix="/api")
app.include_router(interview.router, prefix="/api")
app.include_router(progress.router, prefix="/api")

# Register Routers under /api/v1 alias so both /api and /api/v1 work seamlessly
app.include_router(health.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")
app.include_router(profile.router, prefix="/api/v1")
app.include_router(resume.router, prefix="/api/v1")
app.include_router(skills.router, prefix="/api/v1")
app.include_router(career.router, prefix="/api/v1")
app.include_router(roadmap.router, prefix="/api/v1")
app.include_router(recommendations.router, prefix="/api/v1")
app.include_router(interview.router, prefix="/api/v1")
app.include_router(progress.router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "docs": "/api/docs",
        "health": "/api/health",
    }
