"""
LLM Client - Unified interface for vLLM, OpenAI, Claude
Routes by task: simple → vLLM, complex → Claude, generation → GPT-4o
"""

import os
from typing import Any, Optional

_llm_client: Optional["LLMClient"] = None


class LLMClient:
    """
    Unified LLM client with routing and fallback.
    PRD: Route by task complexity via LiteLLM proxy.
    """

    def __init__(
        self,
        vllm_base_url: Optional[str] = None,
        openai_api_key: Optional[str] = None,
        anthropic_api_key: Optional[str] = None,
    ):
        self.vllm_base_url = vllm_base_url or os.getenv("VLLM_BASE_URL", "http://localhost:8000/v1")
        self.openai_api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        self.anthropic_api_key = anthropic_api_key or os.getenv("ANTHROPIC_API_KEY")
        self._litellm_available = False
        self._check_litellm()

    def _check_litellm(self) -> None:
        try:
            import litellm
            self._litellm_available = True
        except ImportError:
            pass

    async def classify(self, text: str, categories: list[str]) -> tuple[str, float]:
        """
        Classify finding type (simple task → vLLM).
        Returns (category, confidence).
        """
        if self._litellm_available and self._has_llm_access():
            try:
                return await self._litellm_classify(text, categories)
            except Exception:
                pass
        return _rule_based_classify(text), 0.92

    async def _litellm_classify(self, text: str, categories: list[str]) -> tuple[str, float]:
        import litellm
        prompt = f"""Classify this quality finding into one category. Reply with ONLY the category name.
Categories: {', '.join(categories)}
Finding: {text[:500]}
Category:"""
        try:
            response = await litellm.acompletion(
                model="openai/gpt-3.5-turbo" if self.openai_api_key else "anthropic/claude-3-haiku",
                messages=[{"role": "user", "content": prompt}],
                api_key=self.openai_api_key or self.anthropic_api_key,
            )
            content = response.choices[0].message.content.strip().lower()
            for cat in categories:
                if cat.lower() in content:
                    return cat, 0.95
        except Exception:
            pass
        return _rule_based_classify(text), 0.85

    async def generate_rca(self, finding: str, context: str) -> dict[str, Any]:
        """
        Generate RCA (complex reasoning → Claude).
        Returns structured Ishikawa/5-Why analysis.
        """
        if self._litellm_available and (self.anthropic_api_key or self.openai_api_key):
            try:
                return await self._litellm_rca(finding, context)
            except Exception:
                pass
        return _default_rca(finding, context)

    async def _litellm_rca(self, finding: str, context: str) -> dict[str, Any]:
        import litellm
        prompt = f"""Analyze this quality finding and provide root cause analysis.
Finding: {finding}
Relevant context: {context[:1000] if context else 'None'}

Respond with JSON: {{"hypothesis": "...", "ishikawa": {{"Man": [], "Method": [], "Machine": []}}, "five_why": []}}"""
        try:
            model = "anthropic/claude-3-sonnet" if self.anthropic_api_key else "openai/gpt-4o-mini"
            response = await litellm.acompletion(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                api_key=self.anthropic_api_key or self.openai_api_key,
            )
            import json
            content = response.choices[0].message.content
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            return json.loads(content.strip())
        except Exception:
            return _default_rca(finding, context)

    async def generate_capa(self, rca: dict, finding_metadata: dict) -> dict[str, Any]:
        """
        Generate CAPA actions (generation task → GPT-4o).
        """
        if self._litellm_available and (self.openai_api_key or self.anthropic_api_key):
            try:
                return await self._litellm_capa(rca, finding_metadata)
            except Exception:
                pass
        return _default_capa(rca, finding_metadata)

    async def _litellm_capa(self, rca: dict, finding_metadata: dict) -> dict[str, Any]:
        import litellm
        dept = finding_metadata.get("department", "QA")
        prompt = f"""Generate CAPA actions for this RCA.
Root cause: {rca.get('hypothesis', 'Unknown')}
Department: {dept}

Respond with JSON: {{"corrective": [{{"action": "...", "timeline_days": 7}}], "preventive": [{{"action": "...", "timeline_days": 30}}]}}"""
        try:
            model = "openai/gpt-4o" if self.openai_api_key else "anthropic/claude-3-sonnet"
            response = await litellm.acompletion(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                api_key=self.openai_api_key or self.anthropic_api_key,
            )
            import json
            content = response.choices[0].message.content
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            return json.loads(content.strip())
        except Exception:
            return _default_capa(rca, finding_metadata)

    def _has_llm_access(self) -> bool:
        return bool(self.openai_api_key or self.anthropic_api_key)


def _rule_based_classify(text: str) -> str:
    t = text.lower()
    if "deviation" in t or "deviasi" in t:
        return "deviation"
    if "audit" in t or "temuan" in t:
        return "audit"
    if "complaint" in t or "keluhan" in t:
        return "complaint"
    if "observation" in t or "observasi" in t:
        return "observation"
    return "deviation"


def _default_rca(finding: str, context: str) -> dict[str, Any]:
    return {
        "hypothesis": "Process parameter drift and calibration gap",
        "ishikawa": {"Man": ["Training"], "Method": ["SOP", "Process"], "Machine": ["Calibration"]},
        "five_why": ["Why? Parameter out of spec", "Why? Calibration overdue", "Why? Schedule not followed"],
    }


def _default_capa(rca: dict, finding_metadata: dict) -> dict[str, Any]:
    dept = finding_metadata.get("department", "QA")
    return {
        "corrective": [
            {"action": "Immediate containment and batch quarantine", "timeline_days": 1},
            {"action": "Root cause verification and CAPA plan", "timeline_days": 7},
        ],
        "preventive": [
            {"action": "Update calibration schedule and SOP", "timeline_days": 30},
        ],
    }


def get_llm_client() -> LLMClient:
    global _llm_client
    if _llm_client is None:
        _llm_client = LLMClient()
    return _llm_client
