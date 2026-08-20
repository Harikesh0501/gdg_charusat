import uuid
import logging
import re
from typing import List, Optional, Tuple, Dict
from rapidfuzz import process, fuzz
from sqlalchemy.orm import Session

from app.core.db import SessionLocal
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
        normalizes/creates skills guaranteed into taxonomy, updates student profile,
        and auto-regenerates active roadmap based on new extracted resume skills.
        Uses a dedicated fresh DB session so it does not rely on request-scoped session.
        """
        bg_db = SessionLocal()
        bg_repo = ResumeRepository(bg_db)
        logger.info(f"Starting in-memory processing for resume {resume_id} (profile {profile_id})")
        bg_repo.update_resume_status(resume_id, ResumeStatus.PROCESSING)

        try:
            # 1. Text Extraction
            raw_text = extract_text_from_bytes(file_bytes, filename)

            # 2. AI Structured Extraction via Groq (with deterministic keyword fallback)
            try:
                ai_result: ResumeExtractionResult = await self.extractor.extract_resume(raw_text)
            except Exception as ai_err:
                logger.warning(f"AI extraction fallback triggered for resume {resume_id}: {ai_err}")
                # Keyword fallback: scan raw_text for taxonomy skills
                all_taxonomy = bg_repo.get_all_taxonomy_skills()
                fallback_skills = []
                low_text = raw_text.lower()
                for sk in all_taxonomy:
                    cname = re.sub(r'\s+[0-9a-fA-F]{6,12}$', '', sk.name).strip()
                    if len(cname) >= 2 and re.search(r'\b' + re.escape(cname.lower()) + r'\b', low_text):
                        from app.ai.schemas.resume_extraction import ExtractedSkill
                        fallback_skills.append(
                            ExtractedSkill(
                                name=cname,
                                confidence_hint="medium",
                                evidence=f"Found in resume text: {cname}"
                            )
                        )
                ai_result = ResumeExtractionResult(skills=fallback_skills)

            # 3. Fast Pre-indexed Skill Taxonomy Search
            all_skills = bg_repo.get_all_taxonomy_skills()
            skill_lookup: Dict[str, Skill] = {}
            choices: List[str] = []

            for s in all_skills:
                clean_s_name = re.sub(r'\s+[0-9a-fA-F]{6,12}$', '', s.name).strip().lower()
                skill_lookup[clean_s_name] = s
                choices.append(clean_s_name)
                if s.aliases:
                    for alias in s.aliases:
                        alias_key = alias.lower().strip()
                        skill_lookup[alias_key] = s
                        choices.append(alias_key)

            # Collect skills used in projects & experience for applied score
            skills_used_in_projects = set()
            for p in ai_result.projects:
                for sk in p.skills_used:
                    skills_used_in_projects.add(sk.lower().strip())

            for exp in ai_result.experience:
                for sk in exp.skills_used:
                    skills_used_in_projects.add(sk.lower().strip())

            # 4. Skill Normalization & Fallback Dynamic Skill Creation (Guarantees 100% skill capture!)
            matched_skills_map: Dict[int, Tuple[Skill, float, int, Optional[str]]] = {}
            confidence_map = {"low": 0.50, "medium": 0.70, "high": 0.90}

            for extracted_skill in ai_result.skills:
                raw_name = extracted_skill.name.strip()
                if not raw_name:
                    continue

                raw_key = raw_name.lower()
                best_match = None

                # Exact lookup first
                if raw_key in skill_lookup:
                    best_match = skill_lookup[raw_key]
                elif choices:
                    # Strict fuzzy match with token_sort_ratio threshold >= 82
                    match_res = process.extractOne(raw_key, choices, scorer=fuzz.token_sort_ratio)
                    if match_res and match_res[1] >= 82:
                        best_match = skill_lookup.get(match_res[0])

                # If still no match in taxonomy, dynamically create skill in taxonomy!
                if not best_match:
                    clean_title = raw_name.title()
                    clean_slug = re.sub(r'[^a-z0-9]+', '-', raw_key).strip('-')
                    
                    # Check if already exists by slug
                    existing_db_skill = bg_db.query(Skill).filter(Skill.slug == clean_slug).first()
                    if existing_db_skill:
                        best_match = existing_db_skill
                    else:
                        best_match = Skill(
                            name=clean_title,
                            slug=clean_slug,
                            category="concept",
                            difficulty=2,
                            description=f"Skill extracted from student resume",
                        )
                        bg_db.add(best_match)
                        bg_db.commit()
                        bg_db.refresh(best_match)
                        
                        # Add to lookup so duplicates are matched
                        skill_lookup[raw_key] = best_match

                if best_match:
                    base_confidence = confidence_map.get(extracted_skill.confidence_hint.lower(), 0.70)
                    in_applied_work = raw_key in skills_used_in_projects or any(
                        alias.lower() in skills_used_in_projects for alias in (best_match.aliases or [])
                    )

                    proficiency = 3 if in_applied_work else 2
                    confidence = min(0.98, base_confidence + (0.15 if in_applied_work else 0.0))

                    if best_match.id not in matched_skills_map:
                        matched_skills_map[best_match.id] = (
                            best_match,
                            confidence,
                            proficiency,
                            extracted_skill.evidence,
                        )

            # 5. Clear previous resume-sourced skills for this profile to ensure strictly current resume skills
            bg_db.query(StudentSkill).filter(
                StudentSkill.profile_id == profile_id,
                StudentSkill.source == SkillSource.RESUME
            ).delete(synchronize_session=False)
            bg_db.commit()

            # Persist matched skills into student_skills
            for skill_id, (skill_obj, confidence, proficiency, evidence) in matched_skills_map.items():
                bg_repo.upsert_student_skill(
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

                bg_repo.create_profile_project(
                    profile_id=profile_id,
                    title=project.title,
                    description=project.description,
                    skill_ids=project_skill_ids,
                )

            # 7. Record Extraction Record
            bg_repo.create_extraction_record(
                resume_id=resume_id,
                profile_id=profile_id,
                raw_text=raw_text,
                extracted_json=ai_result.model_dump(),
            )

            # 8. Set status to processed & commit immediately
            bg_repo.update_resume_status(resume_id, ResumeStatus.PROCESSED)
            bg_db.commit()
            logger.info(f"Resume {resume_id} successfully processed with {len(matched_skills_map)} skills extracted.")

            # 9. Auto-regenerate active roadmap in detached background block
            try:
                from app.services.roadmap import RoadmapService
                roadmap_db = SessionLocal()
                try:
                    roadmap_service = RoadmapService(roadmap_db)
                    goal = roadmap_service.career_repo.get_active_career_goal(profile_id)
                    if goal:
                        await roadmap_service.generate_roadmap(profile_id, goal.career_role_id)
                        logger.info(f"Auto-regenerated roadmap for profile {profile_id} after resume extraction.")
                finally:
                    roadmap_db.close()
            except Exception as r_err:
                logger.warn(f"Auto-roadmap generation after resume note: {r_err}")

        except Exception as e:
            logger.error(f"Error processing resume {resume_id}: {e}", exc_info=True)
            bg_repo.update_resume_status(resume_id, ResumeStatus.FAILED)
        finally:
            bg_db.close()
