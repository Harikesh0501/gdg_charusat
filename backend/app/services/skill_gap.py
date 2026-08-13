import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.career import CareerRole, SkillImportance
from app.models.student_skill import StudentSkill
from app.repositories.career import CareerRepository
from app.repositories.resume import ResumeRepository


IMPORTANCE_WEIGHTS = {
    SkillImportance.CORE: 3,
    SkillImportance.IMPORTANT: 2,
    SkillImportance.NICE_TO_HAVE: 1,
    "core": 3,
    "important": 2,
    "nice_to_have": 1,
}


def classify_priority_bucket(priority_score: int) -> str:
    if priority_score >= 9:
        return "high"
    elif priority_score >= 4:
        return "medium"
    elif priority_score >= 1:
        return "low"
    return "na"


class SkillGapService:
    def __init__(self, db: Session):
        self.db = db
        self.career_repo = CareerRepository(db)
        self.resume_repo = ResumeRepository(db)

    def compute_skill_gap(self, profile_id: uuid.UUID, career_role_id: int) -> Dict[str, Any]:
        """
        100% Deterministic Skill Gap & Career Readiness calculation per docs/05.
        No LLM calls on critical path.
        """
        career_role = self.career_repo.get_role_by_id(career_role_id)
        if not career_role:
            raise ValueError(f"Career Role ID {career_role_id} not found.")

        # Get student's current skills
        student_skills = self.resume_repo.get_student_skills(profile_id)
        student_skill_map: Dict[int, StudentSkill] = {ss.skill_id: ss for ss in student_skills}

        total_required_prof_sum = 0
        total_earned_prof_sum = 0

        mastered_skills = []
        gaps = []

        for role_skill in career_role.role_skills:
            skill = role_skill.skill
            if not skill:
                continue

            req_prof = role_skill.required_proficiency
            total_required_prof_sum += req_prof

            student_ss = student_skill_map.get(skill.id)
            current_prof = student_ss.proficiency if student_ss else 0
            confidence = student_ss.confidence if student_ss else 0.0

            # Capped contribution to readiness score
            earned_prof = min(current_prof, req_prof)
            total_earned_prof_sum += earned_prof

            gap_value = max(0, req_prof - current_prof)
            weight = IMPORTANCE_WEIGHTS.get(role_skill.importance, 2)
            priority_score = gap_value * weight
            priority_bucket = classify_priority_bucket(priority_score)

            item = {
                "skill_id": skill.id,
                "name": skill.name,
                "category": skill.category,
                "current_proficiency": current_prof,
                "required_proficiency": req_prof,
                "importance": role_skill.importance if isinstance(role_skill.importance, str) else role_skill.importance.value,
                "confidence": confidence,
                "gap": gap_value,
                "priority_score": priority_score,
                "priority_bucket": priority_bucket,
            }

            if gap_value == 0:
                mastered_skills.append(item)
            else:
                gaps.append(item)

        # Readiness Score Formula: 100 * (sum(min(current, required)) / sum(required))
        readiness_score = 0
        if total_required_prof_sum > 0:
            readiness_score = round((total_earned_prof_sum / total_required_prof_sum) * 100)

        # Sort gaps by priority_score descending
        gaps.sort(key=lambda x: x["priority_score"], reverse=True)

        return {
            "career_role": {
                "id": career_role.id,
                "name": career_role.name,
                "slug": career_role.slug,
                "description": career_role.description,
            },
            "readiness_score": readiness_score,
            "mastered_skills": mastered_skills,
            "gaps": gaps,
        }
