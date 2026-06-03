"""
SynapseForge — Streaming API Endpoint
=======================================
SSE endpoint for real-time agent progress streaming.
"""

from __future__ import annotations

import asyncio
import json

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from ...forge.analysis import CodeAnalyzer

router = APIRouter(prefix="/api/forge", tags=["SynapseForge"])


class StreamRequest(BaseModel):
    """Request body for streaming analysis."""
    code: str
    language: str = "auto"
    filename: str = "code"
    depth: str = "standard"


async def _stream_analysis(request: StreamRequest):
    """Async generator that yields SSE events from the analysis pipeline."""
    analyzer = CodeAnalyzer()

    # Send initial event
    yield "event: start\ndata: {\"status\": \"started\"}\n\n"

    # Stream through the analysis
    message_count = 0
    async for event_data in analyzer.analyze_stream(
        code=request.code,
        language=request.language,
        filename=request.filename,
        depth=request.depth,
    ):
        yield event_data
        message_count += 1

    # Send completion event
    yield f"event: done\ndata: {{\"message_count\": {message_count}}}\n\n"


@router.post("/stream")
async def stream_analysis(request: StreamRequest):
    """
    Server-Sent Events endpoint for real-time analysis streaming.
    
    Streams agent progress, findings, and final results.
    The frontend consumes this via EventSource.
    """
    return StreamingResponse(
        _stream_analysis(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
