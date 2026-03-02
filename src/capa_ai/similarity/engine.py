"""
Similarity Analysis Engine - FR-SIM-01
Hybrid: SiEBERT (Dense) + BM25 (Sparse) + RRF + Cross-Encoder Reranker
Threshold: >0.85 triggers "Potential Recurrence" alert
"""

import time
from typing import Optional

from capa_ai.models import SimilarCase, SimilarityResult


class SimilarityEngine:
    """
    Hybrid retrieval for duplicate/recurring CAPA detection.
    Production: pgvector + BM25 + RRF + vLLM reranker
    Demo: In-memory with sample embeddings
    """
    
    def __init__(self, threshold: float = 0.85):
        self.threshold = threshold
        self._embedding_model = None
    
    def _get_embedding_model(self):
        """Lazy load embedding model."""
        if self._embedding_model is None:
            try:
                from sentence_transformers import SentenceTransformer  # noqa: F401
                self._embedding_model = SentenceTransformer(
                    "paraphrase-multilingual-MiniLM-L12-v2"
                )
            except ImportError:
                self._embedding_model = None
        return self._embedding_model
    
    def search(
        self,
        query: str,
        top_k: int = 10,
        metadata_filter: Optional[dict] = None,
    ) -> SimilarityResult:
        """
        Search for similar historical cases.
        Returns SimilarityResult with potential recurrences flagged.
        """
        start = time.perf_counter()
        
        # Demo: Return sample similar cases when no vector store
        similar_cases = self._search_demo(query, top_k)
        
        # Flag potential recurrences (>0.85)
        potential_recurrences = [
            c for c in similar_cases
            if c.similarity_score >= self.threshold
        ]
        
        latency_ms = (time.perf_counter() - start) * 1000
        
        return SimilarityResult(
            query_finding=query,
            similar_cases=similar_cases,
            potential_recurrences=potential_recurrences,
            search_latency_ms=latency_ms,
        )
    
    def _search_demo(self, query: str, top_k: int) -> list[SimilarCase]:
        """Demo mode: return sample similar cases."""
        # Sample historical cases for demonstration
        sample_cases = [
            SimilarCase(
                case_id="CAPA-2024-001",
                similarity_score=0.72,
                finding_text="Deviation in batch record documentation",
                resolution_summary="SOP update and training",
                metadata={"department": "QA", "date": "2024-01-15"},
                is_potential_recurrence=False,
            ),
            SimilarCase(
                case_id="CAPA-2024-002",
                similarity_score=0.88,
                finding_text="Calibration overdue for equipment in production line",
                resolution_summary="Preventive maintenance schedule implemented",
                metadata={"department": "Production", "date": "2024-02-01"},
                is_potential_recurrence=True,
            ),
            SimilarCase(
                case_id="CAPA-2023-045",
                similarity_score=0.65,
                finding_text="Temperature excursion during storage",
                resolution_summary="Cold chain monitoring enhanced",
                metadata={"department": "Warehouse", "date": "2023-11-20"},
                is_potential_recurrence=False,
            ),
        ]
        
        # Try real embedding search if model available
        try:
            model = self._get_embedding_model()
            if model:
                query_embedding = model.encode(query)
                # In production: query vector store
                # For demo, return samples with adjusted scores
                pass
        except Exception:
            pass
        
        return sample_cases[:top_k]
