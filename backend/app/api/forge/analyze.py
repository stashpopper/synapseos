"""
SynapseForge — Analysis API Endpoints
=======================================
REST endpoints for submitting code for analysis
and retrieving results.
"""

from __future__ import annotations

import uuid
from typing import Any, Dict

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ...forge.analysis import CodeAnalyzer

router = APIRouter(prefix="/api/forge", tags=["SynapseForge"])

# In-memory storage for analysis results (replace with DB later)
_analysis_store: Dict[str, Dict[str, Any]] = {}


class AnalyzeRequest(BaseModel):
    """Request body for code analysis."""
    code: str
    language: str = "auto"  # "auto" | "python" | "javascript" | etc.
    filename: str = "code"
    depth: str = "standard"  # "quick" | "standard" | "deep"


@router.post("/analyze")
async def analyze_code(request: AnalyzeRequest):
    """
    Submit code for multi-agent analysis.
    
    Returns an analysis_id immediately. Use /stream for real-time
    progress or /results/:id for the complete result.
    """
    try:
        analyzer = CodeAnalyzer()
        result = analyzer.analyze(
            code=request.code,
            language=request.language,
            filename=request.filename,
            depth=request.depth,
        )

        analysis_id = result["analysis_id"]
        _analysis_store[analysis_id] = result

        return {
            "analysis_id": analysis_id,
            "status": "completed",
            "health_score": result.get("health_score", 50),
            "findings_count": len(result.get("all_findings", [])),
            "summary": result.get("summary", ""),
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/results/{analysis_id}")
async def get_results(analysis_id: str):
    """Retrieve completed analysis results."""
    result = _analysis_store.get(analysis_id)
    if not result:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return {
        "analysis_id": analysis_id,
        "health_score": result.get("health_score", 50),
        "summary": result.get("summary", ""),
        "recommendations": result.get("recommendations", []),
        "score_breakdown": result.get("score_breakdown", {}),
        "findings": result.get("all_findings", []),
        "agents": {
            "planner": result.get("planner_result"),
            "reviewer": result.get("reviewer_result"),
            "quality": result.get("quality_result"),
            "security": result.get("security_result"),
            "performance": result.get("performance_result"),
            "synthesizer": result.get("synthesizer_result"),
            "docs": result.get("docs_result"),
        },
    }


@router.get("/history")
async def get_history():
    """List all analysis history."""
    return [
        {
            "analysis_id": aid,
            "health_score": data.get("health_score", 50),
            "findings_count": len(data.get("all_findings", [])),
            "summary": data.get("summary", "")[:100],
        }
        for aid, data in _analysis_store.items()
    ]
