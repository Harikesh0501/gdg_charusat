import io
import pytest
import pypdf
from rapidfuzz import process, fuzz
from app.models.skill import Skill, SkillCategory
from app.services.text_extractor import extract_text_from_bytes


def test_text_extractor_pdf():
    # Build minimal valid in-memory PDF using pypdf
    writer = pypdf.PdfWriter()
    writer.add_blank_page(width=100, height=100)
    pdf_bytes = io.BytesIO()
    writer.write(pdf_bytes)
    pdf_data = pdf_bytes.getvalue()

    # Should raise ValueError because blank page yields near-empty text (< 50 chars)
    with pytest.raises(ValueError, match="too short"):
        extract_text_from_bytes(pdf_data, "sample.pdf")


def test_fuzzy_skill_matching():
    sample_skills = [
        Skill(id=1, name="Python", slug="python", category=SkillCategory.PROGRAMMING_LANGUAGE, aliases=["py", "python3"]),
        Skill(id=2, name="React", slug="react", category=SkillCategory.FRAMEWORK_LIBRARY, aliases=["reactjs", "react.js"]),
        Skill(id=3, name="PostgreSQL", slug="postgresql", category=SkillCategory.DATABASE, aliases=["postgres", "psql"]),
    ]

    choices = ["python", "py", "python3", "react", "reactjs", "react.js", "postgresql", "postgres", "psql"]
    lookup = {
        "python": sample_skills[0],
        "py": sample_skills[0],
        "python3": sample_skills[0],
        "react": sample_skills[1],
        "reactjs": sample_skills[1],
        "react.js": sample_skills[1],
        "postgresql": sample_skills[2],
        "postgres": sample_skills[2],
        "psql": sample_skills[2],
    }

    # Exact match
    match1 = process.extractOne("react.js", choices, scorer=fuzz.WRatio)
    assert match1 and match1[1] >= 82
    assert lookup[match1[0]].id == 2

    # Fuzzy match (lowercased as done in ResumeService)
    match2 = process.extractOne("POSTGRES".lower(), choices, scorer=fuzz.WRatio)
    assert match2 and match2[1] >= 82
    assert lookup[match2[0]].id == 3


def test_resume_upload_unauthorized(client):
    response = client.post("/api/resume/upload")
    assert response.status_code in [401, 403]
