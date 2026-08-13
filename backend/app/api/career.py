from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.auth import get_current_user, CurrentUser
from app.repositories.career import CareerRepository
from app.services.skill_gap import SkillGapService
from app.schemas.career import (
    CareerRoleResponse,
    SetCareerGoalRequest,
    CareerGoalResponse,
    SkillGapResponse,
)

router = APIRouter(prefix="", tags=["Career Goals & Skill Gap Engine"])


@router.get("/career-roles", response_model=List[CareerRoleResponse], summary="List All Curated Career Roles")
def list_career_roles(db: Session = Depends(get_db)):
    repo = CareerRepository(db)
    roles = repo.get_all_roles()
    res = []
    for r in roles:
        res.append(
            CareerRoleResponse(
                id=r.id,
                name=r.name,
                slug=r.slug,
                description=r.description,
                role_skills_count=len(r.role_skills) if r.role_skills else 0,
            )
        )
    return res


@router.post("/career-goal", response_model=CareerGoalResponse, summary="Set Target Career Goal")
def set_career_goal(
    req: SetCareerGoalRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repo = CareerRepository(db)
    role = repo.get_role_by_id(req.career_role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "ROLE_NOT_FOUND", "message": f"Career Role ID {req.career_role_id} not found"},
        )

    goal = repo.set_career_goal(
        profile_id=current_user.profile_id,
        career_role_id=req.career_role_id,
        target_timeline_months=req.target_timeline_months,
    )

    return CareerGoalResponse(
        id=goal.id,
        profile_id=goal.profile_id,
        career_role_id=role.id,
        career_role_name=role.name,
        career_role_slug=role.slug,
        target_timeline_months=goal.target_timeline_months,
        created_at=goal.created_at,
        updated_at=goal.updated_at,
    )


@router.get("/career-goal", response_model=Optional[CareerGoalResponse], summary="Get Current Active Career Goal")
def get_career_goal(
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repo = CareerRepository(db)
    goal = repo.get_active_career_goal(current_user.profile_id)
    if not goal or not goal.career_role:
        return None

    return CareerGoalResponse(
        id=goal.id,
        profile_id=goal.profile_id,
        career_role_id=goal.career_role.id,
        career_role_name=goal.career_role.name,
        career_role_slug=goal.career_role.slug,
        target_timeline_months=goal.target_timeline_months,
        created_at=goal.created_at,
        updated_at=goal.updated_at,
    )


@router.get("/skill-gap", response_model=SkillGapResponse, summary="Compute Live Skill Gap & Readiness Score")
def get_skill_gap(
    career_role_id: Optional[int] = Query(None, description="Optional career role ID to test against"),
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    target_role_id = career_role_id

    # Fallback to student's active career goal if no query param supplied
    if not target_role_id:
        repo = CareerRepository(db)
        active_goal = repo.get_active_career_goal(current_user.profile_id)
        if active_goal:
            target_role_id = active_goal.career_role_id
        else:
            # Default to Full-Stack Developer (Role ID 3 or first available)
            roles = repo.get_all_roles()
            if roles:
                target_role_id = roles[0].id
            else:
                raise HTTPException(
                    status_code=404,
                    detail={"code": "NO_ROLES", "message": "No career roles found in system"},
                )

    service = SkillGapService(db)
    try:
        gap_res = service.compute_skill_gap(current_user.profile_id, target_role_id)
        return gap_res
    except ValueError as e:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": str(e)})
