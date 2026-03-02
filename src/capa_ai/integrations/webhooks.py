"""
Webhook connectors for Q100+, Bizzmine
PRD 4.1: REST API triggers on finding close / real-time
"""

from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from pydantic import BaseModel, Field

from capa_ai.agents import CAPAAgent
from capa_ai.agents.state import AgentState
from capa_ai.models import FindingInput, AnalysisResult
from capa_ai.integrations.outbound import push_to_q100, push_to_bizzmine

router = APIRouter(prefix="/webhooks", tags=["Integrations"])

_agent: Optional[CAPAAgent] = None


def get_agent() -> CAPAAgent:
    global _agent
    if _agent is None:
        _agent = CAPAAgent()
    return _agent


class Q100WebhookPayload(BaseModel):
    """Q100+ webhook on finding close."""
    finding_id: str
    finding_text: str = Field(..., min_length=10)
    source: str = "Q100"
    department: Optional[str] = None
    product_line: Optional[str] = None
    closed_at: Optional[str] = None
    metadata: Optional[dict[str, Any]] = None


class BizzmineWebhookPayload(BaseModel):
    """Bizzmine webhook for deviation/complaint."""
    record_id: str
    finding_text: str = Field(..., min_length=10)
    record_type: str = Field(..., pattern="^(deviation|complaint)$")
    department: Optional[str] = None
    product_line: Optional[str] = None
    metadata: Optional[dict[str, Any]] = None


async def _run_analysis_and_callback(
    finding: FindingInput,
    callback_url: Optional[str],
    callback_system: str,
) -> AnalysisResult:
    """Run CAPA analysis and push results back to source system."""
    agent = get_agent()
    state: AgentState = {"finding": finding, "metadata": finding.metadata or {}}
    result_state = await agent.analyze(state)

    result = AnalysisResult(
        finding_id=finding.metadata.get("source_id") if finding.metadata else None,
        rca=result_state.get("rca_result"),
        similarity=result_state.get("similarity_result"),
        capa_recommendation=result_state.get("capa_recommendation"),
    )

    if callback_url:
        if callback_system == "q100":
            push_to_q100(callback_url, result)
        elif callback_system == "bizzmine":
            push_to_bizzmine(callback_url, result)

    return result


@router.post("/q100")
async def q100_webhook(
    payload: Q100WebhookPayload,
    request: Request,
    background_tasks: BackgroundTasks,
):
    """
    Q100+ webhook: Trigger on finding close.
    Runs RCA and optionally pushes suggestions back to Q100+.
    """
    finding = FindingInput(
        finding_text=payload.finding_text,
        source="Q100+",
        department=payload.department,
        product_line=payload.product_line,
        metadata={
            "finding_id": payload.finding_id,
            "closed_at": payload.closed_at,
            **(payload.metadata or {}),
        },
    )

    callback_url = request.headers.get("X-Callback-URL")
    if callback_url:
        background_tasks.add_task(
            _run_analysis_and_callback,
            finding,
            callback_url,
            "q100",
        )
        return {"status": "accepted", "message": "Analysis queued, results will be pushed to callback URL"}
    else:
        result = await _run_analysis_and_callback(finding, None, "q100")
        return result.model_dump()


@router.post("/bizzmine")
async def bizzmine_webhook(
    payload: BizzmineWebhookPayload,
    request: Request,
    background_tasks: BackgroundTasks,
):
    """
    Bizzmine webhook: Real-time deviation/complaint.
    Bidirectional sync - analysis and pattern feedback.
    """
    finding = FindingInput(
        finding_text=payload.finding_text,
        source=f"Bizzmine-{payload.record_type}",
        department=payload.department,
        product_line=payload.product_line,
        metadata={
            "record_id": payload.record_id,
            "record_type": payload.record_type,
            **(payload.metadata or {}),
        },
    )

    callback_url = request.headers.get("X-Callback-URL")
    if callback_url:
        background_tasks.add_task(
            _run_analysis_and_callback,
            finding,
            callback_url,
            "bizzmine",
        )
        return {"status": "accepted", "message": "Analysis queued"}
    else:
        result = await _run_analysis_and_callback(finding, None, "bizzmine")
        return result.model_dump()


@router.get("/health")
async def webhooks_health():
    """Health check for webhook endpoints."""
    return {"status": "ok", "webhooks": ["q100", "bizzmine"]}
