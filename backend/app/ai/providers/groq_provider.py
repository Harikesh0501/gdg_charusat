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
    def __init__(self, api_keys: list[str] | None = None, model: str | None = None):
        self.api_keys = api_keys or settings.get_groq_api_keys()
        self.model = model or settings.GROQ_MODEL

    def _get_client(self, api_key: str) -> AsyncGroq:
        return AsyncGroq(api_key=api_key)

    async def ping(self) -> bool:
        if not self.api_keys:
            return False

        for key in self.api_keys:
            try:
                client = self._get_client(key)
                response = await client.chat.completions.create(
                    messages=[{"role": "user", "content": "ping"}],
                    model=self.model,
                    max_tokens=5,
                )
                if response.choices and len(response.choices) > 0:
                    return True
            except Exception as e:
                logger.warning(f"Groq provider ping failed for key ending in ...{key[-4:]}: {e}")

        return False

    async def generate_structured(
        self,
        *,
        system: str,
        user: str,
        schema: Type[T],
        max_retries: int = 1,
    ) -> T:
        if not self.api_keys:
            raise RuntimeError("No GROQ_API_KEY is configured")

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
        # Key rotation loop
        for key_index, key in enumerate(self.api_keys):
            try:
                client = self._get_client(key)
                for attempt in range(max_retries + 1):
                    try:
                        response = await client.chat.completions.create(
                            messages=messages,
                            model=self.model,
                            response_format={"type": "json_object"},
                            temperature=0.2,
                        )

                        raw_json = response.choices[0].message.content
                        parsed = json.loads(raw_json)
                        return schema.model_validate(parsed)

                    except (ValidationError, json.JSONDecodeError) as e:
                        last_error = e
                        logger.warning(f"Groq structured generation attempt {attempt + 1} failed: {e}")
                        if attempt < max_retries:
                            messages.append(
                                {
                                    "role": "user",
                                    "content": f"Your previous response failed validation: {e}. Output ONLY valid JSON matching the schema.",
                                }
                            )

            except Exception as api_err:
                last_error = api_err
                logger.warning(f"Groq API key {key_index + 1}/{len(self.api_keys)} failed: {api_err}. Rotating to fallback key...")

        raise RuntimeError(f"Groq structured output failed across all {len(self.api_keys)} keys: {last_error}")
