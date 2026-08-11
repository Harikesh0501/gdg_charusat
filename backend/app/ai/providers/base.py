from typing import Protocol, TypeVar, Type
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


class LLMProvider(Protocol):
    async def generate_structured(
        self,
        *,
        system: str,
        user: str,
        schema: Type[T],
        max_retries: int = 1,
    ) -> T:
        ...

    async def ping(self) -> bool:
        ...


class EmbeddingProvider(Protocol):
    async def embed(self, texts: list[str]) -> list[list[float]]:
        ...
