import enum
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum, JSON
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from app.core.db import Base


class SkillCategory(str, enum.Enum):
    PROGRAMMING_LANGUAGE = "programming_language"
    FRAMEWORK_LIBRARY = "framework_library"
    DATABASE = "database"
    CLOUD_DEVOPS = "cloud_devops"
    DATA_ML = "data_ml"
    TOOL = "tool"
    SOFT_SKILL = "soft_skill"
    CONCEPT = "concept"


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    category = Column(Enum(SkillCategory, name="skill_category_enum", values_callable=lambda x: [e.value for e in x]), nullable=False, index=True)
    aliases = Column(ARRAY(String).with_variant(JSON, "sqlite"), default=list, nullable=False)
    parent_skill_id = Column(Integer, ForeignKey("skills.id", ondelete="SET NULL"), nullable=True)
    difficulty = Column(Integer, default=1, nullable=False)
    description = Column(Text, nullable=True)

    parent_skill = relationship("Skill", remote_side=[id], backref="child_skills")


class SkillPrerequisite(Base):
    __tablename__ = "skill_prerequisites"

    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True)
    prerequisite_skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True)
