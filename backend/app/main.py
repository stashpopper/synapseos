"""
SynapseOS Backend — FastAPI Application
========================================
Core server with CORS middleware, configuration endpoint,
and SSE streaming playground endpoint.
"""

from __future__ import annotations

import json
import os
import time
from contextlib import asynccontextmanager
from typing import AsyncIterator

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException

# Load .env from project root
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env"))
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from .engine import SimulationEngine
from .models import (
    HardwareStatus,
    InferenceMode,
    PlaygroundRequest,
    ScenarioId,
    StreamChunk,
    SystemConfigRequest,
    SystemConfigResponse,
)

# Import forge routes
from .api.forge.analyze import router as forge_analyze_router
from .api.forge.stream import router as forge_stream_router


# ──────────────────────────────────────────────
# Engine Singleton & Lifespan
# ──────────────────────────────────────────────

_engine: SimulationEngine | None = None


def _get_engine() -> SimulationEngine:
    """Lazily initialize the simulation engine."""
    global _engine
    if _engine is None:
        _engine = SimulationEngine()
    return _engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — engine init and shutdown hooks."""
    _engine = SimulationEngine()
    yield
    # Cleanup hooks (if any) go here


# ──────────────────────────────────────────────
# FastAPI App
# ──────────────────────────────────────────────

app = FastAPI(
    title="SynapseOS API",
    description="Inference simulation engine for the SynapseOS React frontend. Includes SynapseForge multi-agent code analysis.",
    version="2.1.0",
    lifespan=lifespan,
)

# ── Forge Routes ──
app.include_router(forge_analyze_router)
app.include_router(forge_stream_router)

# ── CORS — allow frontend domains ──
frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "https://thesynapseos.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────
# Helper: SSE JSON encoder
# ──────────────────────────────────────────────

def _sse_json(chunk: StreamChunk) -> str:
    """
    Serialize a StreamChunk to a SSE-formatted JSON string.
    Format:
        event: message
        data: {"text": "...", "metrics": {...}}

        <blank line>
    """
    data = json.dumps(chunk.model_dump())
    return f"event: message\ndata: {data}\n\n"


# ──────────────────────────────────────────────
# Endpoint: GET /api/status
# ──────────────────────────────────────────────

@app.get("/api/status")
async def get_status():
    """
    Retrieve hardware status logs and engine metadata.
    Returns a full hardware snapshot including VRAM, CPU/GPU usage,
    active sessions, and uptime.
    """
    engine = _get_engine()
    hardware = HardwareStatus(
        vram_used_gb=round(18.4 + (engine._session_count * 0.3), 1),
        active_sessions=engine._session_count,
        uptime_seconds=engine.get_uptime(),
    )
    return {
        "status": "online",
        "version": "2.0.0",
        "engine": "SynapseOS Inference Simulator",
        "hardware": hardware.model_dump(),
    }


# ──────────────────────────────────────────────
# Endpoint: POST /api/config
# ──────────────────────────────────────────────

@app.post("/api/config")
async def update_config(payload: SystemConfigRequest):
    """
    Toggle system configurations and retrieve updated hardware status.
    Accepts feature toggles, inference mode, max tokens, and temperature.
    Returns the applied configuration plus current hardware snapshot.
    """
    engine = _get_engine()
    engine.increment_sessions()

    hardware = HardwareStatus(
        vram_used_gb=round(18.4 + (engine._session_count * 0.3), 1),
        active_sessions=engine._session_count,
        uptime_seconds=engine.get_uptime(),
    )

    return SystemConfigResponse(
        applied_features=payload.features,
        inference_mode=payload.inference_mode,
        max_tokens=payload.max_tokens,
        temperature=payload.temperature,
        hardware=hardware,
    )


# ──────────────────────────────────────────────
# Endpoint: GET /api/scenarios
# ──────────────────────────────────────────────

@app.get("/api/scenarios")
async def list_scenarios():
    """
    Return all available scenario definitions.
    Each scenario includes its id, label, prompt, response steps,
    and code snippet.
    """
    engine = _get_engine()
    return engine.get_all_scenarios()


# ──────────────────────────────────────────────
# Endpoint: POST /api/stream-playground (SSE)
# ──────────────────────────────────────────────

async def _sse_generator(request: PlaygroundRequest) -> AsyncIterator[str]:
    """
    Internal async generator that feeds SSE events to the StreamingResponse.
    Streams character-by-character with real-time metrics.
    """
    engine = _get_engine()
    scenario_id = request.scenario

    # Validate scenario
    if scenario_id not in ScenarioId.__members__:
        raise HTTPException(status_code=400, detail=f"Unknown scenario: {scenario_id}")

    sim_id = ScenarioId(scenario_id)

    async for chunk in engine.stream_response(
        scenario_id=sim_id,
        custom_prompt=request.custom_prompt,
        inference_mode=request.inference_mode,
        max_tokens=request.max_tokens,
    ):
        yield _sse_json(chunk)


@app.post(
    "/api/stream-playground",
    responses={200: {"description": "SSE stream of generated response"}},
)
async def stream_playground(request: PlaygroundRequest):
    """
    Server-Sent Events endpoint for the Playground component.

    Streams the mock response text character-by-character along with
    real-time speed metrics (tokens/sec, latency, token count) as
    standard JSON SSE chunks.

    The frontend consumes this via EventSource (native browser API).
    """
    return StreamingResponse(
        _sse_generator(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ──────────────────────────────────────────────
# Health Check
# ──────────────────────────────────────────────

@app.get("/health")
async def health_check():
    """Simple health check for Docker / orchestrator readiness."""
    return {
        "status": "healthy",
        "service": "synapseos-backend",
        "version": "2.1.0",
        "features": ["simulation", "forge-analysis", "sse-streaming"],
    }
