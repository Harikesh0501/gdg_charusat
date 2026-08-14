import uuid
import pytest
from app.services.progress import ProgressService
from app.services.roadmap import RoadmapService
from app.services.skill_gap import SkillGapService
from app.models.skill import Skill, SkillCategory
from app.models.career import CareerRole, CareerRoleSkill, SkillImportance, CareerGoal
from app.models.roadmap import RoadmapItemStatus, RoadmapItemType, Roadmap
from app.models.student_skill import StudentSkill
from app.models.user import User
from app.models.profile import Profile


def test_progress_analytics_and_feedback_loop(db):
    u_id = uuid.uuid4().hex[:8]

    # Fetch existing skill and role
    skill = db.query(Skill).first()
    role = db.query(CareerRole).first()

    assert skill is not None
    assert role is not None

    # Create User & Profile
    user = User(supabase_user_id=f"test_sub_prog_{uuid.uuid4()}")
    db.add(user)
    db.commit()
    profile = Profile(user_id=user.id, full_name="Progress Student")
    db.add(profile)
    db.commit()

    goal = CareerGoal(profile_id=profile.id, career_role_id=role.id, target_timeline_months=6)
    db.add(goal)
    db.commit()

    # Calculate initial readiness score
    gap_service = SkillGapService(db)
    initial_gap = gap_service.compute_skill_gap(profile.id, role.id)
    initial_readiness = initial_gap["readiness_score"]

    # Generate Roadmap
    roadmap_service = RoadmapService(db)
    import asyncio
    roadmap = asyncio.run(roadmap_service.generate_roadmap(profile.id, role.id))
    assert roadmap is not None
    assert len(roadmap.phases) > 0

    # Pick a skill item in Phase 1
    target_item = None
    for phase in roadmap.phases:
        for item in phase.items:
            if item.type == RoadmapItemType.SKILL:
                target_item = item
                break
        if target_item:
            break

    assert target_item is not None

    # Test Progress Service Feedback Loop
    progress_service = ProgressService(db)
    update_res = progress_service.handle_item_status_update(profile.id, target_item.id, RoadmapItemStatus.COMPLETED)

    assert update_res["item_id"] == str(target_item.id)
    assert update_res["status"] == "completed"

    # Verify proficiency was bumped in student_skills
    st_skill = db.query(StudentSkill).filter(
        StudentSkill.profile_id == profile.id,
        StudentSkill.skill_id == target_item.ref_skill_id
    ).first()
    assert st_skill is not None
    assert st_skill.proficiency >= 3

    # Verify Progress Analytics API
    analytics = progress_service.get_progress_analytics(profile.id)
    assert analytics["career_role_name"] == role.name
    assert analytics["completed_roadmap_items"] >= 1
    assert len(analytics["activity_timeline"]) >= 1
