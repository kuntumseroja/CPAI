"""
Feedback storage for HITL and retraining
In-memory by default; extend for PostgreSQL
"""

from datetime import datetime
from typing import Any, Optional

_feedback_store: Optional["FeedbackStore"] = None


class FeedbackStore:
    """
    Stores human feedback on AI recommendations.
    Used for model retraining pipeline (DAG 3).
    """

    def __init__(self):
        self._store: dict[str, dict[str, Any]] = {}

    def add(
        self,
        analysis_id: str,
        approved: bool,
        feedback_notes: Optional[str] = None,
        user_id: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> str:
        """Record feedback. Returns feedback_id."""
        from uuid import uuid4
        fid = str(uuid4())
        self._store[fid] = {
            "feedback_id": fid,
            "analysis_id": analysis_id,
            "approved": approved,
            "feedback_notes": feedback_notes,
            "user_id": user_id,
            "metadata": metadata or {},
            "created_at": datetime.utcnow().isoformat(),
        }
        return fid

    def get(self, feedback_id: str) -> Optional[dict[str, Any]]:
        return self._store.get(feedback_id)

    def get_by_analysis(self, analysis_id: str) -> list[dict[str, Any]]:
        return [v for v in self._store.values() if v["analysis_id"] == analysis_id]

    def list_pending_retrain(self, min_count: int = 100) -> list[dict]:
        """Feedback batches ready for retraining."""
        if len(self._store) >= min_count:
            return [{"count": len(self._store), "sample_ids": list(self._store.keys())[:10]}]
        return []


def get_feedback_store() -> FeedbackStore:
    global _feedback_store
    if _feedback_store is None:
        _feedback_store = FeedbackStore()
    return _feedback_store
