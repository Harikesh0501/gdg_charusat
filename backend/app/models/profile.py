import uuid
from datetime import datetime
import enum
from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from app.core.db import Base


class EducationLevel(str, enum.Enum):
    HIGH_SCHOOL = "high_school"
    UNDERGRADUATE = "undergraduate"
    POSTGRADUATE = "postgraduate"
    OTHER = "other"


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    full_name = Column(String, nullable=True)
    education_level = Column(
        Enum(EducationLevel, name="education_level_enum", values_callable=lambda x: [e.value for e in x]),
        nullable=True,
    )
    institution = Column(String, nullable=True)
    graduation_year = Column(Integer, nullable=True)
    interests = Column(ARRAY(String).with_variant(JSON, "sqlite"), default=list, nullable=True)
    bio = Column(Text, nullable=True)
    onboarding_completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="profile")
