import urllib.parse
from typing import List, Dict, Any

class ProjectMilestoneEngine:
    """
    Context & Technology-Aware Milestone Generator Engine.
    Dynamically generates 4 distinct, domain-tailored implementation phases
    and dedicated documentation resources based on project titles, descriptions, and skill tags.
    """

    @classmethod
    def generate_milestones(cls, title: str, description: str, skills: List[str]) -> List[Dict[str, Any]]:
        title_lower = title.lower()
        desc_lower = (description or "").lower()
        skills_lower = [s.lower() for s in skills]

        primary_skill = skills[0] if skills else "Software Engineering"

        # 1. Machine Learning & Predictive Data Science Domain
        if any(k in title_lower or k in desc_lower or any(k in s for s in skills_lower) for k in ["machine learning", "predictive", "scikit", "model", "streamlit", "data science"]):
            return [
                {
                    "id": "m1",
                    "step": "Phase 1: Dataset Ingestion & Preprocessing Pipeline",
                    "task": f"Load dataset, handle missing values, perform feature encoding, and split data into train/test sets using {primary_skill}.",
                    "resource_title": "Pandas & Scikit-Learn Data Preprocessing Guide",
                    "resource_url": "https://scikit-learn.org/stable/modules/preprocessing.html",
                    "resource_provider": "Scikit-Learn Docs"
                },
                {
                    "id": "m2",
                    "step": "Phase 2: Model Architecture & Training Engine",
                    "task": "Train baseline classification/regression models, perform cross-validation, and evaluate metrics (Precision, Recall, RMSE).",
                    "resource_title": "Supervised Learning Model Training Specs",
                    "resource_url": "https://scikit-learn.org/stable/supervised_learning.html",
                    "resource_provider": "Scikit-Learn Docs"
                },
                {
                    "id": "m3",
                    "step": "Phase 3: Hyperparameter Tuning & Pipeline Optimization",
                    "task": "Optimize model parameters using GridSearchCV/RandomizedSearchCV and export trained pipeline binaries (.joblib/.pkl).",
                    "resource_title": "Model Evaluation & Hyperparameter Tuning Guide",
                    "resource_url": "https://scikit-learn.org/stable/modules/grid_search.html",
                    "resource_provider": "Scikit-Learn Docs"
                },
                {
                    "id": "m4",
                    "step": "Phase 4: Interactive Dashboard & Model Deployment",
                    "task": "Build an interactive Streamlit UI for real-time model inference and package into a reproducible environment.",
                    "resource_title": "Streamlit App Development & Deployment Specs",
                    "resource_url": "https://docs.streamlit.io/get-started",
                    "resource_provider": "Streamlit Docs"
                }
            ]

        # 2. Pandas & Exploratory Data Analysis Domain
        elif any(k in title_lower or k in desc_lower or any(k in s for s in skills_lower) for k in ["pandas", "eda", "exploratory", "cleaning", "csv"]):
            return [
                {
                    "id": "m1",
                    "step": "Phase 1: Multi-Source Data Ingestion & Validation",
                    "task": "Configure automated ingestion routines for CSV, JSON, and SQL sources into Pandas DataFrames with schema validation.",
                    "resource_title": "Pandas I/O Tools & Data Reading Specs",
                    "resource_url": "https://pandas.pydata.org/docs/user_guide/io.html",
                    "resource_provider": "Pandas Docs"
                },
                {
                    "id": "m2",
                    "step": "Phase 2: Data Sanitization & Outlier Detection",
                    "task": "Implement vectorized transformations, outlier detection using IQR/Z-score, and automated null imputation strategies.",
                    "resource_title": "Pandas Missing Data & Vectorized Cleaning Guide",
                    "resource_url": "https://pandas.pydata.org/docs/user_guide/missing_data.html",
                    "resource_provider": "Pandas Docs"
                },
                {
                    "id": "m3",
                    "step": "Phase 3: Statistical Profiling & Aggregation Engine",
                    "task": "Compute descriptive statistics, group-by aggregations, pivot tables, and correlation matrix analysis.",
                    "resource_title": "Pandas GroupBy & Reshaping Guide",
                    "resource_url": "https://pandas.pydata.org/docs/user_guide/groupby.html",
                    "resource_provider": "Pandas Docs"
                },
                {
                    "id": "m4",
                    "step": "Phase 4: Automated Reporting & Clean Data Export",
                    "task": "Export processed clean datasets to compressed Parquet/Excel formats and generate automated HTML profiling reports.",
                    "resource_title": "Pandas Performance & Parquet Export Specs",
                    "resource_url": "https://pandas.pydata.org/docs/user_guide/scale.html",
                    "resource_provider": "Pandas Docs"
                }
            ]

        # 3. RAG / LLM / Artificial Intelligence Domain
        elif any(k in title_lower or k in desc_lower or any(k in s for s in skills_lower) for k in ["rag", "llm", "ai", "vector", "langchain", "embedding"]):
            return [
                {
                    "id": "m1",
                    "step": "Phase 1: Document Chunking & Vector Embedding Pipeline",
                    "task": "Implement document ingestion, semantic text splitting, and generate vector embeddings using OpenAI/HuggingFace models.",
                    "resource_title": "LangChain Text Splitters & Embeddings Guide",
                    "resource_url": "https://python.langchain.com/docs/concepts/text_splitters/",
                    "resource_provider": "LangChain Docs"
                },
                {
                    "id": "m2",
                    "step": "Phase 2: Vector Database Store & Indexing",
                    "task": "Configure ChromaDB/FAISS/Pinecone vector store, build similarity search indices, and test retrieval latency.",
                    "resource_title": "Vector Stores & Similarity Search Specs",
                    "resource_url": "https://python.langchain.com/docs/concepts/vectorstores/",
                    "resource_provider": "LangChain Docs"
                },
                {
                    "id": "m3",
                    "step": "Phase 3: RAG Retrieval Chain & LLM Context Assembly",
                    "task": "Construct LCEL retrieval chains, engineer system prompt templates, and assemble grounded context for LLM generation.",
                    "resource_title": "LangChain Retrieval-Augmented Generation Chain Specs",
                    "resource_url": "https://python.langchain.com/docs/tutorials/rag/",
                    "resource_provider": "LangChain Docs"
                },
                {
                    "id": "m4",
                    "step": "Phase 4: Hallucination Guardrails & Chat UI Interface",
                    "task": "Implement response evaluation, source citation formatting, and launch an interactive web chat interface.",
                    "resource_title": "RAG Evaluation & Citation Best Practices",
                    "resource_url": "https://python.langchain.com/docs/tutorials/qa_chat_history/",
                    "resource_provider": "LangChain Docs"
                }
            ]

        # 4. Web Frontend & Full-Stack E-Commerce Domain
        elif any(k in title_lower or k in desc_lower or any(k in s for s in skills_lower) for k in ["react", "next.js", "e-commerce", "frontend", "full stack", "full-stack", "ui"]):
            return [
                {
                    "id": "m1",
                    "step": "Phase 1: Component Architecture & Design System Setup",
                    "task": "Setup Next.js/React app structure, TypeScript interfaces, and reusable UI components with glassmorphic styling.",
                    "resource_title": "Next.js App Router & Component Architecture Specs",
                    "resource_url": "https://nextjs.org/docs/app/building-your-application/routing",
                    "resource_provider": "Next.js Official Docs"
                },
                {
                    "id": "m2",
                    "step": "Phase 2: State Management & Product Catalog Routing",
                    "task": "Implement responsive layouts, product filtering, dynamic route handlers, and client/server state hooks.",
                    "resource_title": "React State Management & Hooks Guide",
                    "resource_url": "https://react.dev/learn/managing-state",
                    "resource_provider": "React Official Docs"
                },
                {
                    "id": "m3",
                    "step": "Phase 3: Cart Checkout State & API Integration",
                    "task": "Build persistent shopping cart state, connect REST API payment endpoints, and handle loading/error UI states.",
                    "resource_title": "Next.js Route Handlers & Data Fetching Guide",
                    "resource_url": "https://nextjs.org/docs/app/building-your-application/data-fetching",
                    "resource_provider": "Next.js Docs"
                },
                {
                    "id": "m4",
                    "step": "Phase 4: Responsive UI Optimization & Production Deployment",
                    "task": "Audit accessibility, optimize image loading and core web vitals, and deploy to Vercel/Render hosting.",
                    "resource_title": "Vercel Deployment & Web Vitals Optimization Specs",
                    "resource_url": "https://nextjs.org/docs/app/building-your-application/deploying",
                    "resource_provider": "Vercel Docs"
                }
            ]

        # 5. RESTful API & Backend Microservice Domain
        elif any(k in title_lower or k in desc_lower or any(k in s for s in skills_lower) for k in ["fastapi", "rest", "microservice", "backend", "api"]):
            return [
                {
                    "id": "m1",
                    "step": "Phase 1: Async App Boilerplate & Router Configuration",
                    "task": f"Initialize FastAPI microservice, Pydantic V2 schemas, CORS middleware, and structured logging for {primary_skill}.",
                    "resource_title": "FastAPI First Steps & Pydantic V2 Specs",
                    "resource_url": "https://fastapi.tiangolo.com/tutorial/first-steps/",
                    "resource_provider": "FastAPI Official Docs"
                },
                {
                    "id": "m2",
                    "step": "Phase 2: Security, Auth & Endpoint Architecture",
                    "task": "Implement OAuth2 JWT authentication, password hashing, route dependency injection, and error handlers.",
                    "resource_title": "FastAPI Security & OAuth2 JWT Implementation Guide",
                    "resource_url": "https://fastapi.tiangolo.com/tutorial/security/",
                    "resource_provider": "FastAPI Docs"
                },
                {
                    "id": "m3",
                    "step": "Phase 3: Database ORM & Connection Pooling",
                    "task": "Configure Async SQLAlchemy 2.0 ORM models, Alembic DB migrations, and PostgreSQL connection pooling.",
                    "resource_title": "Async SQLAlchemy 2.0 ORM & Alembic Guide",
                    "resource_url": "https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html",
                    "resource_provider": "SQLAlchemy Docs"
                },
                {
                    "id": "m4",
                    "step": "Phase 4: Pytest Suite & Multi-Stage Docker Build",
                    "task": "Write async integration test suites with Pytest, create a minimal multi-stage Dockerfile, and document Swagger UI specs.",
                    "resource_title": "FastAPI Testing & Docker Multi-Stage Build Specs",
                    "resource_url": "https://fastapi.tiangolo.com/tutorial/testing/",
                    "resource_provider": "FastAPI Docs"
                }
            ]

        # 6. Data Structures & Algorithms Domain
        elif any(k in title_lower or k in desc_lower or any(k in s for s in skills_lower) for k in ["algorithm", "graph", "data structures", "solver", "tree", "bfs"]):
            return [
                {
                    "id": "m1",
                    "step": "Phase 1: Core Data Structure Representations",
                    "task": f"Implement Graph, Queue, Stack, and Tree data structure primitives with optimal memory management in {primary_skill}.",
                    "resource_title": "Data Structures & Big-O Complexity Specs",
                    "resource_url": "https://docs.python.org/3/tutorial/datastructures.html",
                    "resource_provider": "Python Docs"
                },
                {
                    "id": "m2",
                    "step": "Phase 2: Graph Traversal & Pathfinding Solvers",
                    "task": "Implement BFS, DFS, Dijkstra's shortest path, and A* search algorithms with step-by-step state tracking.",
                    "resource_title": "Graph Algorithms & Traversal Guide",
                    "resource_url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
                    "resource_provider": "Algorithm Reference"
                },
                {
                    "id": "m3",
                    "step": "Phase 3: Interactive Visualizer & Canvas Rendering",
                    "task": "Build an interactive UI allowing users to step through algorithm iterations, pause execution, and inspect node state.",
                    "resource_title": "Canvas API & State Animation Specs",
                    "resource_url": "https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API",
                    "resource_provider": "MDN Web Docs"
                },
                {
                    "id": "m4",
                    "step": "Phase 4: Time Complexity Benchmarks & Test Suite",
                    "task": "Create benchmark scripts comparing execution time across varying input sizes and write unit test assertions.",
                    "resource_title": "Python Unit Testing & Profiling Guide",
                    "resource_url": "https://docs.python.org/3/library/unittest.html",
                    "resource_provider": "Python Docs"
                }
            ]

        # 7. Default General Software Engineering Domain
        else:
            return [
                {
                    "id": "m1",
                    "step": "Phase 1: System Architecture & Repository Setup",
                    "task": f"Initialize project repository, virtual environment, and directory structure tailored for {primary_skill}.",
                    "resource_title": f"{primary_skill} Architecture & Environment Setup Guide",
                    "resource_url": f"https://docs.python.org/3/tutorial/",
                    "resource_provider": f"{primary_skill} Docs"
                },
                {
                    "id": "m2",
                    "step": "Phase 2: Core Business Logic & Domain Services",
                    "task": f"Implement core computational algorithms, data validation, and domain logic using {primary_skill}.",
                    "resource_title": f"{primary_skill} Language Reference & Specifications",
                    "resource_url": f"https://developer.mozilla.org/en-US/search?q={urllib.parse.quote(primary_skill)}",
                    "resource_provider": f"{primary_skill} Official Docs"
                },
                {
                    "id": "m3",
                    "step": "Phase 3: Data Storage & Service Contracts",
                    "task": "Configure data persistence schemas, API contract validation, and error logging infrastructure.",
                    "resource_title": "Data Persistence & API Best Practices",
                    "resource_url": "https://git-scm.com/book/en/v2",
                    "resource_provider": "Software Architecture Specs"
                },
                {
                    "id": "m4",
                    "step": "Phase 4: Automated Testing & Packaging",
                    "task": "Write automated test coverage, create container deployment scripts, and publish project documentation.",
                    "resource_title": "Automated Testing & Containerization Specs",
                    "resource_url": "https://docs.docker.com/get-started/",
                    "resource_provider": "DevOps Docs"
                }
            ]
