"""
SynapseOS Backend — Pydantic Schemas
=====================================
All request/response models for the FastAPI application.
Types mirror the TypeScript interfaces in src/types/index.ts.
"""

from __future__ import annotations

from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ──────────────────────────────────────────────
# Enums
# ──────────────────────────────────────────────

class InferenceMode(str, Enum):
    STANDARD = "standard"
    TURBO = "turbo"


class ScenarioId(str, Enum):
    CODE_GEN = "code-gen"
    ANALYSIS = "analysis"
    CREATIVE = "creative"


class TabType(str, Enum):
    CODE = "code"
    TERMINAL = "terminal"


# ──────────────────────────────────────────────
# Request Models
# ──────────────────────────────────────────────

class FeatureConfiguration(BaseModel):
    """Represents a single configurable feature flag in SynapseOS."""
    id: str = Field(..., description="Unique feature identifier")
    enabled: bool = Field(..., description="Whether the feature is active")
    priority: int = Field(0, ge=0, le=100, description="Feature priority weight")


class SystemConfigRequest(BaseModel):
    """Payload for toggling system configurations."""
    features: List[FeatureConfiguration] = Field(
        default_factory=list,
        description="List of feature toggles to apply"
    )
    inference_mode: InferenceMode = Field(
        default=InferenceMode.STANDARD,
        description="Inference speed mode"
    )
    max_tokens: int = Field(
        default=4096,
        ge=64,
        le=65536,
        description="Maximum tokens per generation"
    )
    temperature: float = Field(
        default=0.7,
        ge=0.0,
        le=2.0,
        description="Sampling temperature"
    )


class PlaygroundRequest(BaseModel):
    """Payload for the SSE streaming playground endpoint."""
    scenario: ScenarioId = Field(
        ...,
        description="Which pre-defined scenario to simulate"
    )
    custom_prompt: Optional[str] = Field(
        default=None,
        description="Optional user-supplied prompt (overrides scenario prompt)"
    )
    inference_mode: InferenceMode = Field(
        default=InferenceMode.STANDARD,
        description="Inference speed mode — affects streaming delay"
    )
    max_tokens: int = Field(
        default=4096,
        ge=64,
        le=65536,
        description="Maximum tokens per generation"
    )


# ──────────────────────────────────────────────
# Response Models
# ──────────────────────────────────────────────

class HardwareStatus(BaseModel):
    """Snapshot of the simulated hardware / inference engine status."""
    model: str = "Llama-3-70B-AWQ"
    engine: str = "CUDA 12.4"
    vram_total_gb: float = 24.0
    vram_used_gb: float = 18.4
    vram_free_gb: float = 5.6
    cpu_usage_pct: float = 42.7
    gpu_usage_pct: float = 87.3
    active_sessions: int = 1
    uptime_seconds: int = 14523


class SystemConfigResponse(BaseModel):
    """Response after applying feature toggles."""
    status: str = "ok"
    applied_features: List[FeatureConfiguration] = Field(default_factory=list)
    inference_mode: InferenceMode
    max_tokens: int
    temperature: float
    hardware: HardwareStatus


class ScenarioMetadata(BaseModel):
    """Static metadata returned alongside scenario data."""
    id: ScenarioId
    label: str
    prompt: str
    response_steps: List[str] = Field(
        default_factory=list,
        description="Reasoning text steps the model would produce"
    )
    code_snippet: str = ""


# ──────────────────────────────────────────────
# Streaming SSE Chunk Model
# ──────────────────────────────────────────────

class StreamMetric(BaseModel):
    """Real-time generation metrics emitted with each SSE chunk."""
    token_count: int = 0
    characters_streamed: int = 0
    tokens_per_second: float = 0.0
    latency_ms: float = 0.0
    is_complete: bool = False


class StreamChunk(BaseModel):
    """
    A single SSE event payload.
    The `text` field contains the next fragment of the generated response.
    The `metrics` field carries live throughput stats.
    """
    text: str = ""
    metrics: StreamMetric = Field(default_factory=StreamMetric)


class StreamComplete(BaseModel):
    """Final chunk sent when generation finishes."""
    text: str = ""
    metrics: StreamMetric = Field(default_factory=lambda: StreamMetric(is_complete=True))
    total_tokens: int = 0
    total_characters: int = 0
    total_latency_ms: float = 0.0
    avg_tokens_per_second: float = 0.0
