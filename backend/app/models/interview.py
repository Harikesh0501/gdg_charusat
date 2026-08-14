import enum
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum as SQLEnum, Text, JSON
from sqlalchemy.orm import relationship
from app.core.db import Base


class QuestionCategory(str, enum.Enum):
    TECHNICAL = "technical"
    BEHAVIORAL = "behavioral"
    PROJECT_SPECIFIC = "project_specific"
    ROLE_SPECIFIC = "role_specific"


class QuestionSource(str, enum.Enum):
    SEED = "seed"
    AI_GENERATED = "ai_generated"


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(String(36), primary_key=True)
    career_role_id = Column(Integer, ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="SET NULL"), nullable=True, index=True)
    category = Column(
        SQLEnum(QuestionCategory, name="question_category_enum", values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=QuestionCategory.TECHNICAL
    )
    difficulty = Column(Integer, default=2, nullable=False)
    question_text = Column(Text, nullable=False)
    ideal_answer_points = Column(JSON, nullable=True)  # List of string criteria for evaluation
    source_reference = Column(String(255), nullable=True)  # e.g. 'FastAPI Official Documentation'
    reference_url = Column(String(500), nullable=True)  # e.g. 'https://fastapi.tiangolo.com'
    source = Column(
        SQLEnum(QuestionSource, name="question_source_enum", values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=QuestionSource.SEED
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    career_role = relationship("CareerRole", backref="interview_questions")
    skill = relationship("Skill", backref="interview_questions")


class InterviewAttempt(Base):
    __tablename__ = "interview_attempts"

    id = Column(String(36), primary_key=True)
    profile_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(36), ForeignKey("interview_questions.id", ondelete="CASCADE"), nullable=False, index=True)
    answer_text = Column(Text, nullable=False)
    score = Column(Integer, nullable=False, default=0)  # 0-100 score
    strengths = Column(JSON, nullable=True)  # List of strengths
    weaknesses = Column(JSON, nullable=True)  # List of weaknesses
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    profile = relationship("Profile", backref="interview_attempts")
    question = relationship("InterviewQuestion", backref="attempts")
