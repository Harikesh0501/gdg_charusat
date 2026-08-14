import uuid
import asyncio
from app.services.recommendations import RecommendationService
from app.models.skill import Skill, SkillCategory
from app.models.career import CareerRole, CareerRoleSkill, SkillImportance, CareerGoal
from app.models.recommendation import Resource, Project, ResourceType
from app.models.user import User
from app.models.profile import Profile


def test_recommendation_candidate_retrieval_and_scoring(db):
    u_id = uuid.uuid4().hex[:8]

    # Create Skills: React (Gap), FastAPI (Gap)
    s_react = Skill(name=f"React {u_id}", slug=f"react-{u_id}", category=SkillCategory.FRAMEWORK_LIBRARY)
    s_fastapi = Skill(name=f"FastAPI {u_id}", slug=f"fastapi-{u_id}", category=SkillCategory.FRAMEWORK_LIBRARY)
    db.add_all([s_react, s_fastapi])
    db.commit()

    # Create Career Role: Fullstack Dev
    role = CareerRole(name=f"Fullstack Dev {u_id}", slug=f"fullstack-dev-{u_id}", description="Test Role")
    db.add(role)
    db.commit()

    link1 = CareerRoleSkill(career_role_id=role.id, skill_id=s_react.id, required_proficiency=3, importance=SkillImportance.CORE)
    link2 = CareerRoleSkill(career_role_id=role.id, skill_id=s_fastapi.id, required_proficiency=3, importance=SkillImportance.CORE)
    db.add_all([link1, link2])
    db.commit()

    # Create Resource tagged with React
    r_react = Resource(
        title=f"React Masterclass {u_id}",
        url="https://react.dev",
        provider="React.dev",
        type=ResourceType.COURSE,
        description="Comprehensive React Guide",
        difficulty=2,
        estimated_hours=10
    )
    r_react.skills.append(s_react)

    # Create Project tagged with both React AND FastAPI (multi-skill project)
    p_multi = Project(
        title=f"Fullstack App Project {u_id}",
        description="Build fullstack app with React and FastAPI",
        difficulty=3,
        estimated_hours=20,
        career_relevance="Fullstack Dev"
    )
    p_multi.skills.extend([s_react, s_fastapi])
    db.add_all([r_react, p_multi])
    db.commit()

    # Create User & Profile
    user = User(supabase_user_id=f"test_sub_rec_{uuid.uuid4()}")
    db.add(user)
    db.commit()
    profile = Profile(user_id=user.id, full_name="Recommendation Student", interests=["React", "FastAPI"])
    db.add(profile)
    db.commit()

    # Set Goal
    goal = CareerGoal(profile_id=profile.id, career_role_id=role.id, target_timeline_months=6)
    db.add(goal)
    db.commit()

    # Test Recommendations
    service = RecommendationService(db)

    # Test Resource Category
    res_rec = asyncio.run(service.get_recommendations(profile.id, category="resource"))
    assert res_rec["career_role_id"] == role.id
    assert len(res_rec["items"]) >= 1
    found_r = next(item for item in res_rec["items"] if item["id"] == r_react.id)
    assert "React" in found_r["matched_gap_skills"][0]
    assert found_r["score"] > 0
    assert len(found_r["explanation"]) > 5

    # Test Project Category
    proj_rec = asyncio.run(service.get_recommendations(profile.id, category="project"))
    assert len(proj_rec["items"]) >= 1
    found_p = next(item for item in proj_rec["items"] if item["id"] == p_multi.id)
    # Project matching both skills must have higher skill_coverage signal score
    assert len(found_p["matched_gap_skills"]) == 2
    assert found_p["score"] > found_r["score"]  # multi-coverage bonus
