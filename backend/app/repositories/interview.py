import uuid
from typing import List, Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.models.interview import InterviewQuestion, InterviewAttempt, QuestionCategory, QuestionSource


class InterviewRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_attempted_question_ids(self, profile_id: str) -> List[str]:
        attempts = self.db.query(InterviewAttempt.question_id).filter(InterviewAttempt.profile_id == profile_id).all()
        return [a[0] for a in attempts]

    def get_seed_questions(
        self,
        career_role_id: Optional[int] = None,
        skill_ids: Optional[List[int]] = None,
        exclude_ids: Optional[List[str]] = None
    ) -> List[InterviewQuestion]:
        query = self.db.query(InterviewQuestion)

        if exclude_ids:
            query = query.filter(~InterviewQuestion.id.in_(exclude_ids))

        filters = []
        if career_role_id:
            filters.append(InterviewQuestion.career_role_id == career_role_id)
            filters.append(InterviewQuestion.career_role_id.is_(None))
        if skill_ids:
            filters.append(InterviewQuestion.skill_id.in_(skill_ids))

        results = []
        if filters:
            results = query.filter(or_(*filters)).all()

        # Fallback to unattempted questions if specific role/skill filter yields fewer than 3 questions
        if not results or len(results) < 3:
            q_fallback = self.db.query(InterviewQuestion)
            if exclude_ids:
                q_fallback = q_fallback.filter(~InterviewQuestion.id.in_(exclude_ids))
            results = q_fallback.all()

        return results

    def get_question_by_id(self, question_id: str) -> Optional[InterviewQuestion]:
        return self.db.query(InterviewQuestion).filter(InterviewQuestion.id == question_id).first()

    def save_question(self, question: InterviewQuestion) -> InterviewQuestion:
        self.db.add(question)
        self.db.commit()
        self.db.refresh(question)
        return question

    def save_attempt(self, attempt: InterviewAttempt) -> InterviewAttempt:
        self.db.add(attempt)
        self.db.commit()
        self.db.refresh(attempt)
        return attempt

    def get_attempts_by_profile(self, profile_id: str) -> List[InterviewAttempt]:
        return (
            self.db.query(InterviewAttempt)
            .filter(InterviewAttempt.profile_id == profile_id)
            .order_by(InterviewAttempt.created_at.desc())
            .all()
        )
