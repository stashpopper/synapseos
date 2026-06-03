"""
SynapseForge — LangGraph State Definitions
============================================
Defines the shared state schema for the multi-agent pipeline.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from operator import add
from typing_extensions import Annotated, TypedDict


class Finding(TypedDict):
    """A single finding from an agent analysis."""
    severity: str  # "critical" | "high" | "medium" | "low"
    category: str  # "security" | "performance" | "quality" | "style" | "architecture"
    title: str
    file: str
    line: Optional[int]
    description: str
    recommendation: str
    code_snippet: Optional[str]
    cwe_id: Optional[str]


class AgentResult(TypedDict):
    """Result from a single agent."""
    agent: str
    status: str  # "running" | "completed" | "error"
    message: str
    findings: List[Finding]
    summary: Optional[str]


class ForgeState(TypedDict):
    """
    Shared state for the multi-agent pipeline.
    
    This state flows through all agents in the LangGraph workflow.
    """
    # Input
    code: str
    language: str
    filename: str
    depth: str  # "quick" | "standard" | "deep"
    
    # Analysis metadata
    analysis_id: str
    file_tree: Optional[str]
    
    # Agent results (accumulated)
    planner_result: Optional[AgentResult]
    reviewer_result: Optional[AgentResult]
    quality_result: Optional[AgentResult]
    security_result: Optional[AgentResult]
    performance_result: Optional[AgentResult]
    synthesizer_result: Optional[AgentResult]
    docs_result: Optional[AgentResult]
    
    # Aggregated
    all_findings: List[Finding]
    health_score: int
    
    # Streaming — use operator.add to merge lists from parallel nodes
    stream_messages: Annotated[List[str], add]
    
    # Final output
    summary: str
    recommendations: List[str]
    score_breakdown: Dict[str, int]
