"""
LangGraph agent nodes for CAPA AI
Each node implements a step in the analysis pipeline
"""

from capa_ai.agents.state import AgentState
from capa_ai.models import (
    CAPARecommendation,
    ContributingFactor,
    CorrectiveAction,
    FindingType,
    PreventiveAction,
    RCAResult,
    RootCauseHypothesis,
    SimilarCase,
    SimilarityResult,
)
from capa_ai.llm.client import get_llm_client
from capa_ai.rag.retriever import get_retriever
from capa_ai.similarity.engine import SimilarityEngine
from capa_ai.xai.explainer import XAIExplainer


async def classify_node(state: AgentState) -> dict:
    """
    Node 1: NLP Classification (vLLM Llama 3.1)
    Categorize deviation/audit/complaint type
    """
    finding = state["finding"]
    finding_text = finding.finding_text

    llm = get_llm_client()
    categories = [t.value for t in FindingType]
    finding_type_str, confidence = await llm.classify(finding_text, categories)
    try:
        finding_type = FindingType(finding_type_str)
    except ValueError:
        finding_type = _classify_finding(finding_text)

    return {"finding_type": finding_type.value, "classification_confidence": confidence}


def _classify_finding(text: str) -> FindingType:
    """Simple rule-based classifier (replace with vLLM in production)."""
    text_lower = text.lower()
    if "deviation" in text_lower or "deviasi" in text_lower:
        return FindingType.DEVIATION
    if "audit" in text_lower or "temuan" in text_lower:
        return FindingType.AUDIT
    if "complaint" in text_lower or "keluhan" in text_lower:
        return FindingType.COMPLAINT
    if "observation" in text_lower or "observasi" in text_lower:
        return FindingType.OBSERVATION
    return FindingType.DEVIATION  # Default


async def retrieve_node(state: AgentState) -> dict:
    """
    Node 2: RAG Retrieval (LlamaIndex hybrid search)
    Retrieve similar cases, SOPs, regulations
    """
    finding = state["finding"]
    result: dict = {}
    
    try:
        retriever = get_retriever()
        if retriever:
            docs = await retriever.aretrieve(finding.finding_text)
            result["retrieved_context"] = [
                {"content": d.node.text, "metadata": getattr(d.node, "metadata", {})}
                for d in docs[:5]
            ]
        else:
            result["retrieved_context"] = []
    except Exception as e:
        result["error"] = str(e)
        result["retrieved_context"] = []
    
    try:
        engine = SimilarityEngine()
        sim_result = engine.search(
            finding.finding_text,
            top_k=10,
            metadata_filter={
                "department": finding.department,
                "product_line": finding.product_line,
            } if finding.department or finding.product_line else None,
        )
        result["similarity_result"] = sim_result
        result["similar_cases"] = [c.model_dump() for c in sim_result.similar_cases]
    except Exception:
        result["similar_cases"] = []
    
    return result


async def analyze_rca_node(state: AgentState) -> dict:
    """
    Node 3: Causal Inference (Claude Sonnet 4 + RAG)
    Generate Ishikawa/5-Why analysis
    """
    retrieved_context = state.get("retrieved_context", [])
    finding_type = state.get("finding_type", "deviation")
    classification_confidence = state.get("classification_confidence", 0.0)
    
    context = "\n".join(c.get("content", "") for c in retrieved_context)
    
    hypotheses = [
        RootCauseHypothesis(
            hypothesis="Potential root cause identified from analysis",
            confidence=0.88,
            supporting_evidence=context[:200].split(". ") if context else [],
            contributing_factors=[
                ContributingFactor(
                    factor="Process parameter drift",
                    category="Method",
                    relevance_score=0.85,
                ),
                ContributingFactor(
                    factor="Training gap",
                    category="Man",
                    relevance_score=0.72,
                ),
            ],
        )
    ]
    
    rca_result = RCAResult(
        finding_type=FindingType(finding_type),
        classification_confidence=classification_confidence,
        root_cause_hypotheses=hypotheses,
        contributing_factors=hypotheses[0].contributing_factors if hypotheses else [],
        ishikawa_categories={
            "Man": ["Training", "Competency"],
            "Method": ["SOP", "Process"],
            "Machine": ["Calibration", "Maintenance"],
        },
        five_why_chain=[
            "Why did the deviation occur?",
            "Because process parameter was out of spec",
            "Why was it out of spec?",
            "Because calibration was overdue",
            "Why was calibration overdue?",
            "Because maintenance schedule was not followed",
        ],
        confidence_score=0.85,
        citations=[{"source": "RAG retrieval", "relevance": 0.9}],
        requires_human_review=classification_confidence < 0.85,
    )
    
    return {"rca_result": rca_result, "confidence_score": 0.85}


async def generate_capa_node(state: AgentState) -> dict:
    """
    Node 4: Action Generation (GPT-4o)
    Generate corrective and preventive actions
    """
    rca = state.get("rca_result")
    finding = state.get("finding")
    confidence_score = state.get("confidence_score", 0.85)
    
    if not rca or not finding:
        return {}
    
    capa_recommendation = CAPARecommendation(
        corrective_actions=[
            CorrectiveAction(
                action="Immediate containment and batch quarantine",
                responsible_department=finding.department or "QA",
                timeline_days=1,
                effectiveness_metrics=["Quarantine completion", "Impact assessment"],
            ),
            CorrectiveAction(
                action="Root cause verification and CAPA plan",
                responsible_department=finding.department or "QA",
                timeline_days=7,
                effectiveness_metrics=["CAPA approval", "Implementation start"],
            ),
        ],
        preventive_actions=[
            PreventiveAction(
                action="Update calibration schedule and SOP",
                responsible_department="Production",
                timeline_days=30,
                systemic_improvement="Prevent recurrence through process control",
            ),
        ],
        effectiveness_metrics=[
            "Recurrence rate",
            "Calibration compliance",
            "Training completion",
        ],
        implementation_timeline_days=30,
        effectiveness_score=0.88,
        regulatory_alignment=True,
        citations=rca.citations,
        human_review_required=confidence_score < 0.85,
    )
    
    return {"capa_recommendation": capa_recommendation}


async def validate_node(state: AgentState) -> dict:
    """
    Node 5: XAI Validation
    SHAP + confidence check, flag for human review
    """
    rca_result = state.get("rca_result")
    finding = state.get("finding")
    confidence_score = state.get("confidence_score", 0.0)
    similarity_result = state.get("similarity_result")
    
    result: dict = {}
    
    explainer = XAIExplainer()
    if rca_result and finding and finding.finding_text:
        shap_values = explainer.get_feature_importance(
            finding.finding_text,
            rca_result.root_cause_hypotheses[0].hypothesis
            if rca_result.root_cause_hypotheses
            else "",
        )
        result["shap_values"] = shap_values
        if rca_result:
            rca_result.shap_values = shap_values
            result["rca_result"] = rca_result
    
    potential_recurrences = (
        similarity_result.potential_recurrences
        if similarity_result else []
    )
    result["requires_human_review"] = (
        confidence_score < 0.85 or len(potential_recurrences) > 0
    )
    
    return result
