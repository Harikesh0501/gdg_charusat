import os
import sys

sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from sqlalchemy.orm import Session
from app.core.db import engine, Base, SessionLocal
from app.models.skill import Skill
from app.models.career import CareerRole, CareerRoleSkill, SkillImportance

SEEDED_ROLES = [
    {
        "name": "Frontend Engineer",
        "slug": "frontend-engineer",
        "description": "Specializes in building responsive, accessible, and high-performance web user interfaces using modern JavaScript/TypeScript frameworks.",
        "skills": [
            {"slug": "html5", "required_proficiency": 3, "importance": SkillImportance.CORE},
            {"slug": "css3", "required_proficiency": 3, "importance": SkillImportance.CORE},
            {"slug": "javascript", "required_proficiency": 3, "importance": SkillImportance.CORE},
            {"slug": "typescript", "required_proficiency": 3, "importance": SkillImportance.CORE},
            {"slug": "react", "required_proficiency": 3, "importance": SkillImportance.CORE},
            {"slug": "nextjs", "required_proficiency": 3, "importance": SkillImportance.IMPORTANT},
            {"slug": "tailwindcss", "required_proficiency": 2, "importance": SkillImportance.IMPORTANT},
            {"slug": "git", "required_proficiency": 2, "importance": SkillImportance.CORE},
            {"slug": "rest-api", "required_proficiency": 2, "importance": SkillImportance.CORE},
            {"slug": "vercel", "required_proficiency": 2, "importance": SkillImportance.NICE_TO_HAVE},
        ],
    },
    {
        "name": "Backend Engineer",
        "slug": "backend-engineer",
        "description": "Focuses on server-side architecture, scalable APIs, relational databases, caching systems, and security.",
        "skills": [
            {"slug": "python", "required_proficiency": 3, "importance": SkillImportance.CORE},
            {"slug": "fastapi", "required_proficiency": 3, "importance": SkillImportance.CORE},
            {"slug": "sql", "required_proficiency": 3, "importance": SkillImportance.CORE},
            {"slug": "postgresql", "required_proficiency": 3, "importance": SkillImportance.CORE},
            {"slug": "rest-api", "required_proficiency": 3, "importance": SkillImportance.CORE},
            {"slug": "redis", "required_proficiency": 2, "importance": SkillImportance.IMPORTANT},
            {"slug": "docker", "required_proficiency": 2, "importance": SkillImportance.IMPORTANT},
            {"slug": "system-design", "required_proficiency": 3, "importance": SkillImportance.IMPORTANT},
            {"slug": "git", "required_proficiency": 2, "importance": SkillImportance.CORE},
            {"slug": "github-actions", "required_proficiency": 2, "importance": SkillImportance.NICE_TO_HAVE},
        ],
    },
    {
        "name": "Full-Stack Web Developer",
        "slug": "fullstack-developer",
        "description": "Versatile developer capable of designing and delivering complete end-to-end web applications across client and server stacks.",
        "skills": [
            {"slug": "javascript", "required_proficiency": 3, "importance": SkillImportance.CORE},
            {"slug": "typescript", "required_proficiency": 3, "importance": SkillImportance.CORE},
            {"slug": "react", "required_proficiency": 3, "importance": SkillImportance.CORE},
            {"slug": "nextjs", "required_proficiency": 3, "importance": SkillImportance.CORE},
            {"slug": "python", "required_proficiency": 3, "importance": SkillImportance.CORE},
            {"slug": "fastapi", "required_proficiency": 2, "importance": SkillImportance.IMPORTANT},
            {"slug": "postgresql", "required_proficiency": 3, "importance": SkillImportance.CORE},
            {"slug": "sql", "required_proficiency": 3, "importance": SkillImportance.CORE},
            {"slug": "docker", "required_proficiency": 2, "importance": SkillImportance.IMPORTANT},
            {"slug": "git", "required_proficiency": 2, "importance": SkillImportance.CORE},
        ],
    },
    {
        "name": "Data Scientist / ML Engineer",
        "slug": "data-scientist-ml",
        "description": "Builds statistical models, machine learning algorithms, data pipelines, and predictive analytics systems.",
        "skills": [
            {"slug": "python", "required_proficiency": 4, "importance": SkillImportance.CORE},
            {"slug": "sql", "required_proficiency": 3, "importance": SkillImportance.CORE},
            {"slug": "pandas", "required_proficiency": 3, "importance": SkillImportance.CORE},
            {"slug": "numpy", "required_proficiency": 3, "importance": SkillImportance.CORE},
            {"slug": "scikit-learn", "required_proficiency": 3, "importance": SkillImportance.CORE},
            {"slug": "pytorch", "required_proficiency": 3, "importance": SkillImportance.IMPORTANT},
            {"slug": "postgresql", "required_proficiency": 2, "importance": SkillImportance.IMPORTANT},
            {"slug": "git", "required_proficiency": 2, "importance": SkillImportance.CORE},
            {"slug": "docker", "required_proficiency": 2, "importance": SkillImportance.NICE_TO_HAVE},
        ],
    },
    {
        "name": "Cloud & DevOps Engineer",
        "slug": "cloud-devops-engineer",
        "description": "Automates cloud infrastructure deployment, CI/CD pipelines, container orchestration, and system reliability.",
        "skills": [
            {"slug": "docker", "required_proficiency": 3, "importance": SkillImportance.CORE},
            {"slug": "kubernetes", "required_proficiency": 3, "importance": SkillImportance.CORE},
            {"slug": "aws", "required_proficiency": 3, "importance": SkillImportance.CORE},
            {"slug": "github-actions", "required_proficiency": 3, "importance": SkillImportance.CORE},
            {"slug": "python", "required_proficiency": 2, "importance": SkillImportance.IMPORTANT},
            {"slug": "git", "required_proficiency": 3, "importance": SkillImportance.CORE},
            {"slug": "system-design", "required_proficiency": 3, "importance": SkillImportance.IMPORTANT},
            {"slug": "postgresql", "required_proficiency": 2, "importance": SkillImportance.NICE_TO_HAVE},
        ],
    },
    {
        "name": "AI System Architect",
        "slug": "ai-system-architect",
        "description": "Engineers modern LLM applications, RAG pipelines, vector search databases, agentic workflows, and scalable AI microservices.",
        "skills": [
            {"slug": "python", "required_proficiency": 4, "importance": SkillImportance.CORE},
            {"slug": "langchain", "required_proficiency": 3, "importance": SkillImportance.CORE},
            {"slug": "rag", "required_proficiency": 3, "importance": SkillImportance.CORE},
            {"slug": "pinecone", "required_proficiency": 3, "importance": SkillImportance.CORE},
            {"slug": "fastapi", "required_proficiency": 3, "importance": SkillImportance.CORE},
            {"slug": "system-design", "required_proficiency": 4, "importance": SkillImportance.CORE},
            {"slug": "docker", "required_proficiency": 3, "importance": SkillImportance.IMPORTANT},
            {"slug": "postgresql", "required_proficiency": 3, "importance": SkillImportance.IMPORTANT},
            {"slug": "git", "required_proficiency": 2, "importance": SkillImportance.CORE},
        ],
    },
]


def seed_career_roles():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        count = 0
        for role_data in SEEDED_ROLES:
            role = db.query(CareerRole).filter(CareerRole.slug == role_data["slug"]).first()
            if not role:
                role = CareerRole(
                    name=role_data["name"],
                    slug=role_data["slug"],
                    description=role_data["description"],
                )
                db.add(role)
                db.commit()
                db.refresh(role)
                count += 1

            # Seed role skills
            for req in role_data["skills"]:
                skill = db.query(Skill).filter(Skill.slug == req["slug"]).first()
                if skill:
                    existing_link = (
                        db.query(CareerRoleSkill)
                        .filter(
                            CareerRoleSkill.career_role_id == role.id,
                            CareerRoleSkill.skill_id == skill.id,
                        )
                        .first()
                    )
                    if not existing_link:
                        link = CareerRoleSkill(
                            career_role_id=role.id,
                            skill_id=skill.id,
                            required_proficiency=req["required_proficiency"],
                            importance=req["importance"],
                        )
                        db.add(link)
        db.commit()
        print(f"Successfully seeded {count} new career roles and skill mappings.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_career_roles()
