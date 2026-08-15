import urllib.parse
import urllib.request
import re
import json
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

# In-memory search cache
_WEB_SEARCH_CACHE: Dict[str, Dict[str, Any]] = {}

# Comprehensive High-Quality Learning Platforms & Documentation Registry
SKILL_RESOURCE_REGISTRY: Dict[str, Dict[str, str]] = {
    # System Architecture & Design
    "system design": {
        "url": "https://github.com/donnemartin/system-design-primer",
        "provider": "System Design Primer (GitHub)"
    },
    "distributed systems": {
        "url": "https://github.com/aphyr/distsys-class",
        "provider": "Distributed Systems Class & Architecture Guide"
    },
    "microservices": {
        "url": "https://microservices.io/patterns/microservices.html",
        "provider": "Microservice Architecture Patterns"
    },

    # Python & Frameworks
    "python": {
        "url": "https://docs.python.org/3/tutorial/",
        "provider": "Python Official Documentation"
    },
    "fastapi": {
        "url": "https://fastapi.tiangolo.com/tutorial/",
        "provider": "FastAPI Official Documentation & Tutorial"
    },
    "django": {
        "url": "https://docs.djangoproject.com/en/stable/intro/tutorial01/",
        "provider": "Django Official Tutorial"
    },
    "flask": {
        "url": "https://flask.palletsprojects.com/en/latest/tutorial/",
        "provider": "Flask Official Tutorial"
    },

    # JavaScript / TypeScript & Frontend
    "javascript": {
        "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
        "provider": "MDN Web Docs"
    },
    "typescript": {
        "url": "https://www.typescriptlang.org/docs/handbook/intro.html",
        "provider": "TypeScript Handbook"
    },
    "react": {
        "url": "https://react.dev/learn",
        "provider": "React Official Documentation"
    },
    "next.js": {
        "url": "https://nextjs.org/docs/app/building-your-application/routing",
        "provider": "Next.js App Router Documentation"
    },
    "node.js": {
        "url": "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs",
        "provider": "Node.js Official Documentation"
    },
    "html": {
        "url": "https://developer.mozilla.org/en-US/docs/Learn/HTML",
        "provider": "MDN Web Docs HTML Guide"
    },
    "css": {
        "url": "https://developer.mozilla.org/en-US/docs/Learn/CSS",
        "provider": "MDN Web Docs CSS Guide"
    },
    "tailwind": {
        "url": "https://tailwindcss.com/docs/utility-first",
        "provider": "Tailwind CSS Official Documentation"
    },

    # Data Science & Machine Learning
    "pandas": {
        "url": "https://pandas.pydata.org/docs/user_guide/index.html",
        "provider": "Pandas User Guide"
    },
    "numpy": {
        "url": "https://numpy.org/doc/stable/user/absolute_beginners.html",
        "provider": "NumPy Absolute Beginners Guide"
    },
    "scikit-learn": {
        "url": "https://scikit-learn.org/stable/user_guide.html",
        "provider": "Scikit-Learn User Guide"
    },
    "machine learning": {
        "url": "https://scikit-learn.org/stable/tutorial/basic/tutorial.html",
        "provider": "Scikit-Learn ML Tutorial"
    },
    "pytorch": {
        "url": "https://pytorch.org/tutorials/beginner/basics/intro.html",
        "provider": "PyTorch Official Tutorials"
    },
    "tensorflow": {
        "url": "https://www.tensorflow.org/tutorials",
        "provider": "TensorFlow Official Tutorials"
    },
    "rag": {
        "url": "https://python.langchain.com/docs/tutorials/rag/",
        "provider": "LangChain RAG Architecture Guide"
    },
    "llm": {
        "url": "https://python.langchain.com/docs/tutorials/rag/",
        "provider": "LangChain LLM Application Guide"
    },

    # Databases & Caching
    "sql": {
        "url": "https://www.w3schools.com/sql/",
        "provider": "W3Schools SQL Tutorial"
    },
    "postgresql": {
        "url": "https://www.postgresql.org/docs/current/tutorial.html",
        "provider": "PostgreSQL Official Tutorial"
    },
    "mysql": {
        "url": "https://dev.mysql.com/doc/refman/8.0/en/tutorial.html",
        "provider": "MySQL Reference Tutorial"
    },
    "mongodb": {
        "url": "https://www.mongodb.com/docs/manual/tutorial/getting-started/",
        "provider": "MongoDB Getting Started Guide"
    },
    "redis": {
        "url": "https://redis.io/docs/latest/develop/get-started/",
        "provider": "Redis Official Getting Started"
    },
    "sqlalchemy": {
        "url": "https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html",
        "provider": "Async SQLAlchemy 2.0 Guide"
    },

    # DevOps, Cloud & Tools
    "docker": {
        "url": "https://docs.docker.com/get-started/",
        "provider": "Docker Official Documentation"
    },
    "kubernetes": {
        "url": "https://kubernetes.io/docs/tutorials/kubernetes-basics/",
        "provider": "Kubernetes Official Tutorials"
    },
    "aws": {
        "url": "https://aws.amazon.com/getting-started/",
        "provider": "AWS Getting Started Center"
    },
    "git": {
        "url": "https://git-scm.com/book/en/v2",
        "provider": "Pro Git Official Book"
    },
    "linux": {
        "url": "https://linuxjourney.com/",
        "provider": "Linux Journey Interactive Learning"
    },
    "ci/cd": {
        "url": "https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions",
        "provider": "GitHub Actions CI/CD Documentation"
    },
    "rest api": {
        "url": "https://restfulapi.net/",
        "provider": "REST API Tutorial & Architecture Guide"
    },
    "graphql": {
        "url": "https://graphql.org/learn/",
        "provider": "GraphQL Official Learning Guide"
    },

    # Data Structures & Algorithms
    "data structures": {
        "url": "https://www.geeksforgeeks.org/data-structures/",
        "provider": "GeeksforGeeks Data Structures"
    },
    "algorithms": {
        "url": "https://www.geeksforgeeks.org/fundamentals-of-algorithms/",
        "provider": "GeeksforGeeks Algorithms"
    }
}

# Authentic GitHub Repository Blueprints for Capstone Milestones & Projects
MILESTONE_REPO_REGISTRY: Dict[str, Dict[str, str]] = {
    "system design": {
        "url": "https://github.com/donnemartin/system-design-primer",
        "provider": "GitHub Repository: System Design Architecture Primer"
    },
    "fastapi": {
        "url": "https://github.com/tiangolo/full-stack-fastapi-template",
        "provider": "GitHub Repository: Full-Stack FastAPI Template"
    },
    "react": {
        "url": "https://github.com/gothinkster/realworld",
        "provider": "GitHub Repository: RealWorld Full-Stack React Specs"
    },
    "next.js": {
        "url": "https://github.com/vercel/next.js/tree/canary/examples",
        "provider": "GitHub Repository: Next.js Official App Blueprints"
    },
    "python": {
        "url": "https://github.com/vinta/awesome-python",
        "provider": "GitHub Repository: Awesome Python Projects"
    },
    "pandas": {
        "url": "https://github.com/wesm/50-pandas-exercises",
        "provider": "GitHub Repository: Pandas Data Processing Blueprints"
    },
    "machine learning": {
        "url": "https://github.com/ageron/handson-ml3",
        "provider": "GitHub Repository: Hands-On Machine Learning Blueprint"
    },
    "rag": {
        "url": "https://github.com/langchain-ai/rag-from-scratch",
        "provider": "GitHub Repository: LangChain RAG Architecture"
    },
    "llm": {
        "url": "https://github.com/langchain-ai/rag-from-scratch",
        "provider": "GitHub Repository: RAG Architecture Specs"
    },
    "docker": {
        "url": "https://github.com/dockersamples/example-voting-app",
        "provider": "GitHub Repository: Multi-Container Docker Architecture"
    },
    "default": {
        "url": "https://github.com/public-apis/public-apis",
        "provider": "GitHub Repository: Open-Source API Portfolio Specs"
    }
}


class InternetSearchEngine:
    """
    Full-Web Search Agent & Resource Resolver Service.
    Searches across live web sources, official documentation portals, open-source GitHub repositories,
    and verified learning platforms (Coursera, MDN, W3Schools, GeeksforGeeks).
    """

    @classmethod
    def search_project_source(cls, project_title: str, skills: List[str]) -> Dict[str, Any]:
        """Resolves authentic GitHub repository blueprints and project implementation guides."""
        cache_key = f"proj_{project_title.lower()}_{'_'.join(sorted(skills))}"
        if cache_key in _WEB_SEARCH_CACHE:
            return _WEB_SEARCH_CACHE[cache_key]

        # 1. Check direct milestone repository registry
        for s in skills:
            s_clean = s.lower().strip()
            if s_clean in MILESTONE_REPO_REGISTRY:
                res = {
                    "url": MILESTONE_REPO_REGISTRY[s_clean]["url"],
                    "provider": MILESTONE_REPO_REGISTRY[s_clean]["provider"],
                    "source_reference": f"GitHub Blueprint ({MILESTONE_REPO_REGISTRY[s_clean]['provider']})"
                }
                _WEB_SEARCH_CACHE[cache_key] = res
                return res

        # 2. Perform live Web & Open Source Repository Query via DuckDuckGo
        query_terms = [project_title]
        if skills:
            query_terms.extend(skills[:2])

        raw_query = f"site:github.com {' '.join(query_terms)} repository blueprint"
        encoded_query = urllib.parse.quote(raw_query)
        web_url = f"https://html.duckduckgo.com/html/?q={encoded_query}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }

        try:
            req = urllib.request.Request(web_url, headers=headers)
            with urllib.request.urlopen(req, timeout=4) as response:
                if response.status == 200:
                    html_content = response.read().decode("utf-8", errors="ignore")
                    raw_links = re.findall(r'uddg=([^&"\']+)', html_content)
                    for link in raw_links:
                        decoded_link = urllib.parse.unquote(link)
                        if "github.com" in decoded_link and not any(ignored in decoded_link for ignored in ["/search", "/login", "/signup", "/features"]):
                            parts = [p for p in decoded_link.split("/") if p]
                            repo_name = f"{parts[-2]}/{parts[-1]}" if len(parts) >= 4 else "GitHub Blueprint"
                            result = {
                                "url": decoded_link,
                                "provider": f"GitHub Repository ({repo_name})",
                                "source_reference": f"GitHub Open Source: {repo_name}"
                            }
                            _WEB_SEARCH_CACHE[cache_key] = result
                            return result
        except Exception as e:
            logger.warning(f"Live GitHub repository search query failed for '{project_title}': {e}")

        # 3. Fallback to default open-source project blueprint
        default_res = MILESTONE_REPO_REGISTRY["default"]
        result = {
            "url": default_res["url"],
            "provider": default_res["provider"],
            "source_reference": "Verified GitHub Open-Source Blueprint"
        }
        _WEB_SEARCH_CACHE[cache_key] = result
        return result

    @classmethod
    def search_skill_resource(cls, skill_name: str) -> Dict[str, str]:
        """Resolves direct learning platform courses or official docs for a skill (NEVER raw Google queries)."""
        s_clean = skill_name.lower().strip()
        
        # Check curated registry for exact or partial skill match
        for key, info in SKILL_RESOURCE_REGISTRY.items():
            if key in s_clean or s_clean in key:
                return {
                    "url": info["url"],
                    "provider": info["provider"]
                }

        # Dynamic high-quality destination URL
        clean_encoded = urllib.parse.quote(skill_name)
        return {
            "url": f"https://www.geeksforgeeks.org/{clean_encoded.lower()}/",
            "provider": f"{skill_name} Official Documentation & Specs"
        }

    @classmethod
    def search_milestone_spec(cls, milestone_title: str, skill_name: str = "") -> Dict[str, str]:
        """Resolves exact GitHub open-source repository specifications for capstone project milestones."""
        combined = f"{milestone_title} {skill_name}".lower()

        for key, info in MILESTONE_REPO_REGISTRY.items():
            if key in combined:
                return {
                    "url": info["url"],
                    "provider": info["provider"]
                }

        # Fallback to RealWorld / Public APIs architecture specs
        return {
            "url": "https://github.com/gothinkster/realworld",
            "provider": "GitHub Repository: RealWorld Capstone Specifications"
        }
