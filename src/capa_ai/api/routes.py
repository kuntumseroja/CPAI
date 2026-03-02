"""
API Routes - Kong-compatible
PRD-based endpoints
"""

from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from capa_ai.models import (
    AnalysisRequest,
    AnalysisResult,
    FindingInput,
    SimilarityResult,
)
from capa_ai.agents.capa_agent import CAPAAgent
from capa_ai.agents.state import AgentState
from capa_ai.similarity.engine import SimilarityEngine
from capa_ai.feedback.store import get_feedback_store
from capa_ai import functions

router = APIRouter(prefix="/v1", tags=["CAPA AI"])
_agent = None
_similarity_engine = None


def get_agent() -> CAPAAgent:
    global _agent
    if _agent is None:
        _agent = CAPAAgent()
    return _agent


def get_similarity_engine() -> SimilarityEngine:
    global _similarity_engine
    if _similarity_engine is None:
        _similarity_engine = SimilarityEngine()
    return _similarity_engine


@router.post("/findings", response_model=AnalysisResult)
async def submit_finding(request: AnalysisRequest):
    """
    Submit finding for AI analysis.
    Triggers full pipeline: RCA → Similarity → CAPA Recommendation
    """
    agent = get_agent()
    
    initial_state: AgentState = {
        "finding": request.finding,
        "metadata": request.finding.metadata or {},
    }
    
    try:
        result_state = await agent.analyze(initial_state)
        
        return AnalysisResult(
            finding_id=None,
            rca=result_state.get("rca_result"),
            similarity=result_state.get("similarity_result"),
            capa_recommendation=result_state.get("capa_recommendation"),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analysis/{analysis_id}")
async def get_analysis(analysis_id: str):
    """Retrieve AI analysis by ID (placeholder for persistence)."""
    return {"id": analysis_id, "status": "Analysis retrieval requires persistence layer"}


@router.post("/similarity", response_model=SimilarityResult)
async def similarity_search(finding: FindingInput):
    """
    Similarity search for duplicate/recurring detection.
    >0.85 similarity triggers Potential Recurrence alert.
    """
    engine = get_similarity_engine()
    return engine.search(
        finding.finding_text,
        top_k=10,
        metadata_filter={
            "department": finding.department,
            "product_line": finding.product_line,
        } if finding.department or finding.product_line else None,
    )


@router.post("/feedback")
async def submit_feedback(
    analysis_id: str,
    approved: bool,
    feedback_notes: Optional[str] = None,
    user_id: Optional[str] = None,
):
    """
    Human feedback for AI recommendations.
    Triggers retraining pipeline when sufficient data collected.
    """
    store = get_feedback_store()
    feedback_id = store.add(
        analysis_id=analysis_id,
        approved=approved,
        feedback_notes=feedback_notes,
        user_id=user_id,
    )
    return {
        "feedback_id": feedback_id,
        "analysis_id": analysis_id,
        "approved": approved,
        "message": "Feedback recorded for model improvement",
    }


@router.get("/health")
async def health_check():
    """Health check for load balancer."""
    return {"status": "healthy", "service": "CAPA AI"}


# --- PRD-based function endpoints ---


class TopicClusteringRequest(BaseModel):
    """FR-TREND-01: Topic clustering input."""
    documents: list[str] = Field(..., min_length=1)


@router.post("/trends/cluster")
async def topic_clustering_endpoint(req: TopicClusteringRequest):
    """FR-TREND-01: BERTopic pipeline for topic clustering."""
    return functions.topic_clustering(req.documents)


class ImpactScoreRequest(BaseModel):
    """Impact scoring input."""
    finding_severity: str = Field(default="medium")
    recurrence_count: int = Field(default=0, ge=0)
    department_risk: float = Field(default=0.5, ge=0, le=1)


@router.post("/impact-score")
async def impact_score(req: ImpactScoreRequest):
    """ML Platform: XGBoost-based impact scoring."""
    return {"impact_score": functions.impact_scoring(
        req.finding_severity,
        req.recurrence_count,
        req.department_risk,
    )}


class DriftDetectionRequest(BaseModel):
    """Drift detection input."""
    current_distribution: dict[str, float]
    baseline_distribution: dict[str, float]
    threshold: float = Field(default=0.1, ge=0, le=1)


@router.post("/drift-detection")
async def drift_detection_endpoint(req: DriftDetectionRequest):
    """ML Platform: Model drift detection."""
    detected, affected = functions.drift_detection(
        req.current_distribution,
        req.baseline_distribution,
        req.threshold,
    )
    return {"drift_detected": detected, "affected_features": affected}


class AuditLogRequest(BaseModel):
    """ALCOA+ audit log input."""
    action: str
    entity_type: str
    entity_id: str
    user_id: Optional[str] = None
    payload: Optional[dict] = None


@router.post("/audit-log")
async def create_audit_log(req: AuditLogRequest):
    """GxP: Create immutable audit trail entry (ALCOA+)."""
    return functions.create_audit_log_entry(
        action=req.action,
        entity_type=req.entity_type,
        entity_id=req.entity_id,
        user_id=req.user_id,
        payload=req.payload,
    )


@router.get("/xai/feature-importance")
async def xai_feature_importance(
    input_text: str,
    prediction: str,
    top_k: int = 5,
):
    """XAI: SHAP feature importance for classification."""
    return functions.get_feature_importance(input_text, prediction, top_k)
