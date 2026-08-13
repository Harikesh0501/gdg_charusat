import uuid
import pytest
from app.services.skill_gap import classify_priority_bucket, IMPORTANCE_WEIGHTS, SkillGapService
from app.models.career import SkillImportance, CareerRole, CareerRoleSkill
from app.models.skill import Skill, SkillCategory
from app.models.student_skill import StudentSkill, SkillSource


def test_priority_bucket_classification():
    assert classify_priority_bucket(9) == "high"
    assert classify_priority_bucket(12) == "high"
    assert classify_priority_bucket(6) == "medium"
    assert classify_priority_bucket(4) == "medium"
    assert classify_priority_bucket(3) == "low"
    assert classify_priority_bucket(1) == "low"
    assert classify_priority_bucket(0) == "na"


from app.models.user import User
from app.models.profile import Profile


def test_readiness_score_formula_and_gap_sorting(db):
    # Setup test role with 2 skills
    u_id = uuid.uuid4().hex[:8]
    s1 = Skill(name=f"Test Skill 1 {u_id}", slug=f"test-s1-{u_id}", category=SkillCategory.PROGRAMMING_LANGUAGE)
    s2 = Skill(name=f"Test Skill 2 {u_id}", slug=f"test-s2-{u_id}", category=SkillCategory.FRAMEWORK_LIBRARY)
    db.add_all([s1, s2])
    db.commit()

    role = CareerRole(name=f"Test Role {u_id}", slug=f"test-role-{u_id}", description="Test Role")
    db.add(role)
    db.commit()

    link1 = CareerRoleSkill(career_role_id=role.id, skill_id=s1.id, required_proficiency=4, importance=SkillImportance.CORE)
    link2 = CareerRoleSkill(career_role_id=role.id, skill_id=s2.id, required_proficiency=2, importance=SkillImportance.IMPORTANT)
    db.add_all([link1, link2])
    db.commit()

    # Create User & Profile for Student A
    user_a = User(supabase_user_id=f"test_sub_a_{uuid.uuid4()}")
    db.add(user_a)
    db.commit()
    profile_a = Profile(user_id=user_a.id, full_name="Student A", onboarding_completed=True)
    db.add(profile_a)
    db.commit()

    # Test Student A with partial proficiency in Skill 1 (current=2, req=4) and 0 in Skill 2
    ss1 = StudentSkill(profile_id=profile_a.id, skill_id=s1.id, proficiency=2, source=SkillSource.RESUME, confidence=0.8)
    db.add(ss1)
    db.commit()

    service = SkillGapService(db)
    res_a = service.compute_skill_gap(profile_a.id, role.id)

    # Required prof total = 4 + 2 = 6
    # Earned prof total = min(2, 4) + min(0, 2) = 2
    # Readiness Score = (2 / 6) * 100 = 33%
    assert res_a["readiness_score"] == 33
    assert len(res_a["gaps"]) == 2
    assert len(res_a["mastered_skills"]) == 0

    # Verify Gap 1 (Skill 1): gap = 4 - 2 = 2; priority_score = 2 * 3 (CORE) = 6 -> medium
    gap1 = next(g for g in res_a["gaps"] if g["skill_id"] == s1.id)
    assert gap1["gap"] == 2
    assert gap1["priority_score"] == 6
    assert gap1["priority_bucket"] == "medium"

    # Verify Gap 2 (Skill 2): gap = 2 - 0 = 2; priority_score = 2 * 2 (IMPORTANT) = 4 -> medium
    gap2 = next(g for g in res_a["gaps"] if g["skill_id"] == s2.id)
    assert gap2["gap"] == 2
    assert gap2["priority_score"] == 4
    assert gap2["priority_bucket"] == "medium"

    # Create User & Profile for Student B
    user_b = User(supabase_user_id=f"test_sub_b_{uuid.uuid4()}")
    db.add(user_b)
    db.commit()
    profile_b = Profile(user_id=user_b.id, full_name="Student B", onboarding_completed=True)
    db.add(profile_b)
    db.commit()

    # Test Student B with Skill 1 mastered (current=4, req=4)
    ss_b1 = StudentSkill(profile_id=profile_b.id, skill_id=s1.id, proficiency=4, source=SkillSource.SELF_REPORTED, confidence=1.0)
    db.add(ss_b1)
    db.commit()

    res_b = service.compute_skill_gap(profile_b.id, role.id)

    # Required prof total = 6, Earned prof total = 4 + 0 = 4 => (4/6)*100 = 67%
    assert res_b["readiness_score"] == 67
    assert len(res_b["mastered_skills"]) == 1
    assert res_b["mastered_skills"][0]["skill_id"] == s1.id
    assert len(res_b["gaps"]) == 1
    assert res_b["gaps"][0]["skill_id"] == s2.id


