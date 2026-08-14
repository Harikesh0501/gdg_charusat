import uuid
import random
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.interview import InterviewQuestion, InterviewAttempt, QuestionCategory, QuestionSource
from app.repositories.interview import InterviewRepository
from app.repositories.career import CareerRepository
from app.repositories.profile import ProfileRepository
from app.repositories.resume import ResumeRepository
from app.services.skill_gap import SkillGapService
from app.ai.extractors.interview import InterviewAIExtractor

logger = logging.getLogger(__name__)


class InterviewService:
    def __init__(self, db: Session):
        self.db = db
        self.interview_repo = InterviewRepository(db)
        self.career_repo = CareerRepository(db)
        self.profile_repo = ProfileRepository(db)
        self.resume_repo = ResumeRepository(db)
        self.skill_gap_service = SkillGapService(db)
        self.ai_extractor = InterviewAIExtractor()

    async def get_practice_questions(self, profile_id: str) -> Dict[str, Any]:
        """
        Retrieves a balanced set of 5 interview questions (Technical, Behavioral, Role-Specific, Project-Driven).
        Excludes recently attempted questions, randomizes question sets, and dynamically generates role-tailored AI questions.
        """
        goal = self.career_repo.get_active_career_goal(profile_id)
        role_id = goal.career_role_id if goal else None
        role = self.career_repo.get_role_by_id(role_id) if role_id else None

        gap_skill_ids = []
        if goal:
            gap_report = self.skill_gap_service.compute_skill_gap(profile_id, goal.career_role_id)
            gaps = gap_report.get("gaps", [])
            gap_skill_ids = [g["skill_id"] for g in gaps]

        # 1. Fetch Attempted Question IDs to prevent repeating questions
        attempted_ids = self.interview_repo.get_attempted_question_ids(profile_id)

        # 2. Fetch Candidate Questions from Seed / DB filtered by role & excluding attempted
        all_questions = self.interview_repo.get_seed_questions(
            career_role_id=role_id,
            skill_ids=gap_skill_ids,
            exclude_ids=attempted_ids
        )

        tech_qs = [q for q in all_questions if q.category == QuestionCategory.TECHNICAL]
        behav_qs = [q for q in all_questions if q.category == QuestionCategory.BEHAVIORAL]
        role_qs = [q for q in all_questions if q.category == QuestionCategory.ROLE_SPECIFIC]
        proj_qs = [q for q in all_questions if q.category == QuestionCategory.PROJECT_SPECIFIC]

        # Randomize candidates so every click on "New Session Kit" is fresh
        random.shuffle(tech_qs)
        random.shuffle(behav_qs)
        random.shuffle(role_qs)
        random.shuffle(proj_qs)

        selected_questions = []

        # Take up to 2 Technical, 1 Behavioral, 1 Role-Specific
        if tech_qs:
            selected_questions.extend(tech_qs[:2])
        if behav_qs:
            selected_questions.extend(behav_qs[:1])
        if role_qs:
            selected_questions.extend(role_qs[:1])
        if proj_qs:
            selected_questions.extend(proj_qs[:1])

        # 3. Always generate Project-Driven Questions from candidate's resume projects via AI
        user_projects = self.resume_repo.get_profile_projects(profile_id)
        if user_projects and len(selected_questions) < 5:
            # Rotate projects randomly
            project_pool = list(user_projects)
            random.shuffle(project_pool)
            proj_dicts = [{"title": p.title, "description": p.description} for p in project_pool[:3]]

            needed_count = min(2, 5 - len(selected_questions))
            if needed_count > 0:
                ai_proj_qs = await self.ai_extractor.generate_project_questions(
                    target_role=role.name if role else "Software Engineer",
                    projects=proj_dicts,
                    count=needed_count
                )

                for q_item in ai_proj_qs:
                    saved_q = InterviewQuestion(
                        id=str(uuid.uuid4()),
                        career_role_id=role_id,
                        category=QuestionCategory.PROJECT_SPECIFIC,
                        difficulty=q_item.get("difficulty", 3),
                        question_text=q_item["question_text"],
                        ideal_answer_points=q_item.get("ideal_answer_points", []),
                        source_reference=q_item.get("source_reference", f"Resume Project: {proj_dicts[0]['title'] if proj_dicts else 'Portfolio'}"),
                        reference_url=q_item.get("reference_url", "https://github.com/"),
                        source=QuestionSource.AI_GENERATED
                    )
                    saved_q = self.interview_repo.save_question(saved_q)
                    selected_questions.append(saved_q)

        # 4. Fill remaining slots with randomized unattempted candidates
        selected_ids = {str(q.id) for q in selected_questions}
        random.shuffle(all_questions)
        for q in all_questions:
            if len(selected_questions) >= 5:
                break
            if str(q.id) not in selected_ids:
                selected_questions.append(q)
                selected_ids.add(str(q.id))

        # 5. Fail-safe: if still under 5, fetch any questions in system
        if len(selected_questions) < 5:
            fallback_qs = self.db.query(InterviewQuestion).all()
            random.shuffle(fallback_qs)
            for fq in fallback_qs:
                if len(selected_questions) >= 5:
                    break
                if str(fq.id) not in selected_ids:
                    selected_questions.append(fq)
                    selected_ids.add(str(fq.id))

        # Serialize questions to clean dictionary dicts with string IDs, source references, and Enum values
        formatted_questions = []
        for q in selected_questions:
            formatted_questions.append({
                "id": str(q.id),
                "career_role_id": q.career_role_id,
                "skill_id": q.skill_id,
                "category": q.category.value if hasattr(q.category, "value") else str(q.category),
                "difficulty": q.difficulty,
                "question_text": q.question_text,
                "source": q.source.value if hasattr(q.source, "value") else str(q.source),
                "source_reference": q.source_reference or ("Official Technical Documentation" if q.category != QuestionCategory.PROJECT_SPECIFIC else "Resume Portfolio Project"),
                "reference_url": q.reference_url or "https://developer.mozilla.org/"
            })

        return {
            "career_role_id": role_id,
            "career_role_name": role.name if role else "General Tech Role",
            "questions": formatted_questions
        }

    async def evaluate_answer(self, profile_id: str, question_id: str, answer_text: str) -> Dict[str, Any]:
        """
        Evaluates a candidate's answer against ideal criteria points using Groq AI with fallback,
        and records the attempt in DB.
        """
        question = self.interview_repo.get_question_by_id(question_id)
        if not question:
            raise ValueError(f"Question with ID {question_id} not found")

        ideal_points = question.ideal_answer_points or []
        eval_result = await self.ai_extractor.evaluate_answer(
            question_text=question.question_text,
            ideal_points=ideal_points,
            candidate_answer=answer_text
        )

        attempt = InterviewAttempt(
            id=str(uuid.uuid4()),
            profile_id=profile_id,
            question_id=question_id,
            answer_text=answer_text,
            score=eval_result.score,
            strengths=eval_result.strengths,
            weaknesses=eval_result.weaknesses,
            feedback=eval_result.feedback
        )
        saved_attempt = self.interview_repo.save_attempt(attempt)

        return {
            "attempt_id": str(saved_attempt.id),
            "question_id": str(question.id),
            "question_text": question.question_text,
            "score": saved_attempt.score,
            "strengths": saved_attempt.strengths or [],
            "weaknesses": saved_attempt.weaknesses or [],
            "feedback": saved_attempt.feedback,
            "created_at": saved_attempt.created_at.isoformat()
        }

    def get_attempt_history(self, profile_id: str) -> Dict[str, Any]:
        """
        Returns student attempt history and aggregated performance metrics.
        """
        attempts = self.interview_repo.get_attempts_by_profile(profile_id)
        total_attempts = len(attempts)

        avg_score = 0
        if total_attempts > 0:
            avg_score = round(sum(a.score for a in attempts) / total_attempts)

        items = [
            {
                "attempt_id": str(a.id),
                "question_id": str(a.question_id),
                "question_text": a.question.question_text if a.question else "Interview Question",
                "category": a.question.category.value if a.question and hasattr(a.question.category, "value") else "technical",
                "score": a.score,
                "strengths": a.strengths or [],
                "weaknesses": a.weaknesses or [],
                "feedback": a.feedback,
                "created_at": a.created_at.isoformat()
            }
            for a in attempts
        ]

        return {
            "total_attempts": total_attempts,
            "average_score": avg_score,
            "history": items
        }
