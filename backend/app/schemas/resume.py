from uuid import UUID
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field
from app.models.skill import SkillCategory
from app.models.student_skill import SkillSource
from app.models.resume import ResumeStatus, ProjectSource


# LLM Structured Output Pydantic Schema
class ExtractedSkillItem(BaseModel):
    name: str = Field(..., description="Canonical or extracted name of the skill")
    evidence: str = Field(..., description="Short quote or context from the resume proving this skill")
    confidence_hint: Literal["low", "medium", "high"] = Field("medium", description="Perceived strength of evidence in resume")


class ExtractedEducationItem(BaseModel):
    institution: str
    degree: str | None = None
    field: str | None = None
    graduation_year: int | None = None


class ExtractedProjectItem(BaseModel):
    title: str
    description: str | None = None
    skills_used: list[str] = []


class ExtractedExperienceItem(BaseModel):
    role: str
    organization: str | None = None
    duration: str | None = None
    description: str | None = None
    skills_used: list[str] = []


class ExtractedCertificationItem(BaseModel):
    name: str
    issuer: str | None = None


class ResumeExtractionSchema(BaseModel):
    skills: list[ExtractedSkillItem] = []
    education: list[ExtractedEducationItem] = []
    projects: list[ExtractedProjectItem] = []
    experience: list[ExtractedExperienceItem] = []
    certifications: list[ExtractedCertificationItem] = []


# API DTO Schemas
class StudentSkillResponse(BaseModel):
    id: UUID
    profile_id: UUID
    skill_id: int
    skill_name: str
    skill_slug: str
    skill_category: SkillCategory
    proficiency: int
    source: SkillSource
    confidence: float
    evidence: str | None = None
    updated_at: datetime


class StudentSkillUpdateRequest(BaseModel):
    skill_id: int
    proficiency: int = Field(..., ge=0, le=4)


class ResumeUploadResponse(BaseModel):
    resume_id: UUID
    file_name: str
    status: ResumeStatus
    message: str


class ResumeStatusResponse(BaseModel):
    resume_id: UUID
    status: ResumeStatus
    file_name: str
    created_at: datetime
    updated_at: datetime
