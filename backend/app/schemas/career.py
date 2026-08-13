from uuid import UUID
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.career import SkillImportance


class CareerRoleSkillSchema(BaseModel):
    skill_id: int
    skill_name: str
    category: str
    required_proficiency: int
    importance: SkillImportance

    model_config = ConfigDict(from_attributes=True)


class CareerRoleResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    role_skills_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


class SetCareerGoalRequest(BaseModel):
    career_role_id: int = Field(..., description="Target Career Role ID")
    target_timeline_months: int = Field(6, ge=1, le=24, description="Target completion timeline in months")


class CareerGoalResponse(BaseModel):
    id: UUID
    profile_id: UUID
    career_role_id: int
    career_role_name: str
    career_role_slug: str
    target_timeline_months: int
    created_at: datetime
    updated_at: datetime


class GapItemSchema(BaseModel):
    skill_id: int
    name: str
    category: str
    current_proficiency: int
    required_proficiency: int
    importance: str
    confidence: float
    gap: int
    priority_score: int
    priority_bucket: str


class SkillGapResponse(BaseModel):
    career_role: dict
    readiness_score: int
    mastered_skills: List[dict]
    gaps: List[GapItemSchema]
