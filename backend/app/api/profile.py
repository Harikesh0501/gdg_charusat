from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.auth import get_current_user, CurrentUser
from app.services.profile import ProfileService
from app.schemas.profile import ProfileResponse, ProfileUpdateRequest

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("", response_model=ProfileResponse, summary="Get Current Student Profile")
def get_profile(
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ProfileService(db)
    return service.get_profile(current_user.profile_id)


@router.put("", response_model=ProfileResponse, summary="Update Profile & Onboarding Data")
def update_profile(
    update_data: ProfileUpdateRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ProfileService(db)
    return service.update_onboarding_profile(current_user.profile_id, update_data)
