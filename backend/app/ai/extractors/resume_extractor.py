import logging
from app.ai.providers.groq_provider import GroqProvider
from app.ai.schemas.resume_extraction import ResumeExtractionResult
from app.ai.prompts.resume_prompts import (
    RESUME_EXTRACTION_SYSTEM_PROMPT,
    RESUME_EXTRACTION_USER_PROMPT_TEMPLATE,
)

logger = logging.getLogger(__name__)


class ResumeExtractor:
    def __init__(self, provider: GroqProvider | None = None):
        self.provider = provider or GroqProvider()

    async def extract_resume(self, resume_text: str) -> ResumeExtractionResult:
        """
        Extracts structured skill, project, education, and experience data from raw resume text using LLM.
        """
        user_prompt = RESUME_EXTRACTION_USER_PROMPT_TEMPLATE.format(resume_text=resume_text)

        try:
            result = await self.provider.generate_structured(
                system=RESUME_EXTRACTION_SYSTEM_PROMPT,
                user=user_prompt,
                schema=ResumeExtractionResult,
                max_retries=2,
            )
            return result
        except Exception as e:
            logger.error(f"Resume extraction failed: {e}")
            raise RuntimeError(f"AI resume extraction failed: {e}")
