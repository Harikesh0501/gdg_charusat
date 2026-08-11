import io
import json
import logging
from uuid import UUID
from datetime import datetime
from pypdf import PdfReader
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.skill import Skill
from app.models.student_skill import StudentSkill, SkillSource
from app.models.resume import Resume, ResumeExtraction, ProfileProject, ResumeStatus, ProjectSource
from app.schemas.resume import ResumeExtractionSchema, StudentSkillResponse
from app.ai.providers.groq_provider import GroqProvider
from app.ai.prompts.resume import RESUME_SYSTEM_PROMPT, RESUME_USER_PROMPT_TEMPLATE

logger = logging.getLogger(__name__)


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        extracted_text = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted_text.append(text)
        full_text = "\n".join(extracted_text).strip()
        if len(full_text) < 30:
            raise ValueError("Extracted text is too short or empty (scanned PDF without OCR)")
        return full_text
    except Exception as e:
        logger.error(f"Failed to extract text from PDF: {e}")
        raise ValueError(f"Could not read PDF text: {str(e)}")


def match_skill_to_taxonomy(skill_string: str, all_skills: list[Skill]) -> Skill | None:
    cleaned = skill_string.strip().lower()
    for skill in all_skills:
        # Check canonical name
        if skill.name.lower() == cleaned or skill.slug.lower() == cleaned:
            return skill
        # Check aliases
        for alias in skill.aliases:
            if alias.lower() == cleaned:
                return skill

    # Substring / partial match fallback
    for skill in all_skills:
        if len(cleaned) >= 3 and (cleaned in skill.name.lower() or skill.name.lower() in cleaned):
            return skill

    return None


async def process_resume_background(
    resume_id: UUID,
    profile_id: UUID,
    pdf_bytes: bytes,
    db: Session,
):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        return

    try:
        resume.status = ResumeStatus.PROCESSING
        db.commit()

        # Step 1: Extract PDF Text
        raw_text = extract_text_from_pdf(pdf_bytes)

        # Step 2: Call AI Provider (Groq Llama 4 Scout)
        groq = GroqProvider()
        user_prompt = RESUME_USER_PROMPT_TEMPLATE.format(raw_text=raw_text)

        extraction_result: ResumeExtractionSchema = await groq.generate_structured(
            system=RESUME_SYSTEM_PROMPT,
            user=user_prompt,
            schema=ResumeExtractionSchema,
            max_retries=1,
        )

        # Save extraction record
        extraction_record = ResumeExtraction(
            resume_id=resume_id,
            profile_id=profile_id,
            raw_text=raw_text,
            extracted_json=extraction_result.model_dump(),
        )
        db.add(extraction_record)

        # Step 3: Skill Normalization & Upsert into student_skills
        all_skills = db.query(Skill).all()
        matched_skills_map: dict[int, dict] = {}

        # Collect skills used in projects & experience for confidence bumping
        project_skills_set = set()
        for proj in extraction_result.projects + extraction_result.experience:
            for s in proj.skills_used:
                project_skills_set.add(s.strip().lower())

        for skill_item in extraction_result.skills:
            matched_skill = match_skill_to_taxonomy(skill_item.name, all_skills)
            if matched_skill:
                hint = skill_item.confidence_hint
                base_confidence = 0.85 if hint == "high" else (0.65 if hint == "medium" else 0.45)

                # Bump proficiency if skill is used in a project or experience
                in_project = skill_item.name.strip().lower() in project_skills_set
                proficiency = 3 if (in_project or hint == "high") else 2
                if in_project:
                    base_confidence = min(0.95, base_confidence + 0.1)

                matched_skills_map[matched_skill.id] = {
                    "skill_id": matched_skill.id,
                    "proficiency": proficiency,
                    "confidence": base_confidence,
                    "evidence": skill_item.evidence or f"Extracted from resume ({matched_skill.name})",
                }

        # Upsert student_skills
        for skill_id, skill_data in matched_skills_map.items():
            existing = db.query(StudentSkill).filter(
                StudentSkill.profile_id == profile_id,
                StudentSkill.skill_id == skill_id,
            ).first()

            if existing:
                # Never overwrite a self_reported skill assertion
                if existing.source != SkillSource.SELF_REPORTED:
                    existing.proficiency = max(existing.proficiency, skill_data["proficiency"])
                    existing.confidence = max(existing.confidence, skill_data["confidence"])
                    existing.evidence = skill_data["evidence"]
                    existing.updated_at = datetime.utcnow()
            else:
                new_student_skill = StudentSkill(
                    profile_id=profile_id,
                    skill_id=skill_id,
                    proficiency=skill_data["proficiency"],
                    source=SkillSource.RESUME,
                    confidence=skill_data["confidence"],
                    evidence=skill_data["evidence"],
                )
                db.add(new_student_skill)

        # Step 4: Save extracted projects into profile_projects
        for proj in extraction_result.projects:
            matched_proj_skill_ids = []
            for s_name in proj.skills_used:
                ms = match_skill_to_taxonomy(s_name, all_skills)
                if ms:
                    matched_proj_skill_ids.append(ms.id)

            profile_proj = ProfileProject(
                profile_id=profile_id,
                title=proj.title,
                description=proj.description,
                skill_ids=matched_proj_skill_ids,
                source=ProjectSource.RESUME,
            )
            db.add(profile_proj)

        resume.status = ResumeStatus.PROCESSED
        db.commit()

    except Exception as e:
        logger.error(f"Resume background processing failed for resume {resume_id}: {e}")
        resume.status = ResumeStatus.FAILED
        db.commit()


class ResumeService:
    def __init__(self, db: Session):
        self.db = db

    def get_active_resume(self, profile_id: UUID) -> Resume | None:
        return self.db.query(Resume).filter(
            Resume.profile_id == profile_id,
            Resume.is_active == True,
        ).first()

    def get_student_skills(self, profile_id: UUID) -> list[StudentSkillResponse]:
        student_skills = self.db.query(StudentSkill).filter(
            StudentSkill.profile_id == profile_id
        ).all()

        results = []
        for ss in student_skills:
            if ss.skill:
                results.append(
                    StudentSkillResponse(
                        id=ss.id,
                        profile_id=ss.profile_id,
                        skill_id=ss.skill_id,
                        skill_name=ss.skill.name,
                        skill_slug=ss.skill.slug,
                        skill_category=ss.skill.category,
                        proficiency=ss.proficiency,
                        source=ss.source,
                        confidence=ss.confidence,
                        evidence=ss.evidence,
                        updated_at=ss.updated_at,
                    )
                )
        return results

    def update_student_skill(self, profile_id: UUID, skill_id: int, proficiency: int) -> StudentSkillResponse:
        skill = self.db.query(Skill).filter(Skill.id == skill_id).first()
        if not skill:
            raise HTTPException(status_code=404, detail={"code": "SKILL_NOT_FOUND", "message": "Skill not found in taxonomy"})

        student_skill = self.db.query(StudentSkill).filter(
            StudentSkill.profile_id == profile_id,
            StudentSkill.skill_id == skill_id,
        ).first()

        if student_skill:
            student_skill.proficiency = proficiency
            student_skill.source = SkillSource.SELF_REPORTED
            student_skill.confidence = 1.0
            student_skill.updated_at = datetime.utcnow()
        else:
            student_skill = StudentSkill(
                profile_id=profile_id,
                skill_id=skill_id,
                proficiency=proficiency,
                source=SkillSource.SELF_REPORTED,
                confidence=1.0,
                evidence="Self-reported by student",
            )
            self.db.add(student_skill)

        self.db.commit()
        self.db.refresh(student_skill)

        return StudentSkillResponse(
            id=student_skill.id,
            profile_id=student_skill.profile_id,
            skill_id=student_skill.skill_id,
            skill_name=skill.name,
            skill_slug=skill.slug,
            skill_category=skill.category,
            proficiency=student_skill.proficiency,
            source=student_skill.source,
            confidence=student_skill.confidence,
            evidence=student_skill.evidence,
            updated_at=student_skill.updated_at,
        )
