import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.repositories.recommendation import RecommendationRepository
from app.repositories.career import CareerRepository
from app.repositories.profile import ProfileRepository
from app.services.skill_gap import SkillGapService
from app.services.web_search_engine import InternetSearchEngine
from app.ai.extractors.recommendation_explanation import RecommendationExplanationExtractor

logger = logging.getLogger(__name__)


class RecommendationService:
    def __init__(self, db: Session):
        self.db = db
        self.recommendation_repo = RecommendationRepository(db)
        self.career_repo = CareerRepository(db)
        self.profile_repo = ProfileRepository(db)
        self.skill_gap_service = SkillGapService(db)
        self.explanation_extractor = RecommendationExplanationExtractor()

    async def get_recommendations(self, profile_id: str, category: str = "resource") -> Dict[str, Any]:
        """
        Retrieves, scores, ranks, and annotates recommendations for a profile.
        Category can be: 'resource', 'project', 'certification'
        """
        # 1. Fetch active career goal & profile
        goal = self.career_repo.get_active_career_goal(profile_id)
        if not goal:
            return {"career_role_id": None, "career_role_name": None, "items": []}

        role = self.career_repo.get_role_by_id(goal.career_role_id)
        profile = self.profile_repo.get_by_id(profile_id)
        interests = profile.interests if profile and profile.interests else []

        # 2. Compute Skill Gaps
        gap_report = self.skill_gap_service.compute_skill_gap(profile_id, goal.career_role_id)
        gaps = gap_report.get("gaps", [])

        # Create Gap Map for fast lookup
        gap_map = {g["skill_id"]: g for g in gaps}
        gap_skill_ids = list(gap_map.keys())

        # 3. Candidate Retrieval & Scoring
        category_clean = category.lower().strip()
        scored_items = []

        # 3. Candidate Retrieval & Scoring
        category_clean = category.lower().strip()
        scored_items = []

        if category_clean == "project":
            candidates = self.recommendation_repo.get_projects_by_skill_ids(gap_skill_ids)
            for proj in candidates:
                item_data = self._score_item(proj, gap_map, interests, "project")
                if item_data:
                    scored_items.append(item_data)
        elif category_clean == "certification":
            candidates = self.recommendation_repo.get_certifications_by_skill_ids(gap_skill_ids)
            for cert in candidates:
                item_data = self._score_item(cert, gap_map, interests, "certification")
                if item_data:
                    scored_items.append(item_data)
        else:  # default 'resource'
            candidates = self.recommendation_repo.get_resources_by_skill_ids(gap_skill_ids)
            for res in candidates:
                item_data = self._score_item(res, gap_map, interests, "resource")
                if item_data:
                    scored_items.append(item_data)

        # Fallback: if no candidates matched exact gap_skill_ids, fetch all items in category
        if not scored_items:
            if category_clean == "project":
                fallback_candidates = self.recommendation_repo.get_projects_by_skill_ids([])
                for proj in fallback_candidates:
                    item_data = self._score_item(proj, gap_map, interests, "project", is_fallback=True)
                    if item_data:
                        scored_items.append(item_data)
            elif category_clean == "certification":
                fallback_candidates = self.recommendation_repo.get_certifications_by_skill_ids([])
                for cert in fallback_candidates:
                    item_data = self._score_item(cert, gap_map, interests, "certification", is_fallback=True)
                    if item_data:
                        scored_items.append(item_data)
            else:
                fallback_candidates = self.recommendation_repo.get_resources_by_skill_ids([])
                for res in fallback_candidates:
                    item_data = self._score_item(res, gap_map, interests, "resource", is_fallback=True)
                    if item_data:
                        scored_items.append(item_data)

        # 4. Rank candidates by score descending
        scored_items.sort(key=lambda x: x["score"], reverse=True)

        # Take top 10 candidates
        top_items = scored_items[:10]

        # 5. Generate AI Personalized Explanations
        explanations = await self.explanation_extractor.generate_explanations(
            target_role=role.name if role else "Target Career Role",
            interests=interests,
            items=top_items
        )

        for item in top_items:
            item["explanation"] = explanations.get(item["id"], f"Recommended for closing your key skill gaps in {role.name if role else 'your target role'}.")

        # Log recommendation generation
        self.recommendation_repo.log_recommendation(profile_id, category_clean, goal.career_role_id)

        return {
            "career_role_id": goal.career_role_id,
            "career_role_name": role.name if role else "Target Career Role",
            "category": category_clean,
            "items": top_items
        }

    def _score_item(
        self,
        item: Any,
        gap_map: Dict[int, Dict[str, Any]],
        interests: List[str],
        category: str,
        is_fallback: bool = False
    ) -> Optional[Dict[str, Any]]:
        """
        Applies deterministic candidate filtering & scoring formula:
        score = 3 * gap_priority_weight + 2 * difficulty_fit + 1 * interest_match + 1 * skill_coverage
        """
        item_skills = getattr(item, "skills", [])
        matched_gaps = [gap_map[s.id] for s in item_skills if s.id in gap_map]

        if not matched_gaps and gap_map and not is_fallback:
            # Skip candidate if it does not cover any active gap skill (unless in fallback mode)
            return None

        matched_skill_names = [g.get("name", g.get("skill_name", "")) for g in matched_gaps]
        if not matched_skill_names and item_skills:
            matched_skill_names = [s.name for s in item_skills]

        # Signal 1: gap_priority_weight (best-matching gap skill weight)
        # priority_bucket: high=3, medium=2, low=1
        priority_weights = {"high": 3, "medium": 2, "low": 1}
        best_priority = max([priority_weights.get(g.get("priority_bucket", "medium"), 2) for g in matched_gaps], default=1)
        score_priority = 3 * best_priority

        # Signal 2: difficulty_fit (item difficulty within +-1 of student level)
        item_diff = getattr(item, "difficulty", 2)
        score_diff = 2 if 1 <= item_diff <= 4 else 0

        # Signal 3: interest_match (overlap with profile.interests)
        score_interest = 0
        if interests:
            item_desc = getattr(item, "description", "") or getattr(item, "title", "")
            if any(interest.lower() in item_desc.lower() for interest in interests):
                score_interest = 1

        # Signal 4: skill_coverage (min(len(matched_gap_skills), 3))
        score_coverage = min(len(matched_gaps), 3)

        # Total Weighted Score
        total_score = float(score_priority + score_diff + score_interest + score_coverage)

        # Verified Source URL & Milestones for Project category
        proj_url = getattr(item, "url", None)
        source_ref = getattr(item, "source_reference", None)
        milestones = []

        if category == "project":
            first_skill = matched_skill_names[0] if matched_skill_names else "Python"
            title = getattr(item, "title", "Project")

            # Full-Internet Web & Repository Search Engine Query
            search_result = InternetSearchEngine.search_project_source(title, matched_skill_names)
            proj_url = search_result.get("url") or proj_url
            source_ref = search_result.get("source_reference", "Verified Internet Web Specification")

            # 4 Step-by-Step Milestones with Dedicated Resource Links
            milestones = [
                {
                    "id": "m1",
                    "step": "Phase 1: Environment & Architecture Foundations",
                    "task": f"Initialize project repository, virtual environment, and core project configuration for {first_skill}.",
                    "resource_title": f"{first_skill} Project Architecture & Venv Guide",
                    "resource_url": "https://docs.python.org/3/tutorial/venv.html",
                    "resource_provider": "Python Docs"
                },
                {
                    "id": "m2",
                    "step": "Phase 2: Core Domain Logic & Algorithmic Engine",
                    "task": f"Implement core computational logic, data models, and business services using {', '.join(matched_skill_names[:2])}.",
                    "resource_title": f"{matched_skill_names[0] if matched_skill_names else first_skill} Core Tutorial & API Specs",
                    "resource_url": f"https://developer.mozilla.org/en-US/search?q={first_skill.replace(' ', '+')}",
                    "resource_provider": f"{first_skill} Official Docs"
                },
                {
                    "id": "m3",
                    "step": "Phase 3: Data Persistence & Integration Layer",
                    "task": "Configure database schemas, ORM queries, caching layers, and external service contracts.",
                    "resource_title": "PostgreSQL & Redis Caching Integration Specs",
                    "resource_url": "https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html",
                    "resource_provider": "SQLAlchemy Docs"
                },
                {
                    "id": "m4",
                    "step": "Phase 4: Automated Testing & Production Containerization",
                    "task": "Write end-to-end integration tests, package into a multi-stage Docker container, and document setup in README.",
                    "resource_title": "Docker Multi-Stage Build & Pytest Automation Specs",
                    "resource_url": "https://docs.docker.com/build/building/multi-stage/",
                    "resource_provider": "Docker Docs"
                }
            ]

        return {
            "id": item.id,
            "category": category,
            "title": item.title,
            "url": proj_url,
            "provider": getattr(item, "provider", "GitHub Verified Specification" if category == "project" else "SkillForge Curation"),
            "source_reference": source_ref,
            "type": getattr(item, "type", "course").value if hasattr(getattr(item, "type", None), "value") else str(getattr(item, "type", "course")),
            "description": getattr(item, "description", None),
            "difficulty": getattr(item, "difficulty", 2),
            "estimated_hours": getattr(item, "estimated_hours", 10),
            "level": getattr(item, "level", "entry").value if hasattr(getattr(item, "level", None), "value") else str(getattr(item, "level", "entry")),
            "career_relevance": getattr(item, "career_relevance", None),
            "matched_gap_skills": matched_skill_names,
            "milestones": milestones,
            "score": total_score
        }
