import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, Text, DateTime, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.db import Base


class SkillSource(str, enum.Enum):
    RESUME = "resume"
    SELF_REPORTED = "self_reported"
    INFERRED = "inferred"
    ASSESSMENT = "assessment"


class StudentSkill(Base):
    __tablename__ = "student_skills"
    __table_args__ = (
        UniqueConstraint("profile_id", "skill_id", name="uq_student_skills_profile_skill"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    proficiency = Column(Integer, nullable=False, default=1)  # 0 to 4 scale
    source = Column(
        Enum(SkillSource, name="skill_source_enum", values_callable=lambda x: [e.value for e in x]),
        default=SkillSource.RESUME,
        nullable=False,
    )
    confidence = Column(Float, default=0.7, nullable=False)
    evidence = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    skill = relationship("Skill")
    profile = relationship("Profile")
