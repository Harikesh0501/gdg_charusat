from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.models.profile import EducationLevel


class ProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    full_name: str | None = None
    education_level: EducationLevel | None = None
    institution: str | None = None
    graduation_year: int | None = None
    interests: list[str] = []
    bio: str | None = None
    onboarding_completed: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProfileUpdateRequest(BaseModel):
    full_name: str | None = Field(None, min_length=2, max_length=100)
    education_level: EducationLevel | None = None
    institution: str | None = Field(None, max_length=150)
    graduation_year: int | None = Field(None, ge=1970, le=2035)
    interests: list[str] | None = Field(None, max_length=20)
    bio: str | None = Field(None, max_length=1000)
