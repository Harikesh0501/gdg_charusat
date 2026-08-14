import json
import logging
from typing import List, Dict, Any
from app.ai.providers.groq_provider import GroqProvider
from app.ai.schemas.interview import ProjectQuestionGenerationResult, InterviewEvaluationResult
from app.ai.prompts.interview_prompts import (
    PROJECT_QUESTION_GEN_SYSTEM_PROMPT,
    PROJECT_QUESTION_GEN_USER_TEMPLATE,
    INTERVIEW_EVALUATION_SYSTEM_PROMPT,
    INTERVIEW_EVALUATION_USER_TEMPLATE,
)

logger = logging.getLogger(__name__)


class InterviewAIExtractor:
    def __init__(self):
        self.provider = GroqProvider()

    async def generate_project_questions(
        self,
        target_role: str,
        projects: List[Dict[str, Any]],
        count: int = 2
    ) -> List[Dict[str, Any]]:
        """
        Generates project-driven interview questions tailored to student's resume projects.
        """
        if not projects:
            return []

        try:
            projects_text = "\n\n".join(
                [f"Project: {p.get('title', 'Project')}\nDescription: {p.get('description', 'N/A')}" for p in projects]
            )

            user_prompt = PROJECT_QUESTION_GEN_USER_TEMPLATE.format(
                count=count,
                target_role=target_role,
                projects_text=projects_text
            )

            result: ProjectQuestionGenerationResult = await self.provider.generate_structured(
                system=PROJECT_QUESTION_GEN_SYSTEM_PROMPT,
                user=user_prompt,
                schema=ProjectQuestionGenerationResult
            )

            return [q.model_dump() for q in result.questions]

        except Exception as e:
            logger.warning(f"Groq project question generation failed: {e}. Using deterministic fallback.")
            p_first = projects[0] if projects else {}
            title = p_first.get("title", "your portfolio project")
            return [
                {
                    "question_text": f"In your project '{title}', what were the main technical architecture choices you made, and how did you handle state or data persistence?",
                    "ideal_answer_points": [
                        "Clear architectural design choices (MVC, modular microservices, REST/GraphQL)",
                        "Database schema or state management implementation",
                        "Key performance or security considerations"
                    ],
                    "difficulty": 3
                }
            ]

    async def evaluate_answer(
        self,
        question_text: str,
        ideal_points: List[str],
        candidate_answer: str
    ) -> InterviewEvaluationResult:
        """
        Evaluates student answer against ideal answer points.
        """
        if not candidate_answer or len(candidate_answer.strip()) < 5:
            return InterviewEvaluationResult(
                score=20,
                strengths=["Attempted to submit an answer."],
                weaknesses=["Answer was too short or incomplete."],
                feedback="Your answer was too brief to evaluate technical depth. Please provide a more detailed explanation covering key architectural concepts."
            )

        try:
            points_text = "\n".join([f"- {pt}" for pt in ideal_points]) if ideal_points else "- General technical accuracy and clarity"

            user_prompt = INTERVIEW_EVALUATION_USER_TEMPLATE.format(
                question_text=question_text,
                ideal_points=points_text,
                candidate_answer=candidate_answer
            )

            result: InterviewEvaluationResult = await self.provider.generate_structured(
                system=INTERVIEW_EVALUATION_SYSTEM_PROMPT,
                user=user_prompt,
                schema=InterviewEvaluationResult
            )

            # Ensure valid non-zero score and default strengths if empty (Allow scores up to 100%)
            valid_score = max(40, min(100, result.score)) if result.score is not None else 85
            result.score = valid_score
            if not result.strengths:
                result.strengths = ["Demonstrated solid technical accuracy and clear architectural reasoning."]
            if not result.weaknesses:
                result.weaknesses = ["Could expand further on edge case handling, automated testing, and performance metrics."]
            return result

        except Exception as e:
            logger.warning(f"Groq answer evaluation failed: {e}. Using deterministic fallback evaluation.")
            word_count = len(candidate_answer.split())
            score = min(98, max(50, word_count * 2 + 35))
            return InterviewEvaluationResult(
                score=score,
                strengths=["Provided a clear, structured technical explanation addressing the core question."],
                weaknesses=["Consider adding explicit benchmarks, error handling strategies, and boundary condition checks."],
                feedback="Solid technical response! To achieve a perfect 100% score, expand on real-world scalability trade-offs and error recovery mechanisms."
            )
