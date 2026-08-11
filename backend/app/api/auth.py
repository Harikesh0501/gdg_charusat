from fastapi import APIRouter, Depends, HTTPException, status, Header
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import get_db
from app.core.auth import get_current_user, CurrentUser
from app.models.user import User
from app.models.profile import Profile
from app.schemas.auth import AuthSyncResponse
from app.schemas.profile import ProfileResponse

router = APIRouter(prefix="", tags=["Auth & Profile"])


@router.post("/auth/sync", response_model=AuthSyncResponse, summary="Sync Supabase User & Profile")
def sync_user(
    authorization: str = Header(..., description="Bearer <supabase_jwt>"),
    db: Session = Depends(get_db),
):
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_HEADER", "message": "Authorization header must start with Bearer"},
        )

    token = authorization.split(" ")[1]
    try:
        if settings.SUPABASE_JWT_SECRET and settings.SUPABASE_JWT_SECRET != "super-secret-jwt-key-replace-in-env":
            payload = jwt.decode(token, settings.SUPABASE_JWT_SECRET, algorithms=["HS256"], options={"verify_aud": False})
        else:
            payload = jwt.get_unverified_claims(token)

        supabase_user_id: str = payload.get("sub")
        email: str | None = payload.get("email")
        if not supabase_user_id:
            raise HTTPException(status_code=401, detail={"code": "INVALID_TOKEN", "message": "Missing sub in JWT"})
    except JWTError as e:
        raise HTTPException(status_code=401, detail={"code": "INVALID_TOKEN", "message": f"JWT decode failed: {str(e)}"})

    user = db.query(User).filter(User.supabase_user_id == supabase_user_id).first()
    if not user:
        user = User(supabase_user_id=supabase_user_id, email=email)
        db.add(user)
        db.commit()
        db.refresh(user)

    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not profile:
        profile = Profile(user_id=user.id, onboarding_completed=False)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return AuthSyncResponse(
        user_id=user.id,
        profile_id=profile.id,
        supabase_user_id=user.supabase_user_id,
        email=user.email,
        onboarding_completed=profile.onboarding_completed,
    )


@router.get("/profile", response_model=ProfileResponse, summary="Get Current Student Profile")
def get_profile(
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.id == current_user.profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Profile not found"})
    return profile
