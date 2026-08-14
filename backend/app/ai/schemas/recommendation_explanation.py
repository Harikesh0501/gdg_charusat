from typing import List
from pydantic import BaseModel, Field


class ItemExplanation(BaseModel):
    item_id: int = Field(..., description="ID of the recommended resource, project, or certification")
    explanation: str = Field(..., description="1-2 sentence personalized explanation of why this item specifically addresses the student's skill gap")


class RecommendationExplanationResponse(BaseModel):
    explanations: List[ItemExplanation] = Field(default_factory=list, description="List of item explanations")
