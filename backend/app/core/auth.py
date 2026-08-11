from dataclasses import dataclass
from uuid import UUID
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import get_db
from app.models.user import User
from app.models.profile import Profile

security = HTTPBearer()


@dataclass
class CurrentUser:
    user_id: UUID
    profile_id: UUID
    supabase_user_id: str
    email: str | None


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> CurrentUser:
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={"code": "UNAUTHORIZED", "message": "Could not validate authentication credentials"},
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode JWT using Supabase JWT Secret (HS256 is default for Supabase JWTs)
        # Fallback to unverified decode if secret not configured in local dev mode
        if settings.SUPABASE_JWT_SECRET and settings.SUPABASE_JWT_SECRET != "super-secret-jwt-key-replace-in-env":
            payload = jwt.decode(token, settings.SUPABASE_JWT_SECRET, algorithms=["HS256"], options={"verify_aud": False})
        else:
            payload = jwt.get_unverified_claims(token)

        supabase_user_id: str = payload.get("sub")
        if supabase_user_id is None:
            raise credentials_exception
        email: str | None = payload.get("email")
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.supabase_user_id == supabase_user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "USER_NOT_SYNCED", "message": "User not synchronized in database. Call /api/auth/sync first."},
        )

    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "PROFILE_NOT_FOUND", "message": "Profile not found for user."},
        )

    return CurrentUser(
        user_id=user.id,
        profile_id=profile.id,
        supabase_user_id=supabase_user_id,
        email=email or user.email,
    )
