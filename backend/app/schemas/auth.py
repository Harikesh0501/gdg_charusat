from uuid import UUID
from pydantic import BaseModel, EmailStr


class AuthSyncRequest(BaseModel):
    pass


class AuthSyncResponse(BaseModel):
    user_id: UUID
    profile_id: UUID
    supabase_user_id: str
    email: str | None
    onboarding_completed: bool
