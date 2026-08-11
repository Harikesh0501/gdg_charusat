import logging
import httpx
from app.core.config import settings
from app.ai.providers.base import EmbeddingProvider

logger = logging.getLogger(__name__)


class OpenRouterEmbeddingProvider(EmbeddingProvider):
    def __init__(self, api_key: str | None = None, model: str | None = None):
        self.api_key = api_key or settings.OPENROUTER_API_KEY
        self.model = model or settings.OPENROUTER_EMBEDDING_MODEL
        self.fastembed_model = None

    async def _embed_fastembed(self, texts: list[str]) -> list[list[float]]:
        try:
            from fastembed import TextEmbedding
            if self.fastembed_model is None:
                self.fastembed_model = TextEmbedding("BAAI/bge-small-en-v1.5")
            embeddings_generator = self.fastembed_model.embed(texts)
            return [embedding.tolist() for embedding in embeddings_generator]
        except Exception as e:
            logger.error(f"FastEmbed fallback failed: {e}")
            raise e

    async def embed(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []

        if self.api_key:
            try:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    response = await client.post(
                        "https://openrouter.ai/api/v1/embeddings",
                        headers={
                            "Authorization": f"Bearer {self.api_key}",
                            "Content-Type": "application/json",
                        },
                        json={
                            "model": self.model,
                            "input": texts,
                        },
                    )
                    if response.status_code == 200:
                        data = response.json()
                        return [item["embedding"] for item in data["data"]]
                    else:
                        logger.warning(f"OpenRouter embedding API returned {response.status_code}: {response.text}")
            except Exception as e:
                logger.warning(f"OpenRouter embedding call failed, dropping to FastEmbed fallback: {e}")

        # Fallback to local FastEmbed
        return await self._embed_fastembed(texts)
