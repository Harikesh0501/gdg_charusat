from typing import List, Optional
from pydantic import BaseModel, Field


class ExtractedSkill(BaseModel):
    name: str = Field(description="Name of the skill, technology, framework, language, or tool")
    evidence: Optional[str] = Field(None, description="Context or evidence sentence from the resume where this skill was mentioned")
    confidence_hint: str = Field("medium", description="Confidence hint: 'low', 'medium', or 'high'")


class ExtractedEducation(BaseModel):
    institution: Optional[str] = Field(None, description="University, college, or educational institution name")
    degree: Optional[str] = Field(None, description="Degree or program name (e.g. B.Tech in Computer Science)")
    field: Optional[str] = Field(None, description="Major, specialization, or field of study")
    graduation_year: Optional[int] = Field(None, description="Graduation or completion year")


class ExtractedProject(BaseModel):
    title: str = Field(description="Title or name of the project")
    description: Optional[str] = Field(None, description="Summary of project goals, features, and achievements")
    skills_used: List[str] = Field(default_factory=list, description="List of skill or technology names used in this project")


class ExtractedExperience(BaseModel):
    role: Optional[str] = Field(None, description="Job title or role (e.g. Software Engineer Intern)")
    organization: Optional[str] = Field(None, description="Company or organization name")
    duration: Optional[str] = Field(None, description="Time duration or dates of experience")
    description: Optional[str] = Field(None, description="Key responsibilities and achievements")
    skills_used: List[str] = Field(default_factory=list, description="List of skill or technology names used in this role")


class ExtractedCertification(BaseModel):
    name: str = Field(description="Name of the certification or course")
    issuer: Optional[str] = Field(None, description="Organization or platform issuing the certificate")


class ResumeExtractionResult(BaseModel):
    skills: List[ExtractedSkill] = Field(default_factory=list)
    education: List[ExtractedEducation] = Field(default_factory=list)
    projects: List[ExtractedProject] = Field(default_factory=list)
    experience: List[ExtractedExperience] = Field(default_factory=list)
    certifications: List[ExtractedCertification] = Field(default_factory=list)
