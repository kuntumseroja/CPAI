"""
CAPA Agent - LangGraph State Machine
Implements FR-RCA-01, FR-CAPA-01 from PRD

Agent Flow:
  classify → retrieve → analyze (RCA) → generate (CAPA) → validate → human_review
"""

import asyncio
from typing import Literal

from langgraph.graph import END, StateGraph

from capa_ai.agents.state import AgentState
from capa_ai.agents.nodes import (
    classify_node,
    retrieve_node,
    analyze_rca_node,
    generate_capa_node,
    validate_node,
)


def create_capa_agent(checkpointer=None) -> StateGraph:
    """
    Create the CAPA agent graph.
    
    Nodes:
      - classify: NLP Classification (vLLM) → Categorize finding type
      - retrieve: RAG retrieval → Similar cases, SOPs, regulations
      - analyze: Causal Inference (Claude + RAG) → Ishikawa/5-Why
      - generate: Action Generation (GPT-4o) → CAPA recommendations
      - validate: XAI validation → Confidence check, SHAP
    """
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("classify", classify_node)
    workflow.add_node("retrieve", retrieve_node)
    workflow.add_node("analyze", analyze_rca_node)
    workflow.add_node("generate", generate_capa_node)
    workflow.add_node("validate", validate_node)
    
    # Define edges
    workflow.set_entry_point("classify")
    workflow.add_edge("classify", "retrieve")
    workflow.add_edge("retrieve", "analyze")
    workflow.add_edge("analyze", "generate")
    workflow.add_edge("generate", "validate")
    
    def route_after_validate(state: AgentState) -> Literal["human_review", "__end__"]:
        """Route to human review if confidence is low."""
        requires_review = state.get("requires_human_review", False)
        confidence = state.get("confidence_score", 0)
        if requires_review or confidence < 0.85:
            return "human_review"
        return "__end__"
    
    workflow.add_conditional_edges("validate", route_after_validate)
    workflow.add_node("human_review", lambda s: {})  # Placeholder - queues for HITL
    workflow.add_edge("human_review", END)
    
    # Compile with optional checkpointer for state persistence
    return workflow.compile(checkpointer=checkpointer)


class CAPAAgent:
    """
    CAPA Agent orchestrator.
    Wraps the LangGraph workflow with convenience methods.
    """
    
    def __init__(self, use_checkpointer: bool = False):
        checkpointer = None
        if use_checkpointer:
            # PostgreSQL checkpointer for production
            # PostgresSaver.from_conn_string(settings.database_url)
            pass
        
        self.graph = create_capa_agent(checkpointer)
    
    async def analyze(self, state: AgentState) -> AgentState:
        """Run full analysis workflow."""
        config = {"configurable": {"thread_id": "default"}}
        result = await self.graph.ainvoke(state, config=config)
        return result
    
    def analyze_sync(self, state: AgentState) -> AgentState:
        """Synchronous analysis (for testing)."""
        return asyncio.run(self.analyze(state))
