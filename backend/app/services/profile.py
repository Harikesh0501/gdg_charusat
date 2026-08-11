from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.profile import ProfileRepository
from app.schemas.profile import ProfileUpdateRequest, ProfileResponse
from app.models.profile import Profile


class ProfileService:
    def __init__(self, db: Session):
        self.repo = ProfileRepository(db)

    def get_profile(self, profile_id: UUID) -> Profile:
        profile = self.repo.get_by_id(profile_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": "PROFILE_NOT_FOUND", "message": "Profile not found"},
            )
        return profile

    def update_onboarding_profile(self, profile_id: UUID, update_data: ProfileUpdateRequest) -> Profile:
        profile = self.get_profile(profile_id)

        # Validation: Require full_name and education_level for completing onboarding
        if not update_data.full_name and not profile.full_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": "VALIDATION_ERROR", "message": "Full name is required to complete onboarding"},
            )

        if not update_data.education_level and not profile.education_level:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": "VALIDATION_ERROR", "message": "Education level is required to complete onboarding"},
            )

        return self.repo.update_profile(profile, update_data, mark_completed=True)
