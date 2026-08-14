import enum
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum as SQLEnum, Text, Float, Table
from sqlalchemy.orm import relationship
from app.core.db import Base


class ResourceType(str, enum.Enum):
    COURSE = "course"
    ARTICLE = "article"
    VIDEO = "video"
    DOC = "doc"


class CertLevel(str, enum.Enum):
    ENTRY = "entry"
    ASSOCIATE = "associate"
    PROFESSIONAL = "professional"


# Join Tables
resource_skills = Table(
    "resource_skills",
    Base.metadata,
    Column("resource_id", Integer, ForeignKey("resources.id", ondelete="CASCADE"), primary_key=True),
    Column("skill_id", Integer, ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True),
)

project_skills = Table(
    "project_skills",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
    Column("skill_id", Integer, ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True),
)

certification_skills = Table(
    "certification_skills",
    Base.metadata,
    Column("certification_id", Integer, ForeignKey("certifications.id", ondelete="CASCADE"), primary_key=True),
    Column("skill_id", Integer, ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True),
)


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    url = Column(String(500), nullable=False)
    provider = Column(String(100), nullable=False)
    type = Column(
        SQLEnum(ResourceType, name="resource_type_enum", values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=ResourceType.COURSE
    )
    description = Column(Text, nullable=True)
    difficulty = Column(Integer, default=1, nullable=False)
    estimated_hours = Column(Integer, default=10, nullable=False)

    skills = relationship("Skill", secondary=resource_skills, backref="resources")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    difficulty = Column(Integer, default=2, nullable=False)
    estimated_hours = Column(Integer, default=15, nullable=False)
    career_relevance = Column(String(255), nullable=True)

    skills = relationship("Skill", secondary=project_skills, backref="projects")


class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    provider = Column(String(100), nullable=False)
    url = Column(String(500), nullable=False)
    level = Column(
        SQLEnum(CertLevel, name="cert_level_enum", values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=CertLevel.ENTRY
    )

    skills = relationship("Skill", secondary=certification_skills, backref="certifications")


class RecommendationLog(Base):
    __tablename__ = "recommendation_logs"

    id = Column(String(36), primary_key=True)
    profile_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(50), nullable=False)
    career_role_id = Column(Integer, ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False)
    recommended_at = Column(DateTime, default=datetime.utcnow, nullable=False)
