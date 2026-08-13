import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.db import Base


class SkillImportance(str, enum.Enum):
    CORE = "core"
    IMPORTANT = "important"
    NICE_TO_HAVE = "nice_to_have"


class CareerRole(Base):
    __tablename__ = "career_roles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)
    slug = Column(String, nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    role_skills = relationship("CareerRoleSkill", back_populates="career_role", cascade="all, delete-orphan")


class CareerRoleSkill(Base):
    __tablename__ = "career_role_skills"
    __table_args__ = (
        UniqueConstraint("career_role_id", "skill_id", name="uq_career_role_skills_role_skill"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    career_role_id = Column(Integer, ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    required_proficiency = Column(Integer, nullable=False, default=3)  # Scale 1-4
    importance = Column(
        Enum(SkillImportance, name="skill_importance_enum", values_callable=lambda x: [e.value for e in x]),
        default=SkillImportance.CORE,
        nullable=False,
    )

    career_role = relationship("CareerRole", back_populates="role_skills")
    skill = relationship("Skill")


class CareerGoal(Base):
    __tablename__ = "career_goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    career_role_id = Column(Integer, ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False, index=True)
    target_timeline_months = Column(Integer, default=6, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    career_role = relationship("CareerRole")
    profile = relationship("Profile")
