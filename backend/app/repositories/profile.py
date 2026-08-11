from uuid import UUID
from sqlalchemy.orm import Session
from app.models.profile import Profile
from app.schemas.profile import ProfileUpdateRequest


class ProfileRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, profile_id: UUID) -> Profile | None:
        return self.db.query(Profile).filter(Profile.id == profile_id).first()

    def get_by_user_id(self, user_id: UUID) -> Profile | None:
        return self.db.query(Profile).filter(Profile.user_id == user_id).first()

    def update_profile(self, profile: Profile, update_data: ProfileUpdateRequest, mark_completed: bool = True) -> Profile:
        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            if value is not None:
                setattr(profile, key, value)

        if mark_completed:
            profile.onboarding_completed = True

        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        return profile
