import uuid
import logging
from typing import List, Optional, Tuple, Dict
from rapidfuzz import process, fuzz
from sqlalchemy.orm import Session

from app.models.resume import Resume, ResumeStatus
from app.models.skill import Skill
from app.models.student_skill import StudentSkill, SkillSource
from app.repositories.resume import ResumeRepository
from app.services.text_extractor import extract_text_from_bytes
from app.ai.extractors.resume_extractor import ResumeExtractor
from app.ai.schemas.resume_extraction import ResumeExtractionResult

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {"pdf", "docx"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


class ResumeService:
    def __init__(self, db: Session):
        self.repo = ResumeRepository(db)
        self.extractor = ResumeExtractor()

    def validate_file(self, file_bytes: bytes, filename: str) -> str:
        ext = filename.lower().split(".")[-1]
        if ext not in ALLOWED_EXTENSIONS:
            raise ValueError(f"Invalid file type .{ext}. Only .pdf and .docx files are supported.")

        if len(file_bytes) > MAX_FILE_SIZE:
            raise ValueError("File size exceeds maximum limit of 5MB.")

        return ext

    def create_initial_resume(self, profile_id: uuid.UUID, filename: str) -> Resume:
        return self.repo.create_resume_record(profile_id, filename)

    async def process_resume_in_background(
        self, resume_id: uuid.UUID, profile_id: uuid.UUID, file_bytes: bytes, filename: str
    ):
        """
        Background task: parses resume file in-memory, calls Groq AI extraction,
        normalizes skills via rapidfuzz against taxonomy, and updates student profile.
        """
        logger.info(f"Starting in-memory processing for resume {resume_id} (profile {profile_id})")
        self.repo.update_resume_status(resume_id, ResumeStatus.PROCESSING)

        try:
            # 1. Text Extraction
            raw_text = extract_text_from_bytes(file_bytes, filename)

            # 2. AI Structured Extraction via Groq Llama 4 Scout
            ai_result: ResumeExtractionResult = await self.extractor.extract_resume(raw_text)

            # 3. Build Skill Taxonomy Search Index (names + aliases)
            all_skills = self.repo.get_all_taxonomy_skills()
            skill_lookup: Dict[str, Skill] = {}
            choices: List[str] = []

            for s in all_skills:
                name_key = s.name.lower()
                skill_lookup[name_key] = s
                choices.append(name_key)
                if s.aliases:
                    for alias in s.aliases:
                        alias_key = alias.lower()
                        skill_lookup[alias_key] = s
                        choices.append(alias_key)

            # Collect all skills used across projects and experience to boost proficiency/confidence
            skills_used_in_projects = set()
            for p in ai_result.projects:
                for sk in p.skills_used:
                    skills_used_in_projects.add(sk.lower())

            for exp in ai_result.experience:
                for sk in exp.skills_used:
                    skills_used_in_projects.add(sk.lower())

            # 4. Normalize extracted skills via fuzzy matching against taxonomy
            matched_skills_map: Dict[int, Tuple[Skill, float, int, Optional[str]]] = {}

            confidence_map = {"low": 0.45, "medium": 0.65, "high": 0.85}

            for extracted_skill in ai_result.skills:
                raw_name = extracted_skill.name.strip().lower()
                if not raw_name:
                    continue

                best_match = None
                # Exact match
                if raw_name in skill_lookup:
                    best_match = skill_lookup[raw_name]
                elif choices:
                    # Fuzzy match with rapidfuzz (similarity threshold >= 82)
                    match_res = process.extractOne(raw_name, choices, scorer=fuzz.WRatio)
                    if match_res and match_res[1] >= 82:
                        matched_key = match_res[0]
                        best_match = skill_lookup.get(matched_key)

                if best_match:
                    base_confidence = confidence_map.get(extracted_skill.confidence_hint.lower(), 0.65)

                    # Check if skill was mentioned in project/experience
                    in_applied_work = raw_name in skills_used_in_projects or any(
                        alias.lower() in skills_used_in_projects for alias in (best_match.aliases or [])
                    )

                    proficiency = 3 if in_applied_work else 2
                    confidence = min(0.95, base_confidence + (0.15 if in_applied_work else 0.0))

                    if best_match.id not in matched_skills_map:
                        matched_skills_map[best_match.id] = (
                            best_match,
                            confidence,
                            proficiency,
                            extracted_skill.evidence,
                        )

            # 5. Persist matched skills into student_skills
            for skill_id, (skill_obj, confidence, proficiency, evidence) in matched_skills_map.items():
                self.repo.upsert_student_skill(
                    profile_id=profile_id,
                    skill_id=skill_id,
                    proficiency=proficiency,
                    confidence=confidence,
                    evidence=evidence,
                    source=SkillSource.RESUME,
                )

            # 6. Persist projects into profile_projects
            for project in ai_result.projects:
                project_skill_ids = []
                for sk_name in project.skills_used:
                    k = sk_name.strip().lower()
                    if k in skill_lookup:
                        project_skill_ids.append(skill_lookup[k].id)

                self.repo.create_profile_project(
                    profile_id=profile_id,
                    title=project.title,
                    description=project.description,
                    skill_ids=project_skill_ids,
                )

            # 7. Record Extraction Data
            self.repo.create_extraction_record(
                resume_id=resume_id,
                profile_id=profile_id,
                raw_text=raw_text,
                extracted_json=ai_result.model_dump(),
            )

            # 8. Set status to processed
            self.repo.update_resume_status(resume_id, ResumeStatus.PROCESSED)
            logger.info(f"Resume {resume_id} successfully processed with {len(matched_skills_map)} skills extracted.")

        except Exception as e:
            logger.error(f"Error processing resume {resume_id}: {e}", exc_info=True)
            self.repo.update_resume_status(resume_id, ResumeStatus.FAILED)
