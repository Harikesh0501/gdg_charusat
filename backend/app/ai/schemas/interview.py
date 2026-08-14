from typing import List, Optional
from pydantic import BaseModel, Field


class ProjectQuestionItem(BaseModel):
    question_text: str = Field(..., description="Project-driven interview question tailored to the student's project description")
    ideal_answer_points: List[str] = Field(default_factory=list, description="3-4 bullet points outlining key technical aspects a strong answer should cover")
    difficulty: int = Field(default=3, description="Difficulty scale 1-5")
    source_reference: Optional[str] = Field(default="Official Technical Documentation & Industry Best Practices", description="Name of the official source/spec for verification")
    reference_url: Optional[str] = Field(default="https://developer.mozilla.org/", description="URL to verify official documentation")


class ProjectQuestionGenerationResult(BaseModel):
    questions: List[ProjectQuestionItem] = Field(default_factory=list)


class InterviewEvaluationResult(BaseModel):
    score: int = Field(..., description="Evaluation score from 0 to 100 based on coverage of ideal answer points")
    strengths: List[str] = Field(default_factory=list, description="2-3 specific technical strengths demonstrated in the answer")
    weaknesses: List[str] = Field(default_factory=list, description="1-2 areas for improvement or missed key technical points")
    feedback: str = Field(..., description="Constructive 2-3 sentence feedback summary and actionable study recommendation")
