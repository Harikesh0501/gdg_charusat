from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.auth import get_current_user, CurrentUser
from app.models.skill import Skill
from app.models.student_skill import StudentSkill, SkillSource
from app.repositories.resume import ResumeRepository
from app.schemas.skill import (
    SkillsProfileResponse,
    StudentSkillResponse,
    StudentSkillCreateRequest,
    SkillSchema,
)

router = APIRouter(prefix="/skills", tags=["Skills Profile"])


@router.get("", response_model=SkillsProfileResponse, summary="Get Current Student Skills Profile")
def get_student_skills(
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repo = ResumeRepository(db)
    student_skills = repo.get_student_skills(current_user.profile_id)

    formatted_skills = []
    for ss in student_skills:
        formatted_skills.append(
            StudentSkillResponse(
                id=str(ss.id),
                skill_id=ss.skill_id,
                skill_name=ss.skill.name if ss.skill else "Unknown Skill",
                category=ss.skill.category if ss.skill else "concept",
                proficiency=ss.proficiency,
                source=ss.source,
                confidence=ss.confidence,
                evidence=ss.evidence,
            )
        )

    return SkillsProfileResponse(
        total_skills=len(formatted_skills),
        skills=formatted_skills,
    )


@router.post("", response_model=StudentSkillResponse, summary="Add or Update Manual Skill")
def add_manual_skill(
    req: StudentSkillCreateRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    skill = db.query(Skill).filter(Skill.id == req.skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "SKILL_NOT_FOUND", "message": "Skill ID not found in taxonomy"},
        )

    repo = ResumeRepository(db)
    student_skill = repo.upsert_student_skill(
        profile_id=current_user.profile_id,
        skill_id=req.skill_id,
        proficiency=req.proficiency,
        confidence=1.0,
        evidence="Self-reported by student",
        source=SkillSource.SELF_REPORTED,
    )

    return StudentSkillResponse(
        id=str(student_skill.id),
        skill_id=student_skill.skill_id,
        skill_name=skill.name,
        category=skill.category,
        proficiency=student_skill.proficiency,
        source=student_skill.source,
        confidence=student_skill.confidence,
        evidence=student_skill.evidence,
    )


@router.delete("/{skill_id}", summary="Remove Skill from Student Profile")
def remove_student_skill(
    skill_id: int,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student_skill = (
        db.query(StudentSkill)
        .filter(StudentSkill.profile_id == current_user.profile_id, StudentSkill.skill_id == skill_id)
        .first()
    )

    if not student_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Skill not found in profile"},
        )

    db.delete(student_skill)
    db.commit()
    return {"message": "Skill removed from profile successfully"}


@router.get("/taxonomy", response_model=List[SkillSchema], summary="Get Curated Skill Taxonomy")
def get_skill_taxonomy(db: Session = Depends(get_db)):
    return db.query(Skill).order_by(Skill.name.asc()).all()
