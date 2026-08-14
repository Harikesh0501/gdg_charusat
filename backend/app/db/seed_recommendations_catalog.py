import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.core.db import SessionLocal
from app.models.skill import Skill
from app.models.recommendation import Resource, Project, Certification, ResourceType, CertLevel

def seed_catalog():
    db = SessionLocal()
    try:
        # Load existing skills map by lowercase name
        skills = db.query(Skill).all()
        skill_map = {}
        for s in skills:
            clean_name = s.name.split()[0].lower() if s.name else ""
            skill_map[s.name.lower()] = s
            if clean_name and clean_name not in skill_map:
                skill_map[clean_name] = s

        print(f"Loaded {len(skills)} skills into memory.")

        def get_skill_objs(names):
            objs = []
            for n in names:
                n_lower = n.lower()
                if n_lower in skill_map:
                    objs.append(skill_map[n_lower])
                else:
                    # fuzzy lookup
                    match = next((s for s in skills if n.lower() in s.name.lower()), None)
                    if match:
                        objs.append(match)
            return objs

        # --- SEED RESOURCES (COURSES, DOCS, VIDEOS) ---
        resources_data = [
            {
                "title": "Machine Learning Specialization by Andrew Ng",
                "url": "https://www.coursera.org/specializations/machine-learning-introduction",
                "provider": "DeepLearning.AI / Coursera",
                "type": ResourceType.COURSE,
                "description": "Master fundamental machine learning concepts, supervised and unsupervised learning, and neural networks in Python.",
                "difficulty": 3,
                "estimated_hours": 60,
                "skills": ["Machine Learning", "Python", "Data Analysis", "Artificial Intelligence"]
            },
            {
                "title": "Deep Learning Specialization",
                "url": "https://www.coursera.org/specializations/deep-learning",
                "provider": "DeepLearning.AI",
                "type": ResourceType.COURSE,
                "description": "Build and train Deep Neural Networks, CNNs, RNNs, Transformers, and NLP models using PyTorch & TensorFlow.",
                "difficulty": 4,
                "estimated_hours": 80,
                "skills": ["Machine Learning", "Python", "Artificial Intelligence", "Nlp"]
            },
            {
                "title": "Python for Data Science and Machine Learning Bootcamp",
                "url": "https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/",
                "provider": "Udemy",
                "type": ResourceType.COURSE,
                "description": "Comprehensive guide to NumPy, Pandas, Matplotlib, Seaborn, Scikit-Learn, and Machine Learning algorithms.",
                "difficulty": 2,
                "estimated_hours": 25,
                "skills": ["Python", "Data Analysis", "Machine Learning"]
            },
            {
                "title": "FastAPI Official Documentation & Tutorial",
                "url": "https://fastapi.tiangolo.com/tutorial/",
                "provider": "FastAPI Docs",
                "type": ResourceType.DOC,
                "description": "Learn fast asynchronous REST API design, Pydantic validation, dependency injection, and OAuth2 security.",
                "difficulty": 2,
                "estimated_hours": 12,
                "skills": ["Python", "Rest Api Design", "Stateless Services"]
            },
            {
                "title": "Full Stack Open - Modern Web Development",
                "url": "https://fullstackopen.com/en/",
                "provider": "University of Helsinki",
                "type": ResourceType.COURSE,
                "description": "Deep dive into modern JavaScript, React, Node.js, Express, REST APIs, GraphQL, and Docker.",
                "difficulty": 3,
                "estimated_hours": 70,
                "skills": ["Full Stack Development", "Responsive Ui Design", "Rest Api Design"]
            },
            {
                "title": "Data Structures & Algorithms in Python",
                "url": "https://leetcode.com/explore/",
                "provider": "LeetCode / GeeksforGeeks",
                "type": ResourceType.ARTICLE,
                "description": "Master core computational algorithms, time/space complexity analysis, graph algorithms, and dynamic programming.",
                "difficulty": 3,
                "estimated_hours": 45,
                "skills": ["Data Structures And Algorithms", "Graph Theory", "Python"]
            },
            {
                "title": "LangChain & LLM Application Development",
                "url": "https://www.deeplearning.ai/short-courses/langchain-for-llm-application-development/",
                "provider": "DeepLearning.AI",
                "type": ResourceType.VIDEO,
                "description": "Build LLM-powered applications, RAG pipelines, vector store embeddings, and autonomous agents.",
                "difficulty": 3,
                "estimated_hours": 15,
                "skills": ["Llm Integration", "Contextual Ai Response Systems", "Llm", "Nlp", "Vector"]
            },
            {
                "title": "Streamlit Interactive Web Apps for Data Science",
                "url": "https://docs.streamlit.io/get-started",
                "provider": "Streamlit Docs",
                "type": ResourceType.DOC,
                "description": "Turn data scripts into shareable web applications in minutes using Streamlit and Python.",
                "difficulty": 1,
                "estimated_hours": 8,
                "skills": ["Streamlit", "Python", "Data Analysis"]
            }
        ]

        for r_item in resources_data:
            try:
                skill_objs = get_skill_objs(r_item["skills"])
                existing = db.query(Resource).filter(Resource.title == r_item["title"]).first()
                if not existing:
                    res = Resource(
                        title=r_item["title"],
                        url=r_item["url"],
                        provider=r_item["provider"],
                        type=r_item["type"],
                        description=r_item["description"],
                        difficulty=r_item["difficulty"],
                        estimated_hours=r_item["estimated_hours"]
                    )
                    if skill_objs:
                        res.skills.extend(skill_objs)
                    db.add(res)
                    db.commit()
            except Exception as e:
                db.rollback()
                print(f"Error seeding resource {r_item['title']}: {e}")

        # --- SEED HANDS-ON PROJECTS ---
        projects_data = [
            {
                "title": "Production Async FastAPI REST API & Database",
                "url": "https://github.com/tiangolo/full-stack-fastapi-template",
                "description": "Create a secure RESTful API microservice with FastAPI, SQLAlchemy 2.0 ORM, Alembic migrations, PostgreSQL, and Pytest coverage.",
                "difficulty": 3,
                "estimated_hours": 25,
                "career_relevance": "Backend Engineer",
                "skills": ["Rest Api Design", "Python", "Stateless Services"]
            },
            {
                "title": "End-to-End Predictive Machine Learning Pipeline",
                "url": "https://github.com/scikit-learn/scikit-learn",
                "description": "Build a production ML pipeline using Python, Scikit-Learn, Streamlit dashboard, and automated evaluation metrics.",
                "difficulty": 3,
                "estimated_hours": 20,
                "career_relevance": "Data Scientist / ML Engineer",
                "skills": ["Machine Learning", "Python", "Data Analysis", "Streamlit"]
            },
            {
                "title": "Pandas Automated Data Cleaning & Exploratory Data Analysis Pipeline",
                "url": "https://github.com/pandas-dev/pandas",
                "description": "Build a scalable data processing pipeline for multi-source CSV/JSON ingestion, outlier detection, and statistical profiling.",
                "difficulty": 2,
                "estimated_hours": 15,
                "career_relevance": "Data Scientist / ML Engineer",
                "skills": ["Pandas", "Python", "Data Analysis"]
            },
            {
                "title": "RAG-Powered AI Knowledge Assistant",
                "url": "https://github.com/langchain-ai/langchain",
                "description": "Develop a retrieval-augmented generation app using Vector DB embeddings, LLM Integration, and Contextual AI response system.",
                "difficulty": 4,
                "estimated_hours": 30,
                "career_relevance": "Data Scientist / ML Engineer",
                "skills": ["Llm Integration", "Contextual Ai Response Systems", "Llm", "Vector", "Nlp"]
            },
            {
                "title": "High-Performance RESTful Microservice with FastAPI",
                "url": "https://github.com/fastapi/fastapi",
                "description": "Design stateless backend microservices featuring OAuth2 auth, Pydantic validation, and multi-tenant DB architecture.",
                "difficulty": 3,
                "estimated_hours": 25,
                "career_relevance": "Backend Engineer",
                "skills": ["Rest Api Design", "Multi-Tenant Architecture", "Stateless Services", "Python"]
            },
            {
                "title": "Responsive Full-Stack E-Commerce Platform",
                "url": "https://github.com/vercel/next.js",
                "description": "Construct a full-stack platform using React, REST APIs, responsive glassmorphism UI, and real-time state management.",
                "difficulty": 3,
                "estimated_hours": 35,
                "career_relevance": "Full-Stack Developer",
                "skills": ["Full Stack Development", "Responsive Ui Design", "Rest Api Design"]
            },
            {
                "title": "Algorithm Visualizer & Graph Solver",
                "url": "https://github.com/trekhleb/javascript-algorithms",
                "description": "Create an interactive visualizer for BFS, DFS, Dijkstra's algorithm, and complex data structures.",
                "difficulty": 2,
                "estimated_hours": 15,
                "career_relevance": "Software Engineer",
                "skills": ["Data Structures And Algorithms", "Graph Theory"]
            }
        ]

        # --- SEED CERTIFICATIONS ---
        certs_data = [
            {
                "title": "AWS Certified Machine Learning - Specialty",
                "provider": "Amazon Web Services",
                "url": "https://aws.amazon.com/certification/certified-machine-learning-specialty/",
                "level": CertLevel.PROFESSIONAL,
                "skills": ["Machine Learning", "Artificial Intelligence", "Python", "Data Analysis"]
            },
            {
                "title": "TensorFlow Developer Certificate",
                "provider": "Google",
                "url": "https://www.tensorflow.org/certificate",
                "level": CertLevel.ASSOCIATE,
                "skills": ["Machine Learning", "Python", "Artificial Intelligence", "Nlp"]
            },
            {
                "title": "Microsoft Certified: Azure Data Scientist Associate",
                "provider": "Microsoft",
                "url": "https://learn.microsoft.com/en-us/credentials/certifications/azure-data-scientist/",
                "level": CertLevel.ASSOCIATE,
                "skills": ["Data Analysis", "Machine Learning", "Python"]
            },
            {
                "title": "Meta Front-End Developer Professional Certificate",
                "provider": "Meta / Coursera",
                "url": "https://www.coursera.org/professional-certificates/meta-front-end-developer",
                "level": CertLevel.ENTRY,
                "skills": ["Responsive Ui Design", "Full Stack Development"]
            }
        ]

        for p_item in projects_data:
            try:
                skill_objs = get_skill_objs(p_item["skills"])
                existing = db.query(Project).filter(Project.title == p_item["title"]).first()
                if existing:
                    existing.url = p_item["url"]
                    existing.description = p_item["description"]
                else:
                    proj = Project(
                        title=p_item["title"],
                        url=p_item["url"],
                        description=p_item["description"],
                        difficulty=p_item["difficulty"],
                        estimated_hours=p_item["estimated_hours"],
                        career_relevance=p_item["career_relevance"]
                    )
                    if skill_objs:
                        proj.skills.extend(skill_objs)
                    db.add(proj)
                db.commit()
            except Exception as e:
                db.rollback()
                print(f"Error seeding project {p_item['title']}: {e}")

        for c_item in certs_data:
            try:
                skill_objs = get_skill_objs(c_item["skills"])
                existing = db.query(Certification).filter(Certification.title == c_item["title"]).first()
                if not existing:
                    cert = Certification(
                        title=c_item["title"],
                        provider=c_item["provider"],
                        url=c_item["url"],
                        level=c_item["level"]
                    )
                    if skill_objs:
                        cert.skills.extend(skill_objs)
                    db.add(cert)
                    db.commit()
            except Exception as e:
                db.rollback()
                print(f"Error seeding cert {c_item['title']}: {e}")

        print("Catalog seeding complete!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding catalog: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_catalog()
