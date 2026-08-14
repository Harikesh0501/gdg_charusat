import uuid
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.progress import LearningProgress, ProgressEventType


class ProgressRepository:
    def __init__(self, db: Session):
        self.db = db

    def log_event(
        self,
        profile_id: str,
        event_type: ProgressEventType,
        title: str,
        description: Optional[str] = None,
        metadata_json: Optional[Dict[str, Any]] = None
    ) -> LearningProgress:
        event = LearningProgress(
            id=str(uuid.uuid4()),
            profile_id=profile_id,
            event_type=event_type,
            title=title,
            description=description,
            metadata_json=metadata_json
        )
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def get_user_events(self, profile_id: str, limit: int = 20) -> List[LearningProgress]:
        return (
            self.db.query(LearningProgress)
            .filter(LearningProgress.profile_id == profile_id)
            .order_by(LearningProgress.created_at.desc())
            .limit(limit)
            .all()
        )
