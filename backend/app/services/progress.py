import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.models.roadmap import RoadmapItem, RoadmapItemType, RoadmapItemStatus, RoadmapStatus
from app.models.student_skill import StudentSkill, SkillSource
from app.models.progress import ProgressEventType
from app.models.skill import Skill
from app.repositories.progress import ProgressRepository
from app.repositories.roadmap import RoadmapRepository
from app.repositories.career import CareerRepository
from app.repositories.profile import ProfileRepository
from app.repositories.resume import ResumeRepository
from app.services.skill_gap import SkillGapService

logger = logging.getLogger(__name__)


class ProgressService:
    def __init__(self, db: Session):
        self.db = db
        self.progress_repo = ProgressRepository(db)
        self.roadmap_repo = RoadmapRepository(db)
        self.career_repo = CareerRepository(db)
        self.profile_repo = ProfileRepository(db)
        self.resume_repo = ResumeRepository(db)
        self.skill_gap_service = SkillGapService(db)

    def handle_item_status_update(self, profile_id: str, item_id: str, new_status: RoadmapItemStatus) -> Dict[str, Any]:
        """
        Updates roadmap item status. If item is marked COMPLETED, executes feedback loop:
        bumps student skill proficiency in student_skills and logs learning progress event.
        """
        item = self.roadmap_repo.update_item_status(item_id, new_status)
        if not item:
            raise ValueError(f"Roadmap item with ID {item_id} not found")

        # Feedback Loop: If item is completed and references a skill
        if new_status == RoadmapItemStatus.COMPLETED:
            if item.type == RoadmapItemType.SKILL and item.ref_skill_id:
                skill = self.db.query(Skill).filter(Skill.id == item.ref_skill_id).first()
                if skill:
                    self.resume_repo.upsert_student_skill(
                        profile_id=profile_id,
                        skill_id=skill.id,
                        proficiency=3,  # Mastery proficiency level for completing roadmap item
                        confidence=0.90,
                        evidence=f"Completed roadmap learning milestone: '{item.title}'",
                        source=SkillSource.SELF_REPORTED,
                    )
                    self.progress_repo.log_event(
                        profile_id=profile_id,
                        event_type=ProgressEventType.ITEM_COMPLETED,
                        title=f"Completed Roadmap Skill: {skill.name}",
                        description=f"Demonstrated competency in {skill.name}. Proficiency updated to Level 3 (Advanced).",
                        metadata_json={"skill_id": skill.id, "item_id": str(item.id)}
                    )
            else:
                self.progress_repo.log_event(
                    profile_id=profile_id,
                    event_type=ProgressEventType.ITEM_COMPLETED,
                    title=f"Completed Task: {item.title}",
                    description=f"Roadmap milestone completed.",
                    metadata_json={"item_id": str(item.id)}
                )

        # Re-calculate readiness score after feedback loop
        goal = self.career_repo.get_active_career_goal(profile_id)
        readiness_score = 0
        if goal:
            gap_report = self.skill_gap_service.compute_skill_gap(profile_id, goal.career_role_id)
            readiness_score = gap_report.get("readiness_score", 0)

        return {
            "item_id": str(item.id),
            "status": item.status.value if hasattr(item.status, "value") else str(item.status),
            "readiness_score": readiness_score
        }

    def get_progress_analytics(self, profile_id: str) -> Dict[str, Any]:
        """
        Calculates aggregate student progress metrics: readiness score, mastered skills,
        gaps remaining, roadmap completion %, and recent activity timeline.
        """
        goal = self.career_repo.get_active_career_goal(profile_id)
        role_id = goal.career_role_id if goal else None
        role_name = goal.career_role.name if goal and goal.career_role else "Target Career Goal"

        readiness_score = 0
        mastered_count = 0
        gaps_count = 0

        if role_id:
            gap_report = self.skill_gap_service.compute_skill_gap(profile_id, role_id)
            readiness_score = gap_report.get("readiness_score", 0)
            mastered_count = len(gap_report.get("mastered_skills", []))
            gaps_count = len(gap_report.get("gaps", []))

        # Roadmap completion %
        active_roadmap = self.roadmap_repo.get_active_roadmap(profile_id, role_id) if role_id else None
        total_items = 0
        completed_items = 0
        roadmap_completion_pct = 0

        if active_roadmap:
            for phase in active_roadmap.phases:
                for item in phase.items:
                    total_items += 1
                    if item.status == RoadmapItemStatus.COMPLETED:
                        completed_items += 1

            if total_items > 0:
                roadmap_completion_pct = round((completed_items / total_items) * 100)

        # Recent activity stream
        raw_events = self.progress_repo.get_user_events(profile_id, limit=15)
        timeline = [
            {
                "id": str(evt.id),
                "event_type": evt.event_type.value if hasattr(evt.event_type, "value") else str(evt.event_type),
                "title": evt.title,
                "description": evt.description,
                "created_at": evt.created_at.isoformat()
            }
            for evt in raw_events
        ]

        return {
            "career_role_name": role_name,
            "readiness_score": readiness_score,
            "mastered_skills_count": mastered_count,
            "gaps_remaining_count": gaps_count,
            "roadmap_completion_percentage": roadmap_completion_pct,
            "completed_roadmap_items": completed_items,
            "total_roadmap_items": total_items,
            "activity_timeline": timeline
        }
