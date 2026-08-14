from typing import List, Optional
from pydantic import BaseModel, Field


class RecommendationItemResponse(BaseModel):
    id: int
    category: str
    title: str
    url: Optional[str] = None
    provider: Optional[str] = "SkillForge Curation"
    type: Optional[str] = "course"
    description: Optional[str] = None
    difficulty: int = 2
    estimated_hours: int = 10
    level: Optional[str] = "entry"
    career_relevance: Optional[str] = None
    matched_gap_skills: List[str] = Field(default_factory=list)
    score: float
    explanation: str


class RecommendationsResponse(BaseModel):
    career_role_id: Optional[int] = None
    career_role_name: Optional[str] = None
    category: str
    items: List[RecommendationItemResponse] = Field(default_factory=list)
