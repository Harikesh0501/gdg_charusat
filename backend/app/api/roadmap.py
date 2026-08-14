from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.auth import get_current_user, CurrentUser
from app.services.roadmap import RoadmapService
from app.services.progress import ProgressService
from app.schemas.roadmap import (
    RoadmapResponse,
    RoadmapPhaseResponse,
    RoadmapItemResponse,
    ItemStatusUpdateRequest,
)
from app.models.roadmap import RoadmapItemStatus

router = APIRouter(prefix="", tags=["Learning Roadmap Engine"])


def _to_roadmap_response(roadmap) -> RoadmapResponse:
    phases_res = []
    total_hours = 0
    total_items = 0
    completed_items = 0

    for phase in roadmap.phases:
        items_res = []
        for item in phase.items:
            total_items += 1
            total_hours += item.estimated_hours or 0
            if item.status == RoadmapItemStatus.COMPLETED:
                completed_items += 1

            items_res.append(
                RoadmapItemResponse(
                    id=str(item.id),
                    phase_id=str(item.phase_id),
                    type=item.type,
                    ref_skill_id=str(item.ref_skill_id) if item.ref_skill_id else None,
                    ref_resource_id=str(item.ref_resource_id) if item.ref_resource_id else None,
                    ref_project_id=str(item.ref_project_id) if item.ref_project_id else None,
                    ref_url=item.ref_url,
                    ref_provider=item.ref_provider,
                    chapter_title=item.chapter_title,
                    title=item.title,
                    order_index=item.order_index,
                    status=item.status,
                    estimated_hours=item.estimated_hours or 0,
                )
            )

        phases_res.append(
            RoadmapPhaseResponse(
                id=str(phase.id),
                roadmap_id=str(phase.roadmap_id),
                order_index=phase.order_index,
                title=phase.title,
                summary=phase.summary,
                items=items_res,
            )
        )

    pct = round((completed_items / total_items) * 100, 1) if total_items > 0 else 0.0

    return RoadmapResponse(
        id=str(roadmap.id),
        profile_id=str(roadmap.profile_id),
        career_role_id=str(roadmap.career_role_id),
        status=roadmap.status,
        overall_strategy=roadmap.overall_strategy,
        generated_at=roadmap.generated_at,
        model_used=roadmap.model_used,
        total_hours=total_hours,
        total_items_count=total_items,
        completed_items_count=completed_items,
        progress_percentage=pct,
        phases=phases_res,
    )


@router.get("/roadmap", response_model=Optional[RoadmapResponse], summary="Get Active Learning Roadmap")
async def get_active_roadmap(
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RoadmapService(db)
    roadmap = await service.get_or_generate_roadmap(current_user.profile_id)
    if not roadmap:
        return None
    return _to_roadmap_response(roadmap)


@router.post("/roadmap/generate", response_model=RoadmapResponse, summary="Generate / Regenerate Learning Roadmap")
async def generate_roadmap(
    career_role_id: Optional[str] = Query(None, description="Optional career role ID to generate roadmap for"),
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RoadmapService(db)

    target_role_id = career_role_id
    if not target_role_id:
        goal = service.career_repo.get_active_career_goal(current_user.profile_id)
        if not goal:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": "NO_CAREER_GOAL", "message": "Please select a target career goal first"},
            )
        target_role_id = str(goal.career_role_id)

    try:
        roadmap = await service.generate_roadmap(current_user.profile_id, target_role_id)
        return _to_roadmap_response(roadmap)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": str(e)},
        )


@router.patch("/roadmap/items/{item_id}", response_model=RoadmapItemResponse, summary="Update Roadmap Item Status")
def update_item_status(
    item_id: str,
    req: ItemStatusUpdateRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    progress_service = ProgressService(db)
    roadmap_service = RoadmapService(db)
    try:
        # Trigger Progress Feedback Loop (bumps proficiency and logs event on COMPLETED)
        progress_service.handle_item_status_update(current_user.profile_id, item_id, req.status)
        updated_item = roadmap_service.roadmap_repo.get_item_by_id(item_id)

        return RoadmapItemResponse(
            id=str(updated_item.id),
            phase_id=str(updated_item.phase_id),
            type=updated_item.type,
            ref_skill_id=str(updated_item.ref_skill_id) if updated_item.ref_skill_id else None,
            ref_resource_id=str(updated_item.ref_resource_id) if updated_item.ref_resource_id else None,
            ref_project_id=str(updated_item.ref_project_id) if updated_item.ref_project_id else None,
            ref_url=updated_item.ref_url,
            ref_provider=updated_item.ref_provider,
            chapter_title=updated_item.chapter_title,
            title=updated_item.title,
            order_index=updated_item.order_index,
            status=updated_item.status,
            estimated_hours=updated_item.estimated_hours or 0,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": str(e)},
        )
