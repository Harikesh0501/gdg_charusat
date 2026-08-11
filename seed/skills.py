import os
import sys

sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from sqlalchemy.orm import Session
from app.core.db import engine, Base, SessionLocal
from app.models.skill import Skill, SkillCategory

SEEDED_SKILLS = [
    # Programming Languages
    {"name": "Python", "slug": "python", "category": SkillCategory.PROGRAMMING_LANGUAGE, "aliases": ["python3", "py"], "difficulty": 2, "description": "High-level programming language popular in backend, data science, and AI."},
    {"name": "JavaScript", "slug": "javascript", "category": SkillCategory.PROGRAMMING_LANGUAGE, "aliases": ["js", "es6", "ecmascript"], "difficulty": 2, "description": "Core web scripting language."},
    {"name": "TypeScript", "slug": "typescript", "category": SkillCategory.PROGRAMMING_LANGUAGE, "aliases": ["ts"], "difficulty": 3, "description": "Typed superset of JavaScript."},
    {"name": "Java", "slug": "java", "category": SkillCategory.PROGRAMMING_LANGUAGE, "aliases": ["jdk"], "difficulty": 3, "description": "Class-based object-oriented programming language."},
    {"name": "C++", "slug": "c-plus-plus", "category": SkillCategory.PROGRAMMING_LANGUAGE, "aliases": ["cpp", "cplusplus"], "difficulty": 4, "description": "High-performance systems programming language."},
    {"name": "Go", "slug": "go", "category": SkillCategory.PROGRAMMING_LANGUAGE, "aliases": ["golang"], "difficulty": 3, "description": "Statically typed compiled language designed at Google."},
    {"name": "Rust", "slug": "rust", "category": SkillCategory.PROGRAMMING_LANGUAGE, "aliases": ["rustlang"], "difficulty": 5, "description": "Systems programming language focused on safety and concurrency."},
    {"name": "SQL", "slug": "sql", "category": SkillCategory.PROGRAMMING_LANGUAGE, "aliases": ["structured-query-language"], "difficulty": 2, "description": "Standard language for relational database management."},
    {"name": "HTML5", "slug": "html5", "category": SkillCategory.PROGRAMMING_LANGUAGE, "aliases": ["html"], "difficulty": 1, "description": "Standard markup language for Web pages."},
    {"name": "CSS3", "slug": "css3", "category": SkillCategory.PROGRAMMING_LANGUAGE, "aliases": ["css"], "difficulty": 2, "description": "Style sheet language used for web presentation."},

    # Frameworks & Libraries
    {"name": "React", "slug": "react", "category": SkillCategory.FRAMEWORK_LIBRARY, "aliases": ["reactjs", "react.js"], "difficulty": 3, "description": "Front-end JavaScript library for building user interfaces."},
    {"name": "Next.js", "slug": "nextjs", "category": SkillCategory.FRAMEWORK_LIBRARY, "aliases": ["next.js", "next"], "difficulty": 3, "description": "React framework for full-stack web applications."},
    {"name": "Node.js", "slug": "nodejs", "category": SkillCategory.FRAMEWORK_LIBRARY, "aliases": ["node", "node.js"], "difficulty": 3, "description": "JavaScript runtime environment."},
    {"name": "FastAPI", "slug": "fastapi", "category": SkillCategory.FRAMEWORK_LIBRARY, "aliases": ["fast-api"], "difficulty": 2, "description": "Modern Python web framework for building APIs."},
    {"name": "Django", "slug": "django", "category": SkillCategory.FRAMEWORK_LIBRARY, "aliases": ["django-framework"], "difficulty": 3, "description": "High-level Python web framework."},
    {"name": "Express.js", "slug": "expressjs", "category": SkillCategory.FRAMEWORK_LIBRARY, "aliases": ["express"], "difficulty": 2, "description": "Web application framework for Node.js."},
    {"name": "Tailwind CSS", "slug": "tailwindcss", "category": SkillCategory.FRAMEWORK_LIBRARY, "aliases": ["tailwind"], "difficulty": 2, "description": "Utility-first CSS framework."},
    {"name": "Vue.js", "slug": "vuejs", "category": SkillCategory.FRAMEWORK_LIBRARY, "aliases": ["vue"], "difficulty": 3, "description": "Progressive JavaScript framework."},
    {"name": "Spring Boot", "slug": "spring-boot", "category": SkillCategory.FRAMEWORK_LIBRARY, "aliases": ["spring"], "difficulty": 4, "description": "Java-based framework for enterprise microservices."},
    {"name": "PyTorch", "slug": "pytorch", "category": SkillCategory.FRAMEWORK_LIBRARY, "aliases": ["torch"], "difficulty": 4, "description": "Open-source machine learning framework."},
    {"name": "TensorFlow", "slug": "tensorflow", "category": SkillCategory.FRAMEWORK_LIBRARY, "aliases": ["tf"], "difficulty": 4, "description": "End-to-end open source machine learning platform."},

    # Databases
    {"name": "PostgreSQL", "slug": "postgresql", "category": SkillCategory.DATABASE, "aliases": ["postgres", "psql"], "difficulty": 3, "description": "Advanced open source relational database."},
    {"name": "MongoDB", "slug": "mongodb", "category": SkillCategory.DATABASE, "aliases": ["mongo"], "difficulty": 2, "description": "Document-oriented NoSQL database."},
    {"name": "MySQL", "slug": "mysql", "category": SkillCategory.DATABASE, "aliases": ["my-sql"], "difficulty": 2, "description": "Popular relational database management system."},
    {"name": "Redis", "slug": "redis", "category": SkillCategory.DATABASE, "aliases": ["redis-cache"], "difficulty": 3, "description": "In-memory data structure store used as database and cache."},
    {"name": "Supabase", "slug": "supabase", "category": SkillCategory.DATABASE, "aliases": ["supabase-db"], "difficulty": 2, "description": "Open source Firebase alternative based on Postgres."},
    {"name": "Pinecone", "slug": "pinecone", "category": SkillCategory.DATABASE, "aliases": ["vector-db"], "difficulty": 3, "description": "Vector database for AI applications."},

    # Cloud & DevOps
    {"name": "Docker", "slug": "docker", "category": SkillCategory.CLOUD_DEVOPS, "aliases": ["containerization", "containers"], "difficulty": 3, "description": "Platform for developing, shipping, and running applications in containers."},
    {"name": "Kubernetes", "slug": "kubernetes", "category": SkillCategory.CLOUD_DEVOPS, "aliases": ["k8s"], "difficulty": 4, "description": "Container orchestration system."},
    {"name": "AWS", "slug": "aws", "category": SkillCategory.CLOUD_DEVOPS, "aliases": ["amazon-web-services", "ec2", "s3"], "difficulty": 3, "description": "Comprehensive cloud computing platform by Amazon."},
    {"name": "GitHub Actions", "slug": "github-actions", "category": SkillCategory.CLOUD_DEVOPS, "aliases": ["cicd", "ci-cd"], "difficulty": 3, "description": "CI/CD automation tool integrated with GitHub."},
    {"name": "Vercel", "slug": "vercel", "category": SkillCategory.CLOUD_DEVOPS, "aliases": ["vercel-deploy"], "difficulty": 2, "description": "Frontend deployment cloud platform."},

    # Data & ML
    {"name": "Pandas", "slug": "pandas", "category": SkillCategory.DATA_ML, "aliases": ["python-pandas"], "difficulty": 2, "description": "Data analysis and manipulation library for Python."},
    {"name": "NumPy", "slug": "numpy", "category": SkillCategory.DATA_ML, "aliases": ["numerical-python"], "difficulty": 2, "description": "Fundamental package for scientific computing in Python."},
    {"name": "Scikit-Learn", "slug": "scikit-learn", "category": SkillCategory.DATA_ML, "aliases": ["sklearn"], "difficulty": 3, "description": "Machine learning library for Python."},
    {"name": "LangChain", "slug": "langchain", "category": SkillCategory.DATA_ML, "aliases": ["llm-framework"], "difficulty": 3, "description": "Framework for developing applications powered by LLMs."},
    {"name": "RAG", "slug": "rag", "category": SkillCategory.DATA_ML, "aliases": ["retrieval-augmented-generation"], "difficulty": 4, "description": "Retrieval-Augmented Generation pattern for LLM context injection."},

    # Tools & Concepts
    {"name": "Git", "slug": "git", "category": SkillCategory.TOOL, "aliases": ["github", "version-control"], "difficulty": 2, "description": "Distributed version control system."},
    {"name": "REST APIs", "slug": "rest-api", "category": SkillCategory.CONCEPT, "aliases": ["restful", "rest-endpoint"], "difficulty": 2, "description": "Representational State Transfer web API design."},
    {"name": "GraphQL", "slug": "graphql", "category": SkillCategory.CONCEPT, "aliases": ["gql"], "difficulty": 3, "description": "Query language for APIs."},
    {"name": "System Design", "slug": "system-design", "category": SkillCategory.CONCEPT, "aliases": ["architecture-design"], "difficulty": 4, "description": "Process of defining architecture, components, and interfaces."},
]


def seed_skills():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        count = 0
        for item in SEEDED_SKILLS:
            existing = db.query(Skill).filter(Skill.slug == item["slug"]).first()
            if not existing:
                skill = Skill(
                    name=item["name"],
                    slug=item["slug"],
                    category=item["category"],
                    aliases=item.get("aliases", []),
                    difficulty=item.get("difficulty", 1),
                    description=item.get("description", ""),
                )
                db.add(skill)
                count += 1
        db.commit()
        print(f"Successfully seeded {count} skills into taxonomy.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_skills()
