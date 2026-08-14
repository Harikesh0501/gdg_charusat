from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.roadmap import RoadmapStatus, RoadmapItemType, RoadmapItemStatus


class RoadmapItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    phase_id: str
    type: RoadmapItemType
    ref_skill_id: Optional[str] = None
    ref_resource_id: Optional[str] = None
    ref_project_id: Optional[str] = None
    ref_url: Optional[str] = None
    ref_provider: Optional[str] = None
    chapter_title: Optional[str] = None
    title: str
    order_index: int
    status: RoadmapItemStatus
    estimated_hours: int


class RoadmapPhaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    roadmap_id: str
    order_index: int
    title: str
    summary: Optional[str] = None
    items: List[RoadmapItemResponse] = []


class RoadmapResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    profile_id: str
    career_role_id: str
    status: RoadmapStatus
    overall_strategy: Optional[str] = None
    generated_at: datetime
    model_used: Optional[str] = None
    total_hours: int = 0
    total_items_count: int = 0
    completed_items_count: int = 0
    progress_percentage: float = 0.0
    phases: List[RoadmapPhaseResponse] = []


class ItemStatusUpdateRequest(BaseModel):
    status: RoadmapItemStatus
