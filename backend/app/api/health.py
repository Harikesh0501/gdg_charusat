from fastapi import APIRouter
from app.core.config import settings
from app.ai.providers.groq_provider import GroqProvider

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", summary="Liveness & Readiness Check")
async def health_check():
    groq = GroqProvider()
    ai_status = await groq.ping() if settings.GROQ_API_KEY else "not_configured"

    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "ai_provider": {
            "model": settings.GROQ_MODEL,
            "status": "ready" if ai_status is True else ai_status,
        },
    }
