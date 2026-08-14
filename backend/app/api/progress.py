from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.auth import get_current_user, CurrentUser
from app.services.progress import ProgressService
from app.schemas.progress import ProgressAnalyticsResponse

router = APIRouter(prefix="/progress", tags=["Progress & Analytics Engine"])


@router.get("", response_model=ProgressAnalyticsResponse)
def get_progress_analytics(
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves student progress analytics, readiness score, roadmap completion, and recent activity timeline.
    """
    if not current_user.profile_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found. Please complete onboarding first."
        )

    service = ProgressService(db)
    result = service.get_progress_analytics(profile_id=current_user.profile_id)
    return result
