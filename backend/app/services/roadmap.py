import uuid
import logging
from typing import List, Dict, Any, Optional
from collections import defaultdict, deque
from sqlalchemy.orm import Session

from app.models.roadmap import Roadmap, RoadmapPhase, RoadmapItem, RoadmapStatus, RoadmapItemType, RoadmapItemStatus
from app.models.skill import SkillPrerequisite
from app.models.career import CareerRole, CareerGoal
from app.repositories.roadmap import RoadmapRepository
from app.repositories.career import CareerRepository
from app.repositories.profile import ProfileRepository
from app.services.skill_gap import SkillGapService
from app.ai.extractors.roadmap_narrative import RoadmapNarrativeExtractor

logger = logging.getLogger(__name__)


class RoadmapService:
    def __init__(self, db: Session):
        self.db = db
        self.roadmap_repo = RoadmapRepository(db)
        self.career_repo = CareerRepository(db)
        self.profile_repo = ProfileRepository(db)
        self.skill_gap_service = SkillGapService(db)
        self.narrative_extractor = RoadmapNarrativeExtractor()

    async def get_or_generate_roadmap(self, profile_id: str) -> Optional[Roadmap]:
        """
        Gets current active roadmap for profile, or generates a new one if target career goal exists.
        Automatically upgrades/backfills existing roadmaps missing chapter titles or URLs.
        """
        # Check active career goal
        goal = self.career_repo.get_active_career_goal(profile_id)
        if not goal:
            return None

        # Check existing active roadmap
        active_roadmap = self.roadmap_repo.get_active_roadmap(profile_id, goal.career_role_id)
        if active_roadmap:
            # Upgrade existing roadmap if missing chapter titles or ref_urls
            self._backfill_roadmap_chapters_and_urls(active_roadmap)
            return active_roadmap

        # Generate new roadmap
        return await self.generate_roadmap(profile_id, goal.career_role_id)

    async def generate_roadmap(self, profile_id: str, career_role_id: Any) -> Roadmap:
        """
        Generates a deterministic topologically sorted roadmap based on student's resume skills & target gaps.
        """
        # 1. Fetch Career Role & Target Gaps
        role_id_int = int(career_role_id) if isinstance(career_role_id, (int, str)) and str(career_role_id).isdigit() else career_role_id
        role = self.career_repo.get_role_by_id(role_id_int)
        if not role:
            raise ValueError(f"Career role with id {career_role_id} not found")

        gap_report = self.skill_gap_service.compute_skill_gap(profile_id, role_id_int)
        gaps = gap_report.get("gaps", [])
        mastered = gap_report.get("mastered_skills", [])
        mastered_skill_names = [m.get("skill_name", m.get("name", "")) for m in mastered]

        # 2. Perform Topological Sort on Gap Skills based on SkillPrerequisite DAG
        sorted_gap_skills = self._topological_sort_gaps(gaps)

        # 3. Adaptive Phase Chunking
        phase_skeletons = self._chunk_skills_into_phases(sorted_gap_skills, role.name)

        # 4. Generate AI Narrative Pass
        narrative = await self.narrative_extractor.generate_narrative(
            target_role=role.name,
            mastered_skills=mastered_skill_names,
            phases_skeleton=phase_skeletons
        )

        # 5. Archive previous active roadmaps
        self.roadmap_repo.archive_active_roadmaps(profile_id)

        # 6. Build Roadmap Object Graph
        roadmap_id = str(uuid.uuid4())
        roadmap = Roadmap(
            id=roadmap_id,
            profile_id=str(profile_id),
            career_role_id=role.id,
            status=RoadmapStatus.ACTIVE,
            overall_strategy=narrative.overall_strategy,
            model_used="llama-3.3-70b-versatile"
        )

        # Map narratives by order index
        narrative_map = {p.phase_order: p for p in narrative.phases}

        for p_skel in phase_skeletons:
            phase_id = str(uuid.uuid4())
            order_idx = p_skel["order_index"]
            p_narrative = narrative_map.get(order_idx)

            title = p_narrative.title if p_narrative else p_skel["default_title"]
            summary = p_narrative.summary if p_narrative else f"Master essential skills for Phase {order_idx}."

            phase = RoadmapPhase(
                id=phase_id,
                roadmap_id=roadmap_id,
                order_index=order_idx,
                title=title,
                summary=summary
            )

            # Add Items to Phase grouped by Chapter Subsections
            item_order = 1
            skills_in_phase = p_skel["skill_objects"]
            chap_idx = 1

            # Query available resources from catalog
            from app.models.recommendation import Resource, Project
            catalog_resources = self.db.query(Resource).all()
            catalog_projects = self.db.query(Project).all()

            for skill_obj in skills_in_phase:
                raw_s_id = skill_obj.get("skill_id", 1)
                s_id_int = int(raw_s_id) if str(raw_s_id).isdigit() else raw_s_id
                s_name = skill_obj.get("skill_name", skill_obj.get("name", f"Skill #{raw_s_id}"))

                chapter_title = f"Chapter {order_idx}.{chap_idx}: {s_name} Foundations & Hands-On Practice"

                # 1. Interactive Skill Lesson Item
                skill_item = RoadmapItem(
                    id=str(uuid.uuid4()),
                    phase_id=phase_id,
                    type=RoadmapItemType.SKILL,
                    ref_skill_id=s_id_int,
                    chapter_title=chapter_title,
                    title=f"Core Lesson & Concept Practice: {s_name}",
                    order_index=item_order,
                    status=RoadmapItemStatus.NOT_STARTED,
                    estimated_hours=8
                )
                phase.items.append(skill_item)
                item_order += 1

                # 2. Attached Real Learning Resource Item
                matched_res = next((r for r in catalog_resources if any(s.id == s_id_int for s in r.skills)), None)
                res_url = matched_res.url if matched_res else f"https://developer.mozilla.org/en-US/search?q={s_name.replace(' ', '+')}"
                res_provider = matched_res.provider if matched_res else f"{s_name} Official Documentation"
                res_title = matched_res.title if matched_res else f"{s_name} Official Guide & Documentation"

                res_item = RoadmapItem(
                    id=str(uuid.uuid4()),
                    phase_id=phase_id,
                    type=RoadmapItemType.RESOURCE,
                    ref_skill_id=s_id_int,
                    ref_url=res_url,
                    ref_provider=res_provider,
                    chapter_title=chapter_title,
                    title=f"Study Resource: {res_title}",
                    order_index=item_order,
                    status=RoadmapItemStatus.NOT_STARTED,
                    estimated_hours=4
                )
                phase.items.append(res_item)
                item_order += 1
                chap_idx += 1

            # Phase Milestone / Capstone Chapter
            capstone_chap = f"Chapter {order_idx}.{chap_idx}: Phase Milestone Capstone Project"
            phase_skill_names = [s.get("skill_name", s.get("name", "")) for s in skills_in_phase]
            matched_proj = next((p for p in catalog_projects if any(s.id in [s_obj.get("skill_id") for s_obj in skills_in_phase] for s in p.skills)), None)

            proj_title = matched_proj.title if matched_proj else f"Complete Capstone Project demonstrating {', '.join(phase_skill_names)}"
            proj_desc = matched_proj.description if matched_proj else "Build a production-grade portfolio project."

            milestone_item = RoadmapItem(
                id=str(uuid.uuid4()),
                phase_id=phase_id,
                type=RoadmapItemType.MILESTONE,
                chapter_title=capstone_chap,
                title=f"Phase Milestone: {proj_title}",
                ref_provider="SkillForge Portfolio Project",
                ref_url="https://github.com/",
                order_index=item_order,
                status=RoadmapItemStatus.NOT_STARTED,
                estimated_hours=12
            )
            phase.items.append(milestone_item)

            roadmap.phases.append(phase)

        # 7. Persist to DB
        saved_roadmap = self.roadmap_repo.save_roadmap(roadmap)
        return saved_roadmap

    def _backfill_roadmap_chapters_and_urls(self, roadmap: Roadmap):
        """
        Backfills existing active roadmaps that were created before migration
        to ensure every item has a distinct chapter title and real resource URL.
        """
        from app.models.recommendation import Resource, Project
        catalog_resources = self.db.query(Resource).all()
        catalog_projects = self.db.query(Project).all()
        modified = False

        for phase in roadmap.phases:
            p_order = phase.order_index
            chap_map = {}
            chap_counter = 1

            for item in phase.items:
                # 1. Backfill chapter_title if missing or generic
                if not item.chapter_title or "CORE LEARNING OBJECTIVES" in item.chapter_title:
                    if item.ref_skill:
                        s_name = item.ref_skill.name
                        if s_name not in chap_map:
                            chap_map[s_name] = f"Chapter {p_order}.{chap_counter}: {s_name} Mastery & Deep Dive"
                            chap_counter += 1
                        item.chapter_title = chap_map[s_name]
                    elif item.type == RoadmapItemType.MILESTONE:
                        item.chapter_title = f"Chapter {p_order}.{chap_counter}: Phase Capstone Milestone Project"
                    else:
                        item.chapter_title = f"Chapter {p_order}.1: Core Learning Objectives"
                    modified = True

                # 2. Backfill ref_url and ref_provider for RESOURCE items
                if item.type == RoadmapItemType.RESOURCE and not item.ref_url:
                    if item.ref_skill_id:
                        matched_res = next((r for r in catalog_resources if any(s.id == item.ref_skill_id for s in r.skills)), None)
                        if matched_res:
                            item.ref_url = matched_res.url
                            item.ref_provider = matched_res.provider
                            if "Documentation" not in item.title and matched_res.title:
                                item.title = f"Study Resource: {matched_res.title}"
                        else:
                            s_name = item.ref_skill.name if item.ref_skill else "Technical Skills"
                            item.ref_url = f"https://developer.mozilla.org/en-US/search?q={s_name.replace(' ', '+')}"
                            item.ref_provider = f"{s_name} Official Documentation"
                    else:
                        item.ref_url = "https://developer.mozilla.org/"
                        item.ref_provider = "Official Documentation"
                    modified = True

                # 3. Backfill ref_url for MILESTONE items
                if item.type == RoadmapItemType.MILESTONE and not item.ref_url:
                    item.ref_url = "https://github.com/"
                    item.ref_provider = "SkillForge Portfolio Project"
                    modified = True

        if modified:
            self.db.commit()

    def update_item_status(self, item_id: str, status: RoadmapItemStatus) -> RoadmapItem:
        updated = self.roadmap_repo.update_item_status(item_id, status)
        if not updated:
            raise ValueError(f"Roadmap item {item_id} not found")
        return updated

    def _topological_sort_gaps(self, gaps: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Sorts gap skills using Kahn's algorithm based on skill_prerequisites table.
        """
        if not gaps:
            return []

        gap_map = {str(g["skill_id"]): g for g in gaps}
        gap_ids = set(gap_map.keys())

        # Fetch prerequisites for all gap skills
        prereqs = self.db.query(SkillPrerequisite).all()

        in_degree = {gid: 0 for gid in gap_ids}
        graph = defaultdict(list)

        for p in prereqs:
            target_id = str(p.skill_id)
            prereq_id = str(p.prerequisite_skill_id)

            # If both prerequisite and target are in the student's gap list
            if target_id in gap_ids and prereq_id in gap_ids:
                graph[prereq_id].append(target_id)
                in_degree[target_id] += 1

        # Queue skills with in-degree == 0, sorted by gap priority (descending)
        ready_queue = [gid for gid, deg in in_degree.items() if deg == 0]
        ready_queue.sort(key=lambda x: gap_map[x].get("priority_score", gap_map[x].get("priority", 0)), reverse=True)

        sorted_ids = []
        queue = deque(ready_queue)

        while queue:
            node = queue.popleft()
            sorted_ids.append(node)

            for neighbor in graph[node]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        # Handle any remaining nodes (e.g. if cycle exists or unreached)
        for gid in gaps:
            sk_id = str(gid["skill_id"])
            if sk_id not in sorted_ids:
                sorted_ids.append(sk_id)

        return [gap_map[sid] for sid in sorted_ids]

    def _chunk_skills_into_phases(self, gap_skills: List[Dict[str, Any]], role_name: str = "Software Engineer") -> List[Dict[str, Any]]:
        """
        Groups ordered gap skills into 1, 2, or 3 phases.
        """
        if not gap_skills:
            return [{
                "order_index": 1,
                "default_title": f"Phase 1: Advanced {role_name} Capstone & System Design",
                "skill_objects": [
                    {"skill_id": 1, "skill_name": f"{role_name} Advanced Architecture", "category": "engineering"},
                    {"skill_id": 2, "skill_name": "Performance Optimization & Production Hardening", "category": "engineering"}
                ],
                "skills": [f"{role_name} Advanced Architecture", "Performance Optimization"]
            }]

        total_gaps = len(gap_skills)

        if total_gaps <= 3:
            chunks = [gap_skills]
            titles = ["Phase 1: Essential Foundations & Skill Mastery"]
        elif total_gaps <= 7:
            mid = (total_gaps + 1) // 2
            chunks = [gap_skills[:mid], gap_skills[mid:]]
            titles = [
                "Phase 1: Core Prerequisites & Foundation Skills",
                "Phase 2: Advanced Competencies & Implementation"
            ]
        else:
            c1 = total_gaps // 3
            c2 = (total_gaps - c1) // 2
            chunks = [gap_skills[:c1], gap_skills[c1:c1+c2], gap_skills[c1+c2:]]
            titles = [
                "Phase 1: Fundamental Principles & Prerequisites",
                "Phase 2: Core Architecture & Hands-on Tools",
                "Phase 3: Specialized Mastery & Production Readiness"
            ]

        phases_skeleton = []
        for idx, (chunk, title) in enumerate(zip(chunks, titles), start=1):
            phases_skeleton.append({
                "order_index": idx,
                "default_title": title,
                "skill_objects": chunk,
                "skills": [s.get("skill_name", s.get("name", "")) for s in chunk]
            })

        return phases_skeleton
