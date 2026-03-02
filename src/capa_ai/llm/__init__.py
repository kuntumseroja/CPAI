"""
LLM Engine - vLLM, OpenAI, Anthropic
LiteLLM-compatible routing with fallback
"""

from capa_ai.llm.client import LLMClient, get_llm_client

__all__ = ["LLMClient", "get_llm_client"]
