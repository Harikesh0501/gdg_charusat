import pytest
from app.models.skill import Skill, SkillCategory
from app.services.resume import match_skill_to_taxonomy


def test_skill_taxonomy_matching():
    sample_skills = [
        Skill(id=1, name="Python", slug="python", category=SkillCategory.PROGRAMMING_LANGUAGE, aliases=["py", "python3"]),
        Skill(id=2, name="React", slug="react", category=SkillCategory.FRAMEWORK_LIBRARY, aliases=["reactjs", "react.js"]),
        Skill(id=3, name="PostgreSQL", slug="postgresql", category=SkillCategory.DATABASE, aliases=["postgres", "psql"]),
    ]

    # Exact canonical match
    match1 = match_skill_to_taxonomy("Python", sample_skills)
    assert match1 is not None
    assert match1.id == 1

    # Alias match
    match2 = match_skill_to_taxonomy("react.js", sample_skills)
    assert match2 is not None
    assert match2.id == 2

    # Case-insensitive alias match
    match3 = match_skill_to_taxonomy("POSTGRES", sample_skills)
    assert match3 is not None
    assert match3.id == 3

    # Unknown skill (not in taxonomy)
    match_unknown = match_skill_to_taxonomy("NonExistentSkill123", sample_skills)
    assert match_unknown is None


def test_resumes_upload_unauthorized(client):
    response = client.post("/api/resumes/upload")
    assert response.status_code in [401, 403]
