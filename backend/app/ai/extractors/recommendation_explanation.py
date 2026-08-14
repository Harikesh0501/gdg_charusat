import json
import logging
from typing import List, Dict, Any
from app.ai.providers.groq_provider import GroqProvider
from app.ai.schemas.recommendation_explanation import RecommendationExplanationResponse
from app.ai.prompts.recommendation_prompts import RECOMMENDATION_SYSTEM_PROMPT, RECOMMENDATION_USER_PROMPT_TEMPLATE

logger = logging.getLogger(__name__)


class RecommendationExplanationExtractor:
    def __init__(self):
        self.provider = GroqProvider()

    async def generate_explanations(
        self,
        target_role: str,
        interests: List[str],
        items: List[Dict[str, Any]]
    ) -> Dict[int, str]:
        """
        Generates personalized explanations for surfaced recommendations.
        Falls back to deterministic templated text on failure.
        """
        if not items:
            return {}

        try:
            items_payload = [
                {
                    "item_id": item["id"],
                    "title": item["title"],
                    "category": item.get("category", "resource"),
                    "matched_gap_skills": item.get("matched_gap_skills", [])
                }
                for item in items
            ]

            user_prompt = RECOMMENDATION_USER_PROMPT_TEMPLATE.format(
                target_role=target_role,
                interests=", ".join(interests) if interests else "General Software Development",
                items_json=json.dumps(items_payload, indent=2)
            )

            result: RecommendationExplanationResponse = await self.provider.generate_structured(
                system=RECOMMENDATION_SYSTEM_PROMPT,
                user=user_prompt,
                schema=RecommendationExplanationResponse
            )

            explanation_map = {exp.item_id: exp.explanation for exp in result.explanations}

            # Fill missing with fallbacks
            for item in items:
                i_id = item["id"]
                if i_id not in explanation_map or not explanation_map[i_id]:
                    explanation_map[i_id] = self._generate_fallback(target_role, item)

            return explanation_map

        except Exception as e:
            logger.warning(f"Groq recommendation explanation failed: {e}. Using deterministic fallbacks.")
            return {item["id"]: self._generate_fallback(target_role, item) for item in items}

    def _generate_fallback(self, target_role: str, item: Dict[str, Any]) -> str:
        gaps = item.get("matched_gap_skills", [])
        gap_str = ", ".join(gaps) if gaps else "core domain competencies"
        category = item.get("category", "resource")

        if category == "project":
            return f"Building '{item['title']}' provides hands-on implementation practice for {gap_str}, directly strengthening your portfolio for {target_role}."
        elif category == "certification":
            return f"Earning {item['title']} formally validates your proficiency in {gap_str} for {target_role} roles."
        else:
            return f"Because {gap_str} is a key requirement for {target_role}, this course offers the fastest path to mastering these concepts."
