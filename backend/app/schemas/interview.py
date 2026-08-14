from typing import List, Optional
from pydantic import BaseModel, Field


class QuestionResponse(BaseModel):
    id: str
    career_role_id: Optional[int] = None
    skill_id: Optional[int] = None
    category: str
    difficulty: int
    question_text: str
    source: str
    source_reference: Optional[str] = None
    reference_url: Optional[str] = None


class PracticeQuestionsResponse(BaseModel):
    career_role_id: Optional[int] = None
    career_role_name: Optional[str] = None
    questions: List[QuestionResponse] = Field(default_factory=list)


class SubmitAnswerRequest(BaseModel):
    question_id: str = Field(..., description="UUID of the question being answered")
    answer_text: str = Field(..., min_length=5, description="Candidate submitted answer text")


class EvaluationResponse(BaseModel):
    attempt_id: str
    question_id: str
    question_text: str
    score: int
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    feedback: str
    created_at: str


class AttemptHistoryItem(BaseModel):
    attempt_id: str
    question_id: str
    question_text: str
    category: str
    score: int
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    feedback: str
    created_at: str


class InterviewHistoryResponse(BaseModel):
    total_attempts: int
    average_score: int
    history: List[AttemptHistoryItem] = Field(default_factory=list)
