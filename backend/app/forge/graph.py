"""
SynapseForge — LangGraph Workflow Definition
==============================================
Defines the multi-agent pipeline as a LangGraph state machine.

Workflow:
    Planner → [Reviewer, Security, Performance] → Synthesizer → Docs

The reviewer, security, and performance agents run in parallel
after the planner creates the analysis plan.
"""

from __future__ import annotations

from langgraph.graph import END, START, StateGraph

from .states import ForgeState
from .nodes import (
    docs_node,
    performance_node,
    planner_node,
    quality_node,
    reviewer_node,
    security_node,
    synthesizer_node,
)


def build_forge_workflow():
    """
    Build and compile the Forge multi-agent workflow.
    
    Graph structure:
        START → planner → reviewer → synthesizer → docs → END
                          ↘ security → synthesizer
                          ↘ performance → synthesizer
    
    The three analysis agents (reviewer, security, performance)
    run in parallel after the planner completes.
    """
    graph = StateGraph(ForgeState)

    # Add nodes
    graph.add_node("planner", planner_node)
    graph.add_node("reviewer", reviewer_node)
    graph.add_node("security", security_node)
    graph.add_node("performance", performance_node)
    graph.add_node("quality", quality_node)
    graph.add_node("synthesizer", synthesizer_node)
    graph.add_node("docs", docs_node)

    # Define edges
    graph.add_edge(START, "planner")

    # After planner, run all analysis agents in parallel
    graph.add_edge("planner", "reviewer")
    graph.add_edge("planner", "security")
    graph.add_edge("planner", "performance")
    graph.add_edge("planner", "quality")

    # All four converge to synthesizer
    graph.add_edge("reviewer", "synthesizer")
    graph.add_edge("security", "synthesizer")
    graph.add_edge("performance", "synthesizer")
    graph.add_edge("quality", "synthesizer")

    # Synthesizer → docs → END
    graph.add_edge("synthesizer", "docs")
    graph.add_edge("docs", END)

    return graph.compile()


def get_forge_graph():
    """
    Factory function that returns the compiled LangGraph.
    Called by the API layer to execute analyses.
    Cached to avoid recompilation.
    """
    if not hasattr(get_forge_graph, "_cached"):
        get_forge_graph._cached = build_forge_workflow()
    return get_forge_graph._cached
