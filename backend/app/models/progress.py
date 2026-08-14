import enum
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum as SQLEnum, Text, JSON
from sqlalchemy.orm import relationship
from app.core.db import Base


class ProgressEventType(str, enum.Enum):
    ITEM_COMPLETED = "item_completed"
    RESUME_UPLOADED = "resume_uploaded"
    SKILL_ADDED = "skill_added"
    INTERVIEW_COMPLETED = "interview_completed"
    GOAL_SET = "goal_set"


class LearningProgress(Base):
    __tablename__ = "learning_progress"

    id = Column(String(36), primary_key=True)
    profile_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(
        SQLEnum(ProgressEventType, name="progress_event_type_enum", values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=ProgressEventType.ITEM_COMPLETED
    )
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    profile = relationship("Profile", backref="progress_events")
