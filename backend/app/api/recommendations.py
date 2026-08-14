from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.auth import get_current_user, CurrentUser
from app.services.recommendations import RecommendationService
from app.schemas.recommendation import RecommendationsResponse

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get("", response_model=RecommendationsResponse)
async def get_recommendations(
    category: str = Query("resource", description="Category: 'resource', 'project', or 'certification'"),
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves candidate items (resources/projects/certifications), applies weighted scoring math,
    and returns personalized recommendations with AI explanations.
    """
    if not current_user.profile_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found. Please complete onboarding first."
        )

    service = RecommendationService(db)
    result = await service.get_recommendations(profile_id=current_user.profile_id, category=category)
    return result
