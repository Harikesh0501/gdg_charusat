import os
import json
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "SkillForge AI Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/skillforge"

    # Supabase Auth
    SUPABASE_URL: str = ""
    SUPABASE_JWT_SECRET: str = "super-secret-jwt-key-replace-in-env"

    # AI Providers (Groq Keys & Model)
    GROQ_API_KEY: str = ""
    GROQ_API_KEYS: Union[str, List[str]] = []
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # OpenRouter Keys & Model
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_API_KEYS: Union[str, List[str]] = []
    OPENROUTER_EMBEDDING_MODEL: str = "nvidia/nemotron-3-embed-1b"

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    def _parse_keys(self, single_key: str, multi_keys: Union[str, List[str]], env_prefix: str) -> List[str]:
        keys = []
        if single_key and single_key.strip():
            keys.append(single_key.strip())

        if isinstance(multi_keys, str) and multi_keys.strip():
            if multi_keys.strip().startswith("["):
                try:
                    parsed = json.loads(multi_keys)
                    keys.extend([k.strip() for k in parsed if isinstance(k, str) and k.strip()])
                except Exception:
                    pass
            else:
                keys.extend([k.strip() for k in multi_keys.split(",") if k.strip()])
        elif isinstance(multi_keys, list):
            keys.extend([k.strip() for k in multi_keys if isinstance(k, str) and k.strip()])

        # Also dynamically discover any env var starting with env_prefix (e.g. GROQ_API_KEY_1, GROQ_API_KEY_99)
        for env_k, env_v in os.environ.items():
            if env_k.startswith(env_prefix) and env_v and env_v.strip():
                if env_v.strip() not in keys:
                    keys.append(env_v.strip())

        # Deduplicate while preserving order
        seen = set()
        deduped = []
        for k in keys:
            if k not in seen:
                seen.add(k)
                deduped.append(k)
        return deduped

    def get_groq_api_keys(self) -> List[str]:
        return self._parse_keys(self.GROQ_API_KEY, self.GROQ_API_KEYS, "GROQ_API_KEY_")

    def get_openrouter_api_keys(self) -> List[str]:
        return self._parse_keys(self.OPENROUTER_API_KEY, self.OPENROUTER_API_KEYS, "OPENROUTER_API_KEY_")

    @field_validator("ALLOWED_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
