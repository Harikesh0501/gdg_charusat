import uuid
import asyncio
from app.services.roadmap import RoadmapService
from app.models.roadmap import RoadmapStatus, RoadmapItemStatus, RoadmapItemType
from app.models.career import CareerRole, CareerRoleSkill, SkillImportance, CareerGoal
from app.models.skill import Skill, SkillCategory, SkillPrerequisite
from app.models.user import User
from app.models.profile import Profile


def test_roadmap_topological_sorting_and_generation(db):
    u_id = uuid.uuid4().hex[:8]

    # Create Skills: Python (Prereq), Django (Target 1), React (Target 2)
    s_py = Skill(name=f"Python {u_id}", slug=f"python-{u_id}", category=SkillCategory.PROGRAMMING_LANGUAGE)
    s_dj = Skill(name=f"Django {u_id}", slug=f"django-{u_id}", category=SkillCategory.FRAMEWORK_LIBRARY)
    s_re = Skill(name=f"React {u_id}", slug=f"react-{u_id}", category=SkillCategory.FRAMEWORK_LIBRARY)
    db.add_all([s_py, s_dj, s_re])
    db.commit()

    # Set Prerequisite: Python is prerequisite for Django
    prereq = SkillPrerequisite(skill_id=s_dj.id, prerequisite_skill_id=s_py.id)
    db.add(prereq)
    db.commit()

    # Create Career Role
    role = CareerRole(name=f"Backend Engineer {u_id}", slug=f"backend-eng-{u_id}", description="Test Role")
    db.add(role)
    db.commit()

    link1 = CareerRoleSkill(career_role_id=role.id, skill_id=s_py.id, required_proficiency=3, importance=SkillImportance.CORE)
    link2 = CareerRoleSkill(career_role_id=role.id, skill_id=s_dj.id, required_proficiency=3, importance=SkillImportance.CORE)
    link3 = CareerRoleSkill(career_role_id=role.id, skill_id=s_re.id, required_proficiency=2, importance=SkillImportance.IMPORTANT)
    db.add_all([link1, link2, link3])
    db.commit()

    # Create Student Profile with zero skills (all 3 are gaps)
    user = User(supabase_user_id=f"test_sub_rm_{uuid.uuid4()}")
    db.add(user)
    db.commit()
    profile = Profile(user_id=user.id, full_name="Roadmap Student", onboarding_completed=True)
    db.add(profile)
    db.commit()

    # Set Career Goal
    goal = CareerGoal(profile_id=profile.id, career_role_id=role.id, target_timeline_months=6)
    db.add(goal)
    db.commit()

    # Test Roadmap Generation
    service = RoadmapService(db)
    roadmap = asyncio.run(service.generate_roadmap(profile.id, role.id))

    assert roadmap is not None
    assert str(roadmap.profile_id) == str(profile.id)
    assert int(roadmap.career_role_id) == int(role.id)
    assert roadmap.status == RoadmapStatus.ACTIVE
    assert len(roadmap.phases) >= 1

    # Verify Topological Order: Python must come before Django in roadmap items
    skill_items = []
    for phase in roadmap.phases:
        for item in phase.items:
            if item.type == RoadmapItemType.SKILL and item.ref_skill_id:
                skill_items.append(int(item.ref_skill_id))

    py_idx = skill_items.index(int(s_py.id))
    dj_idx = skill_items.index(int(s_dj.id))

    # Python (Prerequisite) must come BEFORE Django (Target)
    assert py_idx < dj_idx

    # Test Updating Item Status
    first_item = roadmap.phases[0].items[0]
    updated_item = service.update_item_status(str(first_item.id), RoadmapItemStatus.COMPLETED)
    assert updated_item.status == RoadmapItemStatus.COMPLETED
