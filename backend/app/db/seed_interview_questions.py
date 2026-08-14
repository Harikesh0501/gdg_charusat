import os
import sys
import uuid
import re

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.core.db import SessionLocal
from app.models.career import CareerRole
from app.models.skill import Skill
from app.models.interview import InterviewQuestion, QuestionCategory, QuestionSource


def seed_interview_questions():
    db = SessionLocal()
    try:
        # 1. Clean up test-polluted questions matching UUID hex patterns
        from app.models.interview import InterviewAttempt
        all_qs = db.query(InterviewQuestion).all()
        purged_count = 0
        for q in all_qs:
            if re.search(r'[0-9a-fA-F]{8}$', q.question_text) or "Explain core concepts of" in q.question_text:
                # Delete attempts associated with this test question
                db.query(InterviewAttempt).filter(InterviewAttempt.question_id == q.id).delete(synchronize_session=False)
                db.delete(q)
                purged_count += 1
        db.commit()
        print(f"Purged {purged_count} test-polluted questions from database.")

        # Load roles & skills
        roles = db.query(CareerRole).all()
        skills = db.query(Skill).all()

        role_map = {r.name.lower(): r for r in roles}
        skill_map = {s.name.lower(): s for s in skills}

        def get_role_id(role_name):
            r = next((role for role in roles if role_name.lower() in role.name.lower()), None)
            return r.id if r else (roles[0].id if roles else None)

        def get_skill_id(skill_name):
            s = next((sk for sk in skills if skill_name.lower() in sk.name.lower()), None)
            return s.id if s else None

        # 2. Rich Seed Questions Bank
        questions_bank = [
            # Data Scientist / ML Engineer
            {
                "target_role": "Data Scientist",
                "skill": "Machine Learning",
                "category": QuestionCategory.TECHNICAL,
                "difficulty": 4,
                "question_text": "Explain the architecture of a Retrieval-Augmented Generation (RAG) system. How do vector embeddings, chunking strategies, and HNSW indexing improve retrieval accuracy?",
                "ideal_answer_points": [
                    "Document chunking strategies and overlap parameters",
                    "Dense vector embeddings via models like Sentence-Transformers or OpenAI embeddings",
                    "Approximate Nearest Neighbor (ANN) vector search via HNSW or FAISS",
                    "Context augmentation in prompt to LLM to prevent hallucinations"
                ],
                "source_reference": "LangChain & Vector Database Docs",
                "reference_url": "https://python.langchain.com/docs/use_cases/question_answering/"
            },
            {
                "target_role": "Data Scientist",
                "skill": "Python",
                "category": QuestionCategory.TECHNICAL,
                "difficulty": 3,
                "question_text": "What is the Bias-Variance Tradeoff in Machine Learning? How do regularization techniques like L1 (Lasso) and L2 (Ridge) prevent overfitting?",
                "ideal_answer_points": [
                    "High bias leads to underfitting; high variance leads to overfitting",
                    "L1 regularization adds absolute value of coefficients (promotes sparsity / feature selection)",
                    "L2 regularization adds squared magnitude of coefficients (shrinks weights smoothly)",
                    "Cross-validation helps select optimal lambda hyperparameter"
                ],
                "source_reference": "Scikit-Learn Documentation",
                "reference_url": "https://scikit-learn.org/stable/modules/linear_model.html"
            },
            {
                "target_role": "Data Scientist",
                "skill": "Artificial Intelligence",
                "category": QuestionCategory.ROLE_SPECIFIC,
                "difficulty": 4,
                "question_text": "How does self-attention work in Transformer architectures? Compare multi-head attention with traditional Recurrent Neural Networks (RNNs).",
                "ideal_answer_points": [
                    "Query, Key, Value matrix projections and Softmax scaling",
                    "Multi-head attention allows model to focus on different subspace representations simultaneously",
                    "Parallel execution capability compared to sequential RNN processing",
                    "Positional encodings to preserve token sequence order"
                ],
                "source_reference": "Attention Is All You Need Paper & PyTorch Docs",
                "reference_url": "https://pytorch.org/docs/stable/generated/torch.nn.MultiheadAttention.html"
            },

            # Backend Engineer
            {
                "target_role": "Backend Engineer",
                "skill": "FastAPI",
                "category": QuestionCategory.TECHNICAL,
                "difficulty": 3,
                "question_text": "How does FastAPI handle asynchronous requests with Python's asyncio event loop? When should you declare an endpoint with 'async def' versus normal 'def'?",
                "ideal_answer_points": [
                    "FastAPI uses Starlette and runs async def endpoints directly on the asyncio event loop",
                    "Normal 'def' endpoints run in an external thread pool managed by AnyIO",
                    "Use 'async def' for non-blocking I/O (async DB drivers, HTTP calls)",
                    "Use 'def' for blocking CPU-bound tasks or synchronous database drivers"
                ],
                "source_reference": "FastAPI Official Async Documentation",
                "reference_url": "https://fastapi.tiangolo.com/async/"
            },
            {
                "target_role": "Backend Engineer",
                "skill": "PostgreSQL",
                "category": QuestionCategory.TECHNICAL,
                "difficulty": 3,
                "question_text": "Explain how PostgreSQL B-Tree indexes work. What is the difference between a B-Tree index scan and a Sequential Table Scan, and when does PostgreSQL choose one over the other?",
                "ideal_answer_points": [
                    "B-Tree keeps index keys in balanced hierarchical search tree",
                    "Index scan fetches pointer tuple IDs (TIDs) directly to heap blocks",
                    "Sequential scan reads full table when query returns large percentage of rows (high selectivity threshold)",
                    "EXPLAIN ANALYZE provides execution plan inspection"
                ],
                "source_reference": "PostgreSQL Official Documentation",
                "reference_url": "https://www.postgresql.org/docs/current/indexes-types.html"
            },
            {
                "target_role": "Backend Engineer",
                "skill": "Rest Api Design",
                "category": QuestionCategory.ROLE_SPECIFIC,
                "difficulty": 4,
                "question_text": "Design a Distributed Rate Limiter for an enterprise REST API gateway. Which algorithm would you choose (Token Bucket vs Leaky Bucket) and how would you implement it using Redis?",
                "ideal_answer_points": [
                    "Token Bucket allows burst capacity while enforcing average rate",
                    "Leaky Bucket enforces smooth constant egress processing rate",
                    "Redis INCR or Redis Lua script for atomic sliding window counter",
                    "Handling distributed clock drift and fallback on Redis node failover"
                ],
                "source_reference": "Redis System Design Patterns",
                "reference_url": "https://redis.io/docs/manual/patterns/ratelimiter/"
            },

            # Cloud & DevOps Engineer
            {
                "target_role": "Cloud & DevOps",
                "skill": "Docker",
                "category": QuestionCategory.TECHNICAL,
                "difficulty": 3,
                "question_text": "What is a Docker multi-stage build, and how does it optimize container image size and security for production deployments?",
                "ideal_answer_points": [
                    "Separate build environment stage from runtime minimal image stage (e.g. Alpine or Distroless)",
                    "Drastically reduces final image size (e.g. from 1GB builder to 50MB runtime)",
                    "Excludes build toolchains (compilers, npm/pip caches) from final image",
                    "Minimizes attack surface for security vulnerabilities"
                ],
                "source_reference": "Docker Official Documentation",
                "reference_url": "https://docs.docker.com/build/building/multi-stage/"
            },

            # Behavioral Questions
            {
                "target_role": "Software Engineer",
                "skill": "Full Stack Development",
                "category": QuestionCategory.BEHAVIORAL,
                "difficulty": 3,
                "question_text": "Describe a time you encountered a tight deadline or competing project priorities. How did you manage your time, prioritize tasks, and ensure high-quality delivery?",
                "ideal_answer_points": [
                    "Task prioritization framework (e.g. Eisenhower Matrix or MoSCoW)",
                    "Clear communication with team members and stakeholders on scope trade-offs",
                    "Breaking down complex deliverables into manageable milestones",
                    "Maintaining code quality, testing, and documentation despite time constraints"
                ],
                "source_reference": "Engineering Leadership & Agile Best Practices",
                "reference_url": "https://agilemanifesto.org/"
            }
        ]

        added_count = 0
        for item in questions_bank:
            r_id = get_role_id(item["target_role"])
            s_id = get_skill_id(item["skill"])

            q_obj = InterviewQuestion(
                id=str(uuid.uuid4()),
                career_role_id=r_id,
                skill_id=s_id,
                category=item["category"],
                difficulty=item["difficulty"],
                question_text=item["question_text"],
                ideal_answer_points=item["ideal_answer_points"],
                source_reference=item["source_reference"],
                reference_url=item["reference_url"],
                source=QuestionSource.SEED
            )
            db.add(q_obj)
            added_count += 1

        db.commit()
        print(f"Successfully seeded {added_count} high-quality interview questions into database.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding interview questions: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_interview_questions()
