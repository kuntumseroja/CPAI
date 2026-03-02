"""
XAI Explainer - SHAP + Attention Visualization
GxP compliance: All AI outputs have explainability layer
"""

from typing import Optional


class XAIExplainer:
    """
    Explainable AI for CAPA recommendations.
    - SHAP: Feature importance for classification
    - Attention: Highlighted matching text segments
    - Citation tracing: Source document links
    """
    
    def get_feature_importance(
        self,
        input_text: str,
        prediction: str,
        top_k: int = 5,
    ) -> dict[str, float]:
        """
        Get SHAP feature importance for RCA classification.
        Production: Use SHAP TreeExplainer on XGBoost classifier
        Demo: TF-IDF style word importance
        """
        # Demo: Simple word-based importance (replace with SHAP in production)
        words = input_text.lower().split()
        word_scores = {}
        for i, word in enumerate(words):
            if len(word) > 3:  # Skip short words
                # Placeholder: position-weighted (earlier = more important)
                score = 1.0 - (i * 0.05) if i < 10 else 0.5
                word_scores[word] = round(score, 3)
        
        # Sort and return top_k
        sorted_words = sorted(
            word_scores.items(),
            key=lambda x: x[1],
            reverse=True,
        )[:top_k]
        
        return dict(sorted_words)
    
    def get_attention_heatmap(
        self,
        source_text: str,
        query: str,
    ) -> list[dict]:
        """
        Attention visualization for similarity matching.
        Returns highlighted segments with relevance scores.
        """
        # Placeholder: return matching segments
        query_words = set(query.lower().split())
        segments = []
        for i, word in enumerate(source_text.split()):
            if word.lower() in query_words:
                segments.append({
                    "token": word,
                    "position": i,
                    "relevance": 0.9,
                })
        return segments
    
    def trace_citation(
        self,
        recommendation: str,
        sources: list[dict],
    ) -> list[dict]:
        """
        Citation tracing for CAPA recommendations.
        Links each recommendation component to source documents.
        """
        return [
            {
                "source": s.get("content", "")[:100],
                "relevance_score": s.get("relevance", 0.9),
                "document_id": s.get("id", "unknown"),
            }
            for s in sources[:5]
        ]
