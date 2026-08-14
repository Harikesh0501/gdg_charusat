import enum
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum as SQLEnum, Text, Index
from sqlalchemy.orm import relationship

from app.core.db import Base


class RoadmapStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class RoadmapItemType(str, enum.Enum):
    SKILL = "skill"
    RESOURCE = "resource"
    PROJECT = "project"
    MILESTONE = "milestone"


class RoadmapItemStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(String(36), primary_key=True)
    profile_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    career_role_id = Column(Integer, ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(
        SQLEnum(RoadmapStatus, name="roadmap_status_enum", values_callable=lambda x: [e.value for e in x]),
        default=RoadmapStatus.ACTIVE,
        nullable=False,
        index=True
    )
    overall_strategy = Column(Text, nullable=True)
    generated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    model_used = Column(String(100), nullable=True)

    profile = relationship("Profile", backref="roadmaps")
    career_role = relationship("CareerRole", backref="roadmaps")
    phases = relationship("RoadmapPhase", back_populates="roadmap", cascade="all, delete-orphan", order_by="RoadmapPhase.order_index")


class RoadmapPhase(Base):
    __tablename__ = "roadmap_phases"

    id = Column(String(36), primary_key=True)
    roadmap_id = Column(String(36), ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False, index=True)
    order_index = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=True)

    roadmap = relationship("Roadmap", back_populates="phases")
    items = relationship("RoadmapItem", back_populates="phase", cascade="all, delete-orphan", order_by="RoadmapItem.order_index")


class RoadmapItem(Base):
    __tablename__ = "roadmap_items"

    id = Column(String(36), primary_key=True)
    phase_id = Column(String(36), ForeignKey("roadmap_phases.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(
        SQLEnum(RoadmapItemType, name="roadmap_item_type_enum", values_callable=lambda x: [e.value for e in x]),
        nullable=False
    )
    ref_skill_id = Column(Integer, ForeignKey("skills.id", ondelete="SET NULL"), nullable=True)
    ref_resource_id = Column(String(36), nullable=True)
    ref_project_id = Column(String(36), nullable=True)
    title = Column(String(255), nullable=False)
    order_index = Column(Integer, nullable=False)
    status = Column(
        SQLEnum(RoadmapItemStatus, name="roadmap_item_status_enum", values_callable=lambda x: [e.value for e in x]),
        default=RoadmapItemStatus.NOT_STARTED,
        nullable=False
    )
    estimated_hours = Column(Integer, default=10, nullable=False)

    phase = relationship("RoadmapPhase", back_populates="items")
    ref_skill = relationship("Skill")
