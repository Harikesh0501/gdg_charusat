import pytest
from app.schemas.profile import ProfileUpdateRequest
from app.models.profile import EducationLevel


def test_profile_update_schema_validation():
    # Valid payload
    valid_req = ProfileUpdateRequest(
        full_name="Alex Mercer",
        education_level=EducationLevel.UNDERGRADUATE,
        institution="MIT",
        graduation_year=2026,
        interests=["Web Dev", "AI/ML"],
        bio="Aspiring Full-Stack Software Engineer"
    )
    assert valid_req.full_name == "Alex Mercer"
    assert valid_req.education_level == EducationLevel.UNDERGRADUATE
    assert valid_req.graduation_year == 2026
    assert len(valid_req.interests) == 2


def test_profile_unauthorized_access(client):
    response = client.get("/api/profile")
    assert response.status_code == 403 or response.status_code == 401
