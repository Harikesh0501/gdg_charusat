import json
import logging
from typing import Type, TypeVar
from pydantic import BaseModel, ValidationError
from groq import AsyncGroq
from app.core.config import settings
from app.ai.providers.base import LLMProvider

logger = logging.getLogger(__name__)
T = TypeVar("T", bound=BaseModel)


class GroqProvider(LLMProvider):
    def __init__(self, api_key: str | None = None, model: str | None = None):
        self.api_key = api_key or settings.GROQ_API_KEY
        self.model = model or settings.GROQ_MODEL
        self.client = AsyncGroq(api_key=self.api_key) if self.api_key else None

    async def ping(self) -> bool:
        if not self.client:
            return False
        try:
            response = await self.client.chat.completions.create(
                messages=[{"role": "user", "content": "ping"}],
                model=self.model,
                max_tokens=5,
            )
            return bool(response.choices and len(response.choices) > 0)
        except Exception as e:
            logger.warning(f"Groq provider ping failed: {e}")
            return False

    async def generate_structured(
        self,
        *,
        system: str,
        user: str,
        schema: Type[T],
        max_retries: int = 1,
    ) -> T:
        if not self.client:
            raise RuntimeError("GROQ_API_KEY is not configured")

        json_schema_prompt = (
            f"{system}\n\n"
            f"You MUST respond ONLY with a valid JSON object strictly adhering to this JSON Schema:\n"
            f"```json\n{json.dumps(schema.model_json_schema(), indent=2)}\n```\n"
            f"Do NOT include any markdown formatting wrappers or conversational text outside the JSON."
        )

        messages = [
            {"role": "system", "content": json_schema_prompt},
            {"role": "user", "content": user},
        ]

        last_error = None
        for attempt in range(max_retries + 1):
            try:
                response = await self.client.chat.completions.create(
                    messages=messages,
                    model=self.model,
                    response_format={"type": "json_object"},
                    temperature=0.2,
                )

                raw_json = response.choices[0].message.content
                parsed = json.loads(raw_json)
                return schema.model_validate(parsed)

            except (ValidationError, json.JSONDecodeError, Exception) as e:
                last_error = e
                logger.warning(f"Groq structured generation attempt {attempt + 1} failed: {e}")
                if attempt < max_retries:
                    messages.append(
                        {
                            "role": "user",
                            "content": f"Your previous response failed validation: {e}. Output ONLY valid JSON matching the schema.",
                        }
                    )

        raise RuntimeError(f"Groq structured output failed after retries: {last_error}")
