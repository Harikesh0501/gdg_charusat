import os
import sys
import uuid
from dotenv import load_dotenv

# Load backend environment variables
load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend/.env.local")))
load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend/.env")))

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))

from sqlalchemy.orm import Session
from app.core.db import SessionLocal
from app.models.skill import Skill
from app.models.career import CareerRole
from app.models.interview import InterviewQuestion, QuestionCategory, QuestionSource

QUESTIONS_DATA = [
    # Behavioral Questions (Role-agnostic)
    {
        "category": QuestionCategory.BEHAVIORAL,
        "difficulty": 2,
        "question_text": "Describe a time you encountered a tight deadline or competing project priorities. How did you manage your time and ensure high-quality delivery?",
        "ideal_answer_points": [
            "Clear prioritization methodology (e.g. Eisenhower Matrix, core MVP features vs nice-to-haves)",
            "Proactive stakeholder or team communication regarding scope/timeline trade-offs",
            "Concrete outcome or lesson learned"
        ],
        "role_slug": None,
        "skill_slug": None,
    },
    {
        "category": QuestionCategory.BEHAVIORAL,
        "difficulty": 2,
        "question_text": "Tell me about a situation where you had a technical disagreement with a teammate. How did you resolve it?",
        "ideal_answer_points": [
            "Objective data/benchmark-driven discussion over personal preference",
            "Active listening and understanding the other team member's constraints",
            "Professional consensus or decision alignment focused on project success"
        ],
        "role_slug": None,
        "skill_slug": None,
    },

    # Frontend / Web Questions
    {
        "category": QuestionCategory.TECHNICAL,
        "difficulty": 3,
        "question_text": "Explain the difference between Client-Side Rendering (CSR) and Server-Side Rendering (SSR) in React/Next.js. When would you choose one over the other?",
        "ideal_answer_points": [
            "CSR renders DOM in the browser using JS bundle; SSR renders HTML on server per request",
            "SSR advantages: Faster initial page load (FCP), superior SEO for search engines",
            "CSR advantages: Rich interactive UI states, reduced server rendering load",
            "Next.js App Router context: Server Components by default, Client Components with 'use client'"
        ],
        "role_slug": "frontend-engineer",
        "skill_slug": "react",
    },
    {
        "category": QuestionCategory.TECHNICAL,
        "difficulty": 2,
        "question_text": "What are React Hooks? Explain how useEffect works and how to prevent infinite render loops.",
        "ideal_answer_points": [
            "Hooks allow functional components to manage state and side effects",
            "useEffect handles asynchronous side effects (fetching data, event listeners)",
            "Dependency array dictates re-triggering; passing empty array [] runs once on mount",
            "Infinite loops happen when updating state inside useEffect without correct dependency guards"
        ],
        "role_slug": "frontend-engineer",
        "skill_slug": "react",
    },
    {
        "category": QuestionCategory.ROLE_SPECIFIC,
        "difficulty": 3,
        "question_text": "How do you optimize Web Vitals (LCP, FID/INP, CLS) for a high-traffic frontend web application?",
        "ideal_answer_points": [
            "LCP: Image optimization (next/image), code-splitting, CDN caching",
            "INP/FID: Minimizing long blocking main-thread JavaScript tasks",
            "CLS: Reserving explicit dimensions for images/embeds to prevent layout shifts"
        ],
        "role_slug": "frontend-engineer",
        "skill_slug": "javascript",
    },

    # Backend / API / Database Questions
    {
        "category": QuestionCategory.TECHNICAL,
        "difficulty": 3,
        "question_text": "Explain the difference between SQL database indexing and full table scans. How do B-tree indexes speed up SELECT queries?",
        "ideal_answer_points": [
            "Full table scan inspects every row sequentially (O(N) time complexity)",
            "B-tree index structures keys hierarchically, enabling logarithmic lookup (O(log N))",
            "Trade-off: Indexing slows down INSERT/UPDATE writes due to tree re-balancing",
            "Covering indexes and composite index column ordering rules"
        ],
        "role_slug": "backend-engineer",
        "skill_slug": "postgresql",
    },
    {
        "category": QuestionCategory.TECHNICAL,
        "difficulty": 3,
        "question_text": "What is the difference between REST API and GraphQL? Compare their query flexibility and network bandwidth efficiency.",
        "ideal_answer_points": [
            "REST uses rigid HTTP endpoints returning fixed data structures; can suffer from over-fetching or under-fetching",
            "GraphQL uses a single endpoint where clients request exact query fields",
            "GraphQL eliminates over-fetching; REST is simpler to HTTP-cache and rate-limit"
        ],
        "role_slug": "backend-engineer",
        "skill_slug": "rest-api",
    },
    {
        "category": QuestionCategory.ROLE_SPECIFIC,
        "difficulty": 4,
        "question_text": "How do you handle database transaction concurrency and isolation levels (READ COMMITTED vs SERIALIZABLE) in PostgreSQL?",
        "ideal_answer_points": [
            "ACID properties (Atomicity, Consistency, Isolation, Durability)",
            "Dirty reads, non-repeatable reads, and phantom reads prevention",
            "READ COMMITTED prevents dirty reads; SERIALIZABLE enforces strict sequential execution",
            "Handling deadlock detection and optimistic locking mechanisms"
        ],
        "role_slug": "backend-engineer",
        "skill_slug": "postgresql",
    },

    # Full-Stack Questions
    {
        "category": QuestionCategory.TECHNICAL,
        "difficulty": 3,
        "question_text": "Explain JSON Web Token (JWT) authentication flow between a Next.js frontend and FastAPI backend. How do you securely store and verify tokens?",
        "ideal_answer_points": [
            "Client sends credentials to auth service; server returns signed JWT token",
            "Frontend attaches token in HTTP Authorization header: 'Bearer <token>'",
            "Backend verifies JWT signature with secret key/JWKS public key without database lookup",
            "Security best practices: Storing refresh tokens in httpOnly secure cookies, short access token expiry"
        ],
        "role_slug": "fullstack-engineer",
        "skill_slug": "fastapi",
    },

    # DevOps & Infrastructure Questions
    {
        "category": QuestionCategory.TECHNICAL,
        "difficulty": 3,
        "question_text": "What is a Docker multi-stage build, and why is it recommended for deploying production applications?",
        "ideal_answer_points": [
            "Allows using multiple FROM instructions in a single Dockerfile",
            "Build stage compiles source code/dependencies; final stage copies only compiled artifacts",
            "Drastically reduces final container image size (e.g. from 1GB to 50MB)",
            "Removes build tools, compilers, and source code from production image for security"
        ],
        "role_slug": "devops-engineer",
        "skill_slug": "docker",
    },

    # Data Science / ML Questions
    {
        "category": QuestionCategory.TECHNICAL,
        "difficulty": 3,
        "question_text": "Explain the difference between Overfitting and Underfitting in Machine Learning. How do you detect and mitigate them?",
        "ideal_answer_points": [
            "Overfitting: High training accuracy, low test/validation accuracy (memorizing noise, high variance)",
            "Underfitting: Low training and low test accuracy (model too simple, high bias)",
            "Mitigation for Overfitting: Regularization (L1/L2), cross-validation, dropout, simpler model",
            "Mitigation for Underfitting: Adding features, increasing model complexity, training longer"
        ],
        "role_slug": "data-scientist-ml-engineer",
        "skill_slug": "scikit-learn",
    },
]


def seed_interview_questions():
    db: Session = SessionLocal()
    try:
        roles = {r.slug: r for r in db.query(CareerRole).all()}
        skills = {s.slug: s for s in db.query(Skill).all()}

        print(f"Found {len(roles)} roles and {len(skills)} skills.")

        seeded_count = 0
        for q_data in QUESTIONS_DATA:
            role_obj = roles.get(q_data["role_slug"]) if q_data["role_slug"] else None
            skill_obj = skills.get(q_data["skill_slug"]) if q_data["skill_slug"] else None

            existing = (
                db.query(InterviewQuestion)
                .filter(InterviewQuestion.question_text == q_data["question_text"])
                .first()
            )

            if not existing:
                question = InterviewQuestion(
                    id=str(uuid.uuid4()),
                    career_role_id=role_obj.id if role_obj else None,
                    skill_id=skill_obj.id if skill_obj else None,
                    category=q_data["category"],
                    difficulty=q_data["difficulty"],
                    question_text=q_data["question_text"],
                    ideal_answer_points=q_data["ideal_answer_points"],
                    source=QuestionSource.SEED
                )
                db.add(question)
                seeded_count += 1

        db.commit()
        print(f"Seeded {seeded_count} mock interview questions.")

    except Exception as e:
        db.rollback()
        print(f"Seeding error: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_interview_questions()
