"""
SynapseForge — Analysis Orchestration
=======================================
High-level interface for running code analyses through
the multi-agent pipeline. Handles state initialization,
execution, and result formatting.
"""

from __future__ import annotations

import uuid
from typing import Any, AsyncIterator, Dict, List, Optional

from .graph import get_forge_graph
from .tools import detect_language


class CodeAnalyzer:
    """
    Orchestrates code analysis through the LangGraph multi-agent pipeline.
    
    Usage:
        analyzer = CodeAnalyzer()
        result = analyzer.analyze(code="print('hello')", language="python")
    """

    def __init__(self):
        self._graph = None

    def _get_graph(self):
        if self._graph is None:
            self._graph = get_forge_graph()
        return self._graph

    def analyze(
        self,
        code: str,
        language: Optional[str] = None,
        filename: str = "code",
        depth: str = "standard",
    ) -> Dict[str, Any]:
        """
        Run a complete analysis on the given code.
        
        Args:
            code: The source code to analyze
            language: Programming language (auto-detected if not provided)
            filename: Name of the file (for reporting)
            depth: Analysis depth — "quick", "standard", or "deep"
        
        Returns:
            Complete analysis result dict
        """
        if language is None or language == "auto":
            language = detect_language(code)

        analysis_id = f"ana_{uuid.uuid4().hex[:8]}"

        # Initialize state
        initial_state = {
            "code": code,
            "language": language,
            "filename": filename,
            "depth": depth,
            "analysis_id": analysis_id,
            "file_tree": None,
            "planner_result": None,
            "reviewer_result": None,
            "security_result": None,
            "performance_result": None,
            "synthesizer_result": None,
            "docs_result": None,
            "all_findings": [],
            "health_score": 50,
            "stream_messages": [],
            "summary": "",
            "recommendations": [],
            "score_breakdown": {"security": 50, "quality": 50, "performance": 50},
        }

        # Run the graph
        graph = self._get_graph()
        result = graph.invoke(initial_state)

        return result

    async def analyze_stream(
        self,
        code: str,
        language: Optional[str] = None,
        filename: str = "code",
        depth: str = "standard",
    ) -> AsyncIterator[str]:
        """
        Run analysis and yield streaming messages.
        
        This generator yields SSE-formatted messages as each agent
        completes its work.
        """
        if language is None or language == "auto":
            language = detect_language(code)

        analysis_id = f"ana_{uuid.uuid4().hex[:8]}"

        initial_state = {
            "code": code,
            "language": language,
            "filename": filename,
            "depth": depth,
            "analysis_id": analysis_id,
            "file_tree": None,
            "planner_result": None,
            "reviewer_result": None,
            "security_result": None,
            "performance_result": None,
            "synthesizer_result": None,
            "docs_result": None,
            "all_findings": [],
            "health_score": 50,
            "stream_messages": [],
            "summary": "",
            "recommendations": [],
            "score_breakdown": {"security": 50, "quality": 50, "performance": 50},
        }

        graph = self._get_graph()

        # Stream the graph execution
        async for event in graph.astream(initial_state, stream_mode="updates"):
            for node_name, updates in event.items():
                messages = updates.get("stream_messages", [])
                for msg in messages:
                    yield f"event: message\ndata: {msg}\n\n"

        # Final result
        final_state = graph.invoke(initial_state)
        final_data = {
            "analysis_id": analysis_id,
            "health_score": final_state.get("health_score", 50),
            "summary": final_state.get("summary", ""),
            "recommendations": final_state.get("recommendations", []),
            "score_breakdown": final_state.get("score_breakdown", {}),
            "findings": final_state.get("all_findings", []),
        }
        yield f"event: complete\ndata: {final_data}\n\n"
