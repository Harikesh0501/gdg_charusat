from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.auth import get_current_user, CurrentUser
from app.services.interview import InterviewService
from app.schemas.interview import (
    PracticeQuestionsResponse,
    SubmitAnswerRequest,
    EvaluationResponse,
    InterviewHistoryResponse,
)

router = APIRouter(prefix="/interview", tags=["Interview Preparation"])


@router.get("/questions", response_model=PracticeQuestionsResponse)
async def get_practice_questions(
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves a balanced set of adaptive mock interview questions for practice session.
    """
    if not current_user.profile_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found. Please complete onboarding first."
        )

    service = InterviewService(db)
    result = await service.get_practice_questions(profile_id=current_user.profile_id)
    return result


@router.post("/attempts", response_model=EvaluationResponse)
async def submit_answer_attempt(
    body: SubmitAnswerRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits a student's answer attempt for AI evaluation and score feedback.
    """
    if not current_user.profile_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found. Please complete onboarding first."
        )

    service = InterviewService(db)
    try:
        result = await service.evaluate_answer(
            profile_id=current_user.profile_id,
            question_id=body.question_id,
            answer_text=body.answer_text
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/history", response_model=InterviewHistoryResponse)
def get_interview_history(
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves student's attempt history and performance metrics.
    """
    if not current_user.profile_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found. Please complete onboarding first."
        )

    service = InterviewService(db)
    result = service.get_attempt_history(profile_id=current_user.profile_id)
    return result
