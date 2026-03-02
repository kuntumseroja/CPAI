"""
Agent state definitions for LangGraph
State persistence for long-running analysis workflows
"""

from typing import Annotated, Any, Optional, TypedDict

from langgraph.graph.message import add_messages

from capa_ai.models import (
    CAPARecommendation,
    FindingInput,
    RCAResult,
    SimilarityResult,
)


class AgentState(TypedDict, total=False):
    """State passed through the CAPA agent workflow."""
    
    # Input
    finding: FindingInput
    metadata: dict[str, Any]
    
    # Node outputs
    finding_type: Optional[str]
    classification_confidence: float
    retrieved_context: list[dict[str, Any]]
    rca_result: Optional[RCAResult]
    similar_cases: list[dict[str, Any]]
    capa_recommendation: Optional[CAPARecommendation]
    similarity_result: Optional[SimilarityResult]
    
    # Control flow
    confidence_score: float
    requires_human_review: bool
    error: Optional[str]
    
    # XAI
    shap_values: Optional[dict[str, float]]
    citations: list[dict[str, Any]]
    
    # Messages for LLM context
    messages: Annotated[list, add_messages]
