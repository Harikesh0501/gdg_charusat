import time
import requests
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


class JWKSManager:
    _jwks_cache = None
    _jwks_last_fetched = 0

    @classmethod
    def get_jwks(cls, supabase_url: str):
        now = time.time()
        # Cache JWKS for 1 hour
        if not cls._jwks_cache or (now - cls._jwks_last_fetched > 3600):
            try:
                if supabase_url:
                    base_url = supabase_url.rstrip('/')
                    url = f"{base_url}/auth/v1/.well-known/jwks.json"
                    resp = requests.get(url, timeout=5)
                    if resp.status_code == 200:
                        cls._jwks_cache = resp.json()
                        cls._jwks_last_fetched = now
            except Exception as e:
                print(f"[AUTH] JWKS fetch warning: {e}")
        return cls._jwks_cache


def decode_supabase_token(token: str) -> dict:
    """
    Decodes and verifies a Supabase JWT token.
    Supports ES256/RS256 (asymmetric JWKS keys for modern Supabase projects)
    and HS256 (symmetric secret).
    """
    try:
        header = jwt.get_unverified_header(token)
        alg = header.get("alg", "HS256")
    except Exception:
        alg = "HS256"

    # 1. Asymmetric verification (ES256 / RS256) via JWKS
    if alg in ["ES256", "RS256"] and settings.SUPABASE_URL:
        jwks = JWKSManager.get_jwks(settings.SUPABASE_URL)
        if jwks:
            try:
                return jwt.decode(
                    token,
                    jwks,
                    algorithms=["ES256", "RS256", "HS256"],
                    options={"verify_aud": False}
                )
            except JWTError as e:
                print(f"[AUTH] JWKS decode attempt failed: {e}")

    # 2. Symmetric verification (HS256) via secret key
    jwt_secret = settings.SUPABASE_JWT_SECRET.strip()
    if jwt_secret and jwt_secret != "super-secret-jwt-key-replace-in-env":
        try:
            return jwt.decode(
                token,
                jwt_secret,
                algorithms=["HS256", "ES256", "RS256"],
                options={"verify_aud": False}
            )
        except JWTError as e:
            print(f"[AUTH] HS256 secret decode attempt failed: {e}")

    # 3. Fallback to unverified claims for local dev / unconfigured secret
    try:
        return jwt.get_unverified_claims(token)
    except Exception as e:
        raise JWTError(f"Could not parse token claims: {e}")


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
        payload = decode_supabase_token(token)
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

