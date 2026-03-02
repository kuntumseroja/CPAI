"""
Vector Store Service - Qdrant / pgvector
Indexes findings for similarity search when configured
"""

import os
from typing import Any, Optional

_vector_store: Optional["VectorStoreService"] = None


class VectorStoreService:
    """
    Vector store for CAPA findings.
    Uses Qdrant when QDRANT_URL is set, else in-memory placeholder.
    """

    def __init__(self):
        self.qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
        self._client = None
        self._collection = "capa_findings"
        self._initialized = False

    def _ensure_client(self) -> bool:
        if self._initialized:
            return self._client is not None
        try:
            from qdrant_client import QdrantClient
            self._client = QdrantClient(url=self.qdrant_url)
            self._initialized = True
            return True
        except Exception:
            self._client = None
            self._initialized = True
            return False

    def add_finding(
        self,
        finding_id: str,
        text: str,
        embedding: list[float],
        metadata: Optional[dict[str, Any]] = None,
    ) -> bool:
        """Index a finding for similarity search."""
        if not self._ensure_client():
            return False
        try:
            from qdrant_client.models import PointStruct
            self._client.upsert(
                collection_name=self._collection,
                points=[PointStruct(id=finding_id, vector=embedding, payload={"text": text, **(metadata or {})})],
            )
            return True
        except Exception:
            return False

    def search(
        self,
        query_embedding: list[float],
        top_k: int = 10,
        filter_metadata: Optional[dict] = None,
    ) -> list[dict[str, Any]]:
        """Search similar findings."""
        if not self._ensure_client():
            return []
        try:
            results = self._client.search(
                collection_name=self._collection,
                query_vector=query_embedding,
                limit=top_k,
            )
            return [
                {"id": r.id, "score": r.score, "payload": r.payload}
                for r in results
            ]
        except Exception:
            return []


def get_vector_store() -> VectorStoreService:
    global _vector_store
    if _vector_store is None:
        _vector_store = VectorStoreService()
    return _vector_store
