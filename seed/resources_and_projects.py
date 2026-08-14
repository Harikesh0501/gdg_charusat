import os
import sys
from dotenv import load_dotenv

# Load backend environment variables
load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend/.env.local")))
load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend/.env")))

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))

from sqlalchemy.orm import Session
from app.core.db import SessionLocal
from app.models.skill import Skill
from app.models.recommendation import Resource, Project, Certification, ResourceType, CertLevel

# Seed Content Definition
RESOURCES_DATA = [
    # Frontend Skills
    {
        "title": "freeCodeCamp Responsive Web Design Certification",
        "url": "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
        "provider": "freeCodeCamp",
        "type": ResourceType.COURSE,
        "description": "Comprehensive hands-on course covering modern HTML5 semantic elements and CSS3 layout techniques.",
        "difficulty": 1,
        "estimated_hours": 20,
        "skill_slugs": ["html", "css"],
    },
    {
        "title": "Modern JavaScript Tutorial (javascript.info)",
        "url": "https://javascript.info/",
        "provider": "JavaScript.info",
        "type": ResourceType.DOC,
        "description": "From basics to advanced topics with simple yet detailed explanations, including ES6+ features and async programming.",
        "difficulty": 2,
        "estimated_hours": 15,
        "skill_slugs": ["javascript"],
    },
    {
        "title": "TypeScript Handbook (Official Docs)",
        "url": "https://www.typescriptlang.org/docs/handbook/intro.html",
        "provider": "TypeScript",
        "type": ResourceType.DOC,
        "description": "The official comprehensive guide to TypeScript types, interfaces, generics, and strict type checking.",
        "difficulty": 2,
        "estimated_hours": 10,
        "skill_slugs": ["typescript"],
    },
    {
        "title": "React Official Documentation & Interactive Guide",
        "url": "https://react.dev/learn",
        "provider": "Meta / React",
        "type": ResourceType.DOC,
        "description": "Learn React from scratch with interactive diagrams and modern hooks-based examples.",
        "difficulty": 2,
        "estimated_hours": 12,
        "skill_slugs": ["react"],
    },
    {
        "title": "Next.js App Router Masterclass",
        "url": "https://nextjs.org/learn",
        "provider": "Vercel",
        "type": ResourceType.COURSE,
        "description": "Build modern full-stack web applications with Next.js 14 App Router, Server Components, and Supabase.",
        "difficulty": 3,
        "estimated_hours": 16,
        "skill_slugs": ["nextjs", "react", "typescript"],
    },
    {
        "title": "Tailwind CSS Official Documentation",
        "url": "https://tailwindcss.com/docs/installation",
        "provider": "Tailwind Labs",
        "type": ResourceType.DOC,
        "description": "Utility-first CSS framework guide for rapid custom UI design and glassmorphism styling.",
        "difficulty": 1,
        "estimated_hours": 6,
        "skill_slugs": ["css", "tailwind-css"],
    },

    # Backend & Database Skills
    {
        "title": "Python for Everybody (University of Michigan)",
        "url": "https://www.py4e.com/",
        "provider": "Coursera / Py4E",
        "type": ResourceType.COURSE,
        "description": "Learn Python programming fundamental data structures, network programming, and databases.",
        "difficulty": 1,
        "estimated_hours": 18,
        "skill_slugs": ["python"],
    },
    {
        "title": "FastAPI Official Interactive Tutorial",
        "url": "https://fastapi.tiangolo.com/tutorial/",
        "provider": "FastAPI / Tiangolo",
        "type": ResourceType.DOC,
        "description": "High-performance Python web API development with OpenAPI, Pydantic V2 schemas, and async dependency injection.",
        "difficulty": 2,
        "estimated_hours": 10,
        "skill_slugs": ["fastapi", "python", "rest-api"],
    },
    {
        "title": "PostgreSQL Tutorial for Beginners & Developers",
        "url": "https://www.postgresqltutorial.com/",
        "provider": "PostgreSQL Tutorial",
        "type": ResourceType.DOC,
        "description": "Master SQL querying, table joins, indexes, ACID transactions, and relational database schema design.",
        "difficulty": 2,
        "estimated_hours": 12,
        "skill_slugs": ["postgresql", "sql", "database"],
    },
    {
        "title": "SQLAlchemy 2.0 Unified Tutorial",
        "url": "https://docs.sqlalchemy.org/en/20/tutorial/index.html",
        "provider": "SQLAlchemy",
        "type": ResourceType.DOC,
        "description": "Python ORM and Database Toolkit for constructing robust SQL expressions and migrations.",
        "difficulty": 3,
        "estimated_hours": 8,
        "skill_slugs": ["sqlalchemy", "python", "postgresql"],
    },
    {
        "title": "RESTful API Design Best Practices",
        "url": "https://restfulapi.net/",
        "provider": "RESTful API",
        "type": ResourceType.ARTICLE,
        "description": "Comprehensive guide on resource naming, HTTP verbs, status codes, and security headers.",
        "difficulty": 2,
        "estimated_hours": 5,
        "skill_slugs": ["rest-api"],
    },

    # DevOps & Infrastructure
    {
        "title": "Docker Curriculum - Containerization Essentials",
        "url": "https://docker-curriculum.com/",
        "provider": "Docker Curriculum",
        "type": ResourceType.COURSE,
        "description": "Hands-on introduction to Docker containers, Dockerfiles, multi-stage builds, and Docker Compose.",
        "difficulty": 2,
        "estimated_hours": 8,
        "skill_slugs": ["docker", "cloud_devops"],
    },
    {
        "title": "AWS Cloud Practitioner Essentials",
        "url": "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/",
        "provider": "AWS Skill Builder",
        "type": ResourceType.COURSE,
        "description": "Fundamental understanding of AWS Cloud architectural concepts, security, IAM, EC2, and S3.",
        "difficulty": 2,
        "estimated_hours": 12,
        "skill_slugs": ["aws", "cloud_devops"],
    },
    {
        "title": "Git & GitHub Crash Course",
        "url": "https://git-scm.com/book/en/v2",
        "provider": "Git Pro Book",
        "type": ResourceType.DOC,
        "description": "Master distributed version control, branching models, pull requests, and Git workflows.",
        "difficulty": 1,
        "estimated_hours": 6,
        "skill_slugs": ["git", "version-control"],
    },

    # Data Science & ML
    {
        "title": "Pandas Data Analysis User Guide",
        "url": "https://pandas.pydata.org/docs/user_guide/index.html",
        "provider": "Pandas",
        "type": ResourceType.DOC,
        "description": "Data manipulation, transformation, filtering, and aggregation using Python DataFrames.",
        "difficulty": 2,
        "estimated_hours": 10,
        "skill_slugs": ["pandas", "python", "data_ml"],
    },
    {
        "title": "Scikit-Learn Machine Learning in Python",
        "url": "https://scikit-learn.org/stable/tutorial/index.html",
        "provider": "Scikit-Learn",
        "type": ResourceType.DOC,
        "description": "Supervised and unsupervised learning algorithms, feature scaling, model evaluation, and cross-validation.",
        "difficulty": 3,
        "estimated_hours": 14,
        "skill_slugs": ["scikit-learn", "machine-learning", "python"],
    },
]

PROJECTS_DATA = [
    {
        "title": "Build a SaaS Analytics Command Center",
        "description": "Develop a real-time analytics dashboard with Next.js 14, Tailwind CSS, Recharts, and Supabase SSR authentication.",
        "difficulty": 3,
        "estimated_hours": 20,
        "career_relevance": "Frontend Engineer, Full-Stack Engineer",
        "skill_slugs": ["react", "nextjs", "typescript", "tailwind-css"],
    },
    {
        "title": "Production Async FastAPI REST API & Database",
        "description": "Create a secure RESTful API microservice with FastAPI, SQLAlchemy 2.0 ORM, Alembic migrations, PostgreSQL, and Pytest coverage.",
        "difficulty": 3,
        "estimated_hours": 25,
        "career_relevance": "Backend Engineer, Full-Stack Engineer",
        "skill_slugs": ["python", "fastapi", "postgresql", "sqlalchemy", "rest-api"],
    },
    {
        "title": "Containerized Multi-Service Deployment with Docker & AWS",
        "description": "Package a Python FastAPI backend and Next.js frontend into multi-stage Docker containers and deploy with Nginx reverse proxy.",
        "difficulty": 3,
        "estimated_hours": 18,
        "career_relevance": "DevOps Engineer, Cloud Engineer",
        "skill_slugs": ["docker", "aws", "git"],
    },
    {
        "title": "Predictive Machine Learning Pipeline & Model API",
        "description": "Train a regression and classification model on real-world datasets with Pandas and Scikit-Learn, and serve predictions via FastAPI.",
        "difficulty": 4,
        "estimated_hours": 22,
        "career_relevance": "Data Scientist / ML Engineer, Data Analyst",
        "skill_slugs": ["python", "pandas", "scikit-learn", "machine-learning", "fastapi"],
    },
    {
        "title": "Interactive SQL Data Warehousing & Dashboard",
        "description": "Design an analytical PostgreSQL database schema, write complex SQL aggregations and CTE queries, and present findings.",
        "difficulty": 2,
        "estimated_hours": 15,
        "career_relevance": "Data Analyst",
        "skill_slugs": ["sql", "postgresql", "database"],
    },
]

CERTIFICATIONS_DATA = [
    {
        "title": "AWS Certified Cloud Practitioner",
        "provider": "Amazon Web Services",
        "url": "https://aws.amazon.com/certification/certified-cloud-practitioner/",
        "level": CertLevel.ENTRY,
        "skill_slugs": ["aws", "cloud_devops"],
    },
    {
        "title": "Meta Front-End Developer Professional Certificate",
        "provider": "Meta / Coursera",
        "url": "https://www.coursera.org/professional-certificates/meta-front-end-developer",
        "level": CertLevel.ASSOCIATE,
        "skill_slugs": ["html", "css", "javascript", "react"],
    },
    {
        "title": "PostgreSQL Certified Associate",
        "provider": "PostgreSQL Professional",
        "url": "https://www.postgresql.org/about/",
        "level": CertLevel.ASSOCIATE,
        "skill_slugs": ["postgresql", "sql"],
    },
]


def seed_resources_and_projects():
    db: Session = SessionLocal()
    try:
        skills = db.query(Skill).all()
        skill_slug_map = {s.slug: s for s in skills}

        print(f"Found {len(skills)} seeded skills in database.")

        # 1. Seed Resources
        for r_data in RESOURCES_DATA:
            existing = db.query(Resource).filter(Resource.title == r_data["title"]).first()
            if not existing:
                resource = Resource(
                    title=r_data["title"],
                    url=r_data["url"],
                    provider=r_data["provider"],
                    type=r_data["type"],
                    description=r_data["description"],
                    difficulty=r_data["difficulty"],
                    estimated_hours=r_data["estimated_hours"],
                )

                # Attach skills
                for slug in r_data["skill_slugs"]:
                    if slug in skill_slug_map:
                        resource.skills.append(skill_slug_map[slug])

                db.add(resource)
        db.commit()
        print(f"Seeded {len(RESOURCES_DATA)} learning resources.")

        # 2. Seed Projects
        for p_data in PROJECTS_DATA:
            existing = db.query(Project).filter(Project.title == p_data["title"]).first()
            if not existing:
                project = Project(
                    title=p_data["title"],
                    description=p_data["description"],
                    difficulty=p_data["difficulty"],
                    estimated_hours=p_data["estimated_hours"],
                    career_relevance=p_data["career_relevance"],
                )

                for slug in p_data["skill_slugs"]:
                    if slug in skill_slug_map:
                        project.skills.append(skill_slug_map[slug])

                db.add(project)
        db.commit()
        print(f"Seeded {len(PROJECTS_DATA)} hands-on projects.")

        # 3. Seed Certifications
        for c_data in CERTIFICATIONS_DATA:
            existing = db.query(Certification).filter(Certification.title == c_data["title"]).first()
            if not existing:
                cert = Certification(
                    title=c_data["title"],
                    provider=c_data["provider"],
                    url=c_data["url"],
                    level=c_data["level"],
                )

                for slug in c_data["skill_slugs"]:
                    if slug in skill_slug_map:
                        cert.skills.append(skill_slug_map[slug])

                db.add(cert)
        db.commit()
        print(f"Seeded {len(CERTIFICATIONS_DATA)} industry certifications.")

    except Exception as e:
        db.rollback()
        print(f"Seeding error: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_resources_and_projects()
