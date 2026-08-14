import uuid
from typing import List
from sqlalchemy.orm import Session, joinedload
from app.models.recommendation import Resource, Project, Certification, RecommendationLog, resource_skills, project_skills, certification_skills


class RecommendationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_resources_by_skill_ids(self, skill_ids: List[int]) -> List[Resource]:
        if not skill_ids:
            return self.db.query(Resource).options(joinedload(Resource.skills)).all()
        return (
            self.db.query(Resource)
            .options(joinedload(Resource.skills))
            .join(resource_skills)
            .filter(resource_skills.c.skill_id.in_(skill_ids))
            .distinct()
            .all()
        )

    def get_projects_by_skill_ids(self, skill_ids: List[int]) -> List[Project]:
        if not skill_ids:
            return self.db.query(Project).options(joinedload(Project.skills)).all()
        return (
            self.db.query(Project)
            .options(joinedload(Project.skills))
            .join(project_skills)
            .filter(project_skills.c.skill_id.in_(skill_ids))
            .distinct()
            .all()
        )

    def get_certifications_by_skill_ids(self, skill_ids: List[int]) -> List[Certification]:
        if not skill_ids:
            return self.db.query(Certification).options(joinedload(Certification.skills)).all()
        return (
            self.db.query(Certification)
            .options(joinedload(Certification.skills))
            .join(certification_skills)
            .filter(certification_skills.c.skill_id.in_(skill_ids))
            .distinct()
            .all()
        )

    def log_recommendation(self, profile_id: str, category: str, career_role_id: int) -> RecommendationLog:
        log = RecommendationLog(
            id=str(uuid.uuid4()),
            profile_id=profile_id,
            category=category,
            career_role_id=career_role_id
        )
        self.db.add(log)
        self.db.commit()
        return log
