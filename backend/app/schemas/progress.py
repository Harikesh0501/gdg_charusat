from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ActivityTimelineItem(BaseModel):
    id: str
    event_type: str
    title: str
    description: Optional[str] = None
    created_at: str


class ProgressAnalyticsResponse(BaseModel):
    career_role_name: str
    readiness_score: int
    mastered_skills_count: int
    gaps_remaining_count: int
    roadmap_completion_percentage: int
    completed_roadmap_items: int
    total_roadmap_items: int
    activity_timeline: List[ActivityTimelineItem] = Field(default_factory=list)


class UpdateItemStatusResponse(BaseModel):
    item_id: str
    status: str
    readiness_score: int
