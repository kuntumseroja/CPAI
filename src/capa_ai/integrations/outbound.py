"""
Outbound API calls to Q100+, Bizzmine
Push RCA suggestions and CAPA recommendations back
"""

from typing import Optional

import httpx

from capa_ai.models import AnalysisResult


def push_to_q100(base_url: str, result: AnalysisResult) -> bool:
    """
    Push RCA suggestions to Q100+.
    POST to {base_url}/api/capa-suggestions
    """
    try:
        payload = {
            "rca": result.rca.model_dump() if result.rca else None,
            "capa_recommendation": result.capa_recommendation.model_dump() if result.capa_recommendation else None,
            "finding_id": result.finding_id,
        }
        with httpx.Client(timeout=30) as client:
            resp = client.post(f"{base_url.rstrip('/')}/api/capa-suggestions", json=payload)
            return resp.is_success
    except Exception:
        return False


def push_to_bizzmine(base_url: str, result: AnalysisResult) -> bool:
    """
    Push pattern analysis and CAPA to Bizzmine.
    POST to {base_url}/api/capa-ai/analysis
    """
    try:
        payload = {
            "rca": result.rca.model_dump() if result.rca else None,
            "similarity": result.similarity.model_dump() if result.similarity else None,
            "capa_recommendation": result.capa_recommendation.model_dump() if result.capa_recommendation else None,
        }
        with httpx.Client(timeout=30) as client:
            resp = client.post(f"{base_url.rstrip('/')}/api/capa-ai/analysis", json=payload)
            return resp.is_success
    except Exception:
        return False
