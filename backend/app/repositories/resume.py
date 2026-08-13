import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.resume import Resume, ResumeExtraction, ResumeStatus, ProfileProject, ProjectSource
from app.models.skill import Skill
from app.models.student_skill import StudentSkill, SkillSource


class ResumeRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_resume_record(self, profile_id: uuid.UUID, file_name: str) -> Resume:
        # Deactivate previous resumes for this profile
        self.db.query(Resume).filter(Resume.profile_id == profile_id, Resume.is_active.is_(True)).update(
            {"is_active": False}
        )

        resume = Resume(
            profile_id=profile_id,
            file_name=file_name,
            file_url="in-memory",  # Processed strictly in-memory per user directive
            status=ResumeStatus.UPLOADED,
            is_active=True,
        )
        self.db.add(resume)
        self.db.commit()
        self.db.refresh(resume)
        return resume

    def update_resume_status(self, resume_id: uuid.UUID, status: ResumeStatus) -> Resume:
        resume = self.db.query(Resume).filter(Resume.id == resume_id).first()
        if resume:
            resume.status = status
            self.db.commit()
            self.db.refresh(resume)
        return resume

    def get_latest_resume(self, profile_id: uuid.UUID) -> Optional[Resume]:
        return (
            self.db.query(Resume)
            .filter(Resume.profile_id == profile_id, Resume.is_active.is_(True))
            .order_by(Resume.created_at.desc())
            .first()
        )

    def get_by_id(self, resume_id: uuid.UUID) -> Optional[Resume]:
        return self.db.query(Resume).filter(Resume.id == resume_id).first()

    def create_extraction_record(
        self, resume_id: uuid.UUID, profile_id: uuid.UUID, raw_text: str, extracted_json: dict
    ) -> ResumeExtraction:
        extraction = ResumeExtraction(
            resume_id=resume_id,
            profile_id=profile_id,
            raw_text=raw_text,
            extracted_json=extracted_json,
        )
        self.db.add(extraction)
        self.db.commit()
        self.db.refresh(extraction)
        return extraction

    def get_all_taxonomy_skills(self) -> List[Skill]:
        return self.db.query(Skill).all()

    def upsert_student_skill(
        self,
        profile_id: uuid.UUID,
        skill_id: int,
        proficiency: int,
        confidence: float,
        evidence: Optional[str],
        source: SkillSource = SkillSource.RESUME,
    ) -> StudentSkill:
        existing = (
            self.db.query(StudentSkill)
            .filter(StudentSkill.profile_id == profile_id, StudentSkill.skill_id == skill_id)
            .first()
        )

        if existing:
            # Never overwrite a self_reported skill with a lower proficiency/source from resume
            if existing.source == SkillSource.SELF_REPORTED:
                return existing

            existing.proficiency = max(existing.proficiency, proficiency)
            existing.confidence = max(existing.confidence, confidence)
            if evidence:
                existing.evidence = evidence
            existing.source = source
            self.db.commit()
            self.db.refresh(existing)
            return existing

        student_skill = StudentSkill(
            profile_id=profile_id,
            skill_id=skill_id,
            proficiency=proficiency,
            confidence=confidence,
            evidence=evidence,
            source=source,
        )
        self.db.add(student_skill)
        self.db.commit()
        self.db.refresh(student_skill)
        return student_skill

    def get_student_skills(self, profile_id: uuid.UUID) -> List[StudentSkill]:
        return self.db.query(StudentSkill).filter(StudentSkill.profile_id == profile_id).all()

    def create_profile_project(
        self, profile_id: uuid.UUID, title: str, description: Optional[str], skill_ids: List[int]
    ) -> ProfileProject:
        project = ProfileProject(
            profile_id=profile_id,
            title=title,
            description=description,
            skill_ids=skill_ids,
            source=ProjectSource.RESUME,
        )
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project
