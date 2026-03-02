"""
Pydantic models for CAPA AI
GxP-compliant data structures with validation
"""

from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


class FindingType(str, Enum):
    """Classification of quality findings."""
    DEVIATION = "deviation"
    AUDIT = "audit"
    COMPLAINT = "complaint"
    OBSERVATION = "observation"
    OTHER = "other"


class FindingInput(BaseModel):
    """Input for RCA and CAPA analysis."""
    finding_text: str = Field(..., min_length=10, description="Description of the finding")
    source: Optional[str] = Field(None, description="Source system: Q100+, Bizzmine, etc.")
    department: Optional[str] = Field(None, description="Responsible department")
    product_line: Optional[str] = Field(None, description="Affected product line")
    metadata: Optional[dict[str, Any]] = Field(default_factory=dict)


class ContributingFactor(BaseModel):
    """A contributing factor in root cause analysis."""
    factor: str
    category: str  # 5M1E: Man, Machine, Method, Material, Measurement, Environment
    relevance_score: float = Field(ge=0, le=1)


class RootCauseHypothesis(BaseModel):
    """Root cause hypothesis from AI analysis."""
    hypothesis: str
    confidence: float = Field(ge=0, le=1)
    supporting_evidence: list[str] = Field(default_factory=list)
    contributing_factors: list[ContributingFactor] = Field(default_factory=list)


class RCAResult(BaseModel):
    """Structured Root Cause Analysis output."""
    finding_type: FindingType
    classification_confidence: float = Field(ge=0, le=1)
    root_cause_hypotheses: list[RootCauseHypothesis] = Field(default_factory=list)
    contributing_factors: list[ContributingFactor] = Field(default_factory=list)
    ishikawa_categories: Optional[dict[str, list[str]]] = None
    five_why_chain: Optional[list[str]] = None
    confidence_score: float = Field(ge=0, le=1)
    citations: list[dict[str, Any]] = Field(default_factory=list)
    shap_values: Optional[dict[str, float]] = Field(None, description="XAI: feature importance")
    requires_human_review: bool = False


class CorrectiveAction(BaseModel):
    """Immediate corrective action."""
    action: str
    responsible_department: str
    timeline_days: int
    effectiveness_metrics: list[str] = Field(default_factory=list)


class PreventiveAction(BaseModel):
    """Systemic preventive action."""
    action: str
    responsible_department: str
    timeline_days: int
    systemic_improvement: str


class CAPARecommendation(BaseModel):
    """AI-generated CAPA recommendation."""
    corrective_actions: list[CorrectiveAction] = Field(default_factory=list)
    preventive_actions: list[PreventiveAction] = Field(default_factory=list)
    effectiveness_metrics: list[str] = Field(default_factory=list)
    implementation_timeline_days: int = 30
    effectiveness_score: float = Field(ge=0, le=1)
    regulatory_alignment: bool = True
    citations: list[dict[str, Any]] = Field(default_factory=list)
    human_review_required: bool = False


class SimilarCase(BaseModel):
    """Similar historical case from retrieval."""
    case_id: str
    similarity_score: float = Field(ge=0, le=1)
    finding_text: str
    resolution_summary: Optional[str] = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    is_potential_recurrence: bool = False


class SimilarityResult(BaseModel):
    """Similarity search result."""
    query_finding: str
    similar_cases: list[SimilarCase] = Field(default_factory=list)
    potential_recurrences: list[SimilarCase] = Field(default_factory=list)
    search_latency_ms: float = 0.0


class AnalysisRequest(BaseModel):
    """Full analysis request."""
    finding: FindingInput
    include_similarity: bool = True
    include_capa_recommendation: bool = True


class AnalysisResult(BaseModel):
    """Complete analysis result."""
    finding_id: Optional[str] = None
    rca: Optional[RCAResult] = None
    similarity: Optional[SimilarityResult] = None
    capa_recommendation: Optional[CAPARecommendation] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
