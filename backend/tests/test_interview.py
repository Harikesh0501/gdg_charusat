import uuid
import asyncio
from app.services.interview import InterviewService
from app.models.skill import Skill
from app.models.career import CareerRole, CareerRoleSkill, SkillImportance, CareerGoal
from app.models.interview import InterviewQuestion, QuestionCategory, QuestionSource
from app.models.user import User
from app.models.profile import Profile


def test_interview_questions_retrieval_and_evaluation(db):
    u_id = uuid.uuid4().hex[:8]

    # Fetch existing skill and role
    skill = db.query(Skill).first()
    role = db.query(CareerRole).first()

    assert skill is not None
    assert role is not None

    # Create Seed Question associated with role
    q_seed = InterviewQuestion(
        id=str(uuid.uuid4()),
        career_role_id=role.id,
        skill_id=skill.id,
        category=QuestionCategory.TECHNICAL,
        difficulty=3,
        question_text=f"Explain core concepts of {skill.name} {u_id}.",
        ideal_answer_points=[
            "Syntax and core framework usage",
            "Performance and architecture best practices",
            "Error handling and resource cleanup"
        ],
        source=QuestionSource.SEED
    )
    db.add(q_seed)
    db.commit()

    # Create User & Profile
    user = User(supabase_user_id=f"test_sub_int_{uuid.uuid4()}")
    db.add(user)
    db.commit()
    profile = Profile(user_id=user.id, full_name="Interview Student")
    db.add(profile)
    db.commit()

    goal = CareerGoal(profile_id=profile.id, career_role_id=role.id, target_timeline_months=6)
    db.add(goal)
    db.commit()

    # Test Service
    service = InterviewService(db)

    # 1. Test Question Retrieval
    q_data = asyncio.run(service.get_practice_questions(profile.id))
    assert q_data["career_role_id"] == role.id
    assert len(q_data["questions"]) >= 1
    found_q = next((q for q in q_data["questions"] if q["id"] == str(q_seed.id)), q_data["questions"][0])
    assert found_q is not None

    # 2. Test Answer Submission & AI Evaluation
    sample_answer = "The framework provides declarative syntax, high performance execution, and robust error handling with automatic resource cleanup."
    eval_res = asyncio.run(service.evaluate_answer(profile.id, found_q["id"], sample_answer))

    assert eval_res["question_id"] == found_q["id"]
    assert eval_res["score"] > 0
    assert len(eval_res["strengths"]) >= 1
    assert len(eval_res["feedback"]) > 5

    # 3. Test Attempt History Calculation
    history_res = service.get_attempt_history(profile.id)
    assert history_res["total_attempts"] == 1
    assert history_res["average_score"] == eval_res["score"]
    assert len(history_res["history"]) == 1
