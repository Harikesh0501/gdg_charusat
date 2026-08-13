from uuid import UUID
from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict
from app.models.resume import ResumeStatus


class ResumeResponse(BaseModel):
    id: UUID
    profile_id: UUID
    file_name: str
    file_url: str
    status: ResumeStatus
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResumeUploadResponse(BaseModel):
    message: str
    resume_id: UUID
    status: ResumeStatus


class ResumeLatestResponse(BaseModel):
    resume: Optional[ResumeResponse] = None
    extraction: Optional[dict] = None
