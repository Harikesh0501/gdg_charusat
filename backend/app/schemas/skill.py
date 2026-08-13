from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.skill import SkillCategory
from app.models.student_skill import SkillSource


class SkillSchema(BaseModel):
    id: int
    name: str
    slug: str
    category: SkillCategory
    aliases: List[str] = []
    difficulty: int
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class StudentSkillResponse(BaseModel):
    id: str
    skill_id: int
    skill_name: str
    category: SkillCategory
    proficiency: int
    source: SkillSource
    confidence: float
    evidence: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class StudentSkillCreateRequest(BaseModel):
    skill_id: int = Field(..., description="ID of the skill from the taxonomy")
    proficiency: int = Field(2, ge=0, le=4, description="Proficiency level (0=Unaware, 1=Beginner, 2=Intermediate, 3=Advanced, 4=Expert)")


class SkillsProfileResponse(BaseModel):
    total_skills: int
    skills: List[StudentSkillResponse]
