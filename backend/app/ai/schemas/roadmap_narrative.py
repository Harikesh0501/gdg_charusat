from typing import List, Optional
from pydantic import BaseModel, Field


class PhaseNarrative(BaseModel):
    phase_order: int = Field(..., description="1-based phase order index")
    title: str = Field(..., description="Actionable title for the learning phase")
    summary: str = Field(..., description="Encouraging, personalized summary of what the student will accomplish in this phase")


class RoadmapNarrativeResult(BaseModel):
    overall_strategy: str = Field(..., description="2-3 sentence personalized learning strategy tailored to the student's background")
    phases: List[PhaseNarrative] = Field(default_factory=list, description="Narratives for each phase")
