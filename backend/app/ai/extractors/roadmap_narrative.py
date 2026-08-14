import logging
from typing import List, Dict, Any
from app.ai.providers.groq_provider import GroqProvider
from app.ai.schemas.roadmap_narrative import RoadmapNarrativeResult, PhaseNarrative
from app.ai.prompts.roadmap_prompts import (
    ROADMAP_NARRATIVE_SYSTEM_PROMPT,
    ROADMAP_NARRATIVE_USER_TEMPLATE,
)

logger = logging.getLogger(__name__)


class RoadmapNarrativeExtractor:
    def __init__(self, provider: GroqProvider | None = None):
        self.provider = provider or GroqProvider()

    async def generate_narrative(
        self,
        target_role: str,
        mastered_skills: List[str],
        phases_skeleton: List[Dict[str, Any]]
    ) -> RoadmapNarrativeResult:
        """
        Generates AI narrative summaries for roadmap phases with automatic deterministic fallback.
        """
        # Format skeleton for prompt
        skeleton_lines = []
        for p in phases_skeleton:
            skills_str = ", ".join(p.get("skills", []))
            skeleton_lines.append(f"Phase {p['order_index']} ({p['default_title']}): Skills -> {skills_str}")

        user_prompt = ROADMAP_NARRATIVE_USER_TEMPLATE.format(
            target_role=target_role,
            mastered_skills=", ".join(mastered_skills) if mastered_skills else "None recorded yet",
            phase_skeleton_text="\n".join(skeleton_lines)
        )

        try:
            result = await self.provider.generate_structured(
                system=ROADMAP_NARRATIVE_SYSTEM_PROMPT,
                user=user_prompt,
                schema=RoadmapNarrativeResult,
                max_retries=1,
            )
            return result
        except Exception as e:
            logger.warning(f"AI Roadmap Narrative generation failed/fallback triggered: {e}")
            return self._build_fallback_narrative(target_role, phases_skeleton)

    def _build_fallback_narrative(
        self,
        target_role: str,
        phases_skeleton: List[Dict[str, Any]]
    ) -> RoadmapNarrativeResult:
        fallback_phases = []
        for p in phases_skeleton:
            skills_str = ", ".join(p.get("skills", []))
            fallback_phases.append(
                PhaseNarrative(
                    phase_order=p["order_index"],
                    title=p["default_title"],
                    summary=f"Focus on mastering essential skills for {target_role}: {skills_str}."
                )
            )

        return RoadmapNarrativeResult(
            overall_strategy=f"Targeted roadmap designed to bridge your skill gaps for becoming a {target_role}.",
            phases=fallback_phases
        )
