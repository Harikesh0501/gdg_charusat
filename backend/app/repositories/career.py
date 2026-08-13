import uuid
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.career import CareerRole, CareerRoleSkill, CareerGoal


class CareerRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_roles(self) -> List[CareerRole]:
        return self.db.query(CareerRole).options(joinedload(CareerRole.role_skills)).all()

    def get_role_by_id(self, role_id: int) -> Optional[CareerRole]:
        return (
            self.db.query(CareerRole)
            .options(joinedload(CareerRole.role_skills).joinedload(CareerRoleSkill.skill))
            .filter(CareerRole.id == role_id)
            .first()
        )

    def get_role_by_slug(self, slug: str) -> Optional[CareerRole]:
        return (
            self.db.query(CareerRole)
            .options(joinedload(CareerRole.role_skills).joinedload(CareerRoleSkill.skill))
            .filter(CareerRole.slug == slug)
            .first()
        )

    def set_career_goal(self, profile_id: uuid.UUID, career_role_id: int, target_timeline_months: int = 6) -> CareerGoal:
        goal = self.db.query(CareerGoal).filter(CareerGoal.profile_id == profile_id).first()
        if goal:
            goal.career_role_id = career_role_id
            goal.target_timeline_months = target_timeline_months
            self.db.commit()
            self.db.refresh(goal)
            return goal

        goal = CareerGoal(
            profile_id=profile_id,
            career_role_id=career_role_id,
            target_timeline_months=target_timeline_months,
        )
        self.db.add(goal)
        self.db.commit()
        self.db.refresh(goal)
        return goal

    def get_active_career_goal(self, profile_id: uuid.UUID) -> Optional[CareerGoal]:
        return (
            self.db.query(CareerGoal)
            .options(joinedload(CareerGoal.career_role))
            .filter(CareerGoal.profile_id == profile_id)
            .first()
        )
