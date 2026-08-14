import uuid
from typing import Optional, List, Any
from sqlalchemy.orm import Session, joinedload

from app.models.roadmap import Roadmap, RoadmapPhase, RoadmapItem, RoadmapStatus, RoadmapItemStatus


class RoadmapRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_active_roadmap(self, profile_id: str, career_role_id: Optional[Any] = None) -> Optional[Roadmap]:
        query = (
            self.db.query(Roadmap)
            .options(
                joinedload(Roadmap.phases)
                .joinedload(RoadmapPhase.items)
                .joinedload(RoadmapItem.ref_skill)
            )
            .filter(Roadmap.profile_id == str(profile_id), Roadmap.status == RoadmapStatus.ACTIVE)
        )
        if career_role_id is not None and str(career_role_id).isdigit():
            query = query.filter(Roadmap.career_role_id == int(career_role_id))
        
        return query.order_by(Roadmap.generated_at.desc()).first()

    def archive_active_roadmaps(self, profile_id: str) -> None:
        self.db.query(Roadmap).filter(
            Roadmap.profile_id == str(profile_id),
            Roadmap.status == RoadmapStatus.ACTIVE
        ).update({"status": RoadmapStatus.ARCHIVED})
        self.db.commit()

    def save_roadmap(self, roadmap: Roadmap) -> Roadmap:
        self.db.add(roadmap)
        self.db.commit()
        self.db.refresh(roadmap)
        return roadmap

    def get_item_by_id(self, item_id: str) -> Optional[RoadmapItem]:
        return self.db.query(RoadmapItem).filter(RoadmapItem.id == str(item_id)).first()

    def update_item_status(self, item_id: str, status: RoadmapItemStatus) -> Optional[RoadmapItem]:
        item = self.get_item_by_id(item_id)
        if not item:
            return None
        item.status = status
        self.db.commit()
        self.db.refresh(item)
        return item
