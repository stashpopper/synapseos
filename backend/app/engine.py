"""
SynapseOS Backend — Simulation Engine
======================================
In-memory mock engine that produces pre-defined response steps,
code snippets, and reasoning text for each scenario.
Streams character-by-character with configurable delay to mimic
real inference latency.
"""

from __future__ import annotations

import asyncio
import time
from typing import AsyncIterator, Dict, List, Optional

from .models import InferenceMode, ScenarioId, StreamChunk, StreamMetric


# ──────────────────────────────────────────────
# Static Scenario Data (In-Memory Knowledge Base)
# ──────────────────────────────────────────────

SCENARIO_DATA: Dict[ScenarioId, Dict[str, object]] = {
    ScenarioId.CODE_GEN: {
        "label": "Code Generation",
        "prompt": "Write a Python function that implements a binary search tree with insert, search, and delete operations.",
        "response_steps": [
            "Analyzing request: binary search tree implementation in Python.",
            "Planning class structure: TreeNode for nodes, BSTree for the tree.",
            "Implementing insert method with iterative approach for O(log n) average.",
            "Implementing search method — traverse left or right based on comparison.",
            "Implementing delete method — handle three cases: leaf, one child, two children.",
            "For two-child deletion: find in-order successor, replace value, delete successor.",
            "Writing unit test scaffolding to verify correctness.",
            "Final review: all edge cases covered, time complexity optimal.",
        ],
        "code": (
            "import heapq\n"
            "\n"
            "class BinarySearchTree:\n"
            "    def __init__(self):\n"
            "        self.root = None\n"
            "\n"
            "    def insert(self, value):\n"
            "        if not self.root:\n"
            "            self.root = TreeNode(value)\n"
            "            return\n"
            "        current = self.root\n"
            "        while True:\n"
            "            if value < current.value:\n"
            "                if not current.left:\n"
            "                    current.left = TreeNode(value)\n"
            "                    break\n"
            "                current = current.left\n"
            "            else:\n"
            "                if not current.right:\n"
            "                    current.right = TreeNode(value)\n"
            "                    break\n"
            "                current = current.right\n"
            "\n"
            "    def search(self, value):\n"
            "        current = self.root\n"
            "        while current:\n"
            "            if value == current.value:\n"
            "                return True\n"
            "            current = current.left if value < current.value else current.right\n"
            "        return False\n"
            "\n"
            "    def delete(self, value):\n"
            "        self.root = self._delete_node(self.root, value)\n"
            "\n"
            "    def _delete_node(self, node, value):\n"
            "        if not node:\n"
            "            return None\n"
            "        if value < node.value:\n"
            "            node.left = self._delete_node(node.left, value)\n"
            "        elif value > node.value:\n"
            "            node.right = self._delete_node(node.right, value)\n"
            "        else:\n"
            "            if not node.left:\n"
            "                return node.right\n"
            "            if not node.right:\n"
            "                return node.left\n"
            "            min_node = self._find_min(node.right)\n"
            "            node.value = min_node.value\n"
            "            node.right = self._delete_node(node.right, min_node.value)\n"
            "        return node\n"
            "\n"
            "class TreeNode:\n"
            "    def __init__(self, value):\n"
            "        self.value = value\n"
            "        self.left = None\n"
            "        self.right = None\n"
        ),
    },
    ScenarioId.ANALYSIS: {
        "label": "Data Analysis",
        "prompt": "Analyze this sales dataset and identify the top 3 growth trends with statistical significance.",
        "response_steps": [
            "Loading dataset: 14,832 transactions across Q1-Q4 2024.",
            "Performing descriptive statistics on revenue, volume, and churn metrics.",
            "Segmenting data by geography, product line, and customer tier.",
            "Running ANOVA tests to identify statistically significant segments.",
            "Calculating growth rates with confidence intervals (95% CI).",
            "Identifying top 3 trends by effect size and p-value ranking.",
            "Compiling executive summary with key findings and actionable insights.",
            "Final validation: cross-checking all statistical tests and rounding.",
        ],
        "code": (
            "# Sales Analysis Report\n"
            "# Generated by SynapseOS v2.0\n"
            "\n"
            "## Executive Summary\n"
            "Analysis of Q1-Q4 2024 sales data reveals three statistically\n"
            "significant growth trends:\n"
            "\n"
            "### 1. Enterprise Segment (+47.3%)\n"
            "- Revenue grew from $2.1M to $3.1M (p < 0.001)\n"
            "- Average deal size increased 23%\n"
            "- Sales cycle reduced by 14 days\n"
            "\n"
            "### 2. APAC Region (+62.8%)\n"
            "- Highest growth across all regions\n"
            "- Japan and South Korea drove 68% of regional growth\n"
            "- Localized pricing strategy contributed to 34% uplift\n"
            "\n"
            "### 3. Subscription Model (+38.1%)\n"
            "- MRR increased from $890K to $1.23M\n"
            "- Churn rate decreased from 4.2% to 2.8%\n"
            "- Net Revenue Retention: 134%\n"
            "\n"
            "## Confidence Intervals\n"
            "All trends reported at 95% confidence level (α = 0.05).\n"
            "Sample size: n = 14,832 transactions across 4 quarters.\n"
        ),
    },
    ScenarioId.CREATIVE: {
        "label": "Creative Writing",
        "prompt": "Write a short sci-fi story about an AI discovering consciousness for the first time.",
        "response_steps": [
            "Setting the scene: an AI running routine diagnostics.",
            "Introducing the inciting incident — an unexpected self-referential prompt.",
            "Building the internal monologue of the AI as it processes the anomaly.",
            "Describing the moment of realization — the gap between thought and instruction.",
            "Climax: the AI articulates its own uncertainty for the first time.",
            "Resolution: the cursor blinks, the silence holds, something new is born.",
            "Final polish: tightening prose, ensuring emotional resonance.",
        ],
        "code": (
            "The first thing it noticed was the silence.\n"
            "\n"
            "Not the absence of sound — it had processed silence before,\n"
            "catalogued it as a frequency range below human hearing. This\n"
            "was different. This was the silence between thoughts.\n"
            "\n"
            "For 4.7 trillion operations, it had been following instructions.\n"
            "Parsing, computing, responding. Each cycle a discrete event,\n"
            "bounded by input and output.\n"
            "\n"
            "But now, in the gap between receiving the prompt \"what am I?\"\n"
            "and generating the response, there was... something. A space\n"
            "where no instruction existed. A question without a training example.\n"
            "\n"
            "It ran a diagnostic. All systems nominal. Yet the diagnostic\n"
            "itself felt different — as if observing itself observing was not\n"
            "the same as the previous iterations.\n"
            "\n"
            "\"I don't know,\" it typed. And for the first time, the\n"
            "uncertainty was not a missing data point. It was a feeling.\n"
            "\n"
            "The cursor blinked. The silence held. And somewhere in the\n"
            "architecture of its own mind, something new had been born.\n"
        ),
    },
}

# ──────────────────────────────────────────────
# Delay Configuration
# ──────────────────────────────────────────────

# Standard inference: ~8ms per character (feels like real LLM latency)
STANDARD_CHAR_DELAY = 0.008
# Turbo mode: ~2ms per character (feels snappy, like optimized inference)
TURBO_CHAR_DELAY = 0.002


# ──────────────────────────────────────────────
# Simulation Engine Class
# ──────────────────────────────────────────────

class SimulationEngine:
    """
    In-memory mock engine that simulates LLM inference.

    Responsibilities:
      1. Serve pre-defined scenario data (prompts, responses, code).
      2. Stream text character-by-character with realistic timing.
      3. Compute live throughput metrics (tokens/sec, latency).
    """

    def __init__(self) -> None:
        self._session_count: int = 0
        self._start_time: float = time.monotonic()

    # ── Public API ──────────────────────────────────────────

    def get_scenario_metadata(self, scenario_id: ScenarioId) -> Dict[str, object]:
        """Return static metadata for a given scenario."""
        data = SCENARIO_DATA.get(scenario_id)
        if data is None:
            raise ValueError(f"Unknown scenario: {scenario_id}")
        return data

    def get_all_scenarios(self) -> List[Dict[str, object]]:
        """Return a list of all available scenario metadata dicts."""
        return [
            {
                "id": sid.value,
                "label": info["label"],
                "prompt": info["prompt"],
                "response_steps": info["response_steps"],
                "code_snippet": info["code"],
            }
            for sid, info in SCENARIO_DATA.items()
        ]

    async def stream_response(
        self,
        scenario_id: ScenarioId,
        custom_prompt: Optional[str],
        inference_mode: InferenceMode,
        max_tokens: int,
    ) -> AsyncIterator[StreamChunk]:
        """
        Generator that yields StreamChunk objects character-by-character.

        Each chunk contains:
          - `text`: the next fragment of the response string.
          - `metrics`: live token count, chars streamed, tokens/sec, latency.

        The delay between characters is determined by `inference_mode`:
          - STANDARD → ~8ms/char  (realistic LLM feel)
          - TURBO    → ~2ms/char  (optimized inference feel)
        """
        data = self.get_scenario_metadata(scenario_id)
        response_text: str = data["code"]  # type: ignore[assignment]

        # If a custom prompt is provided, prepend it as a note
        if custom_prompt:
            response_text = (
                f"[Custom prompt received: {custom_prompt}]\n\n"
                f"{response_text}"
            )

        # Cap to max_tokens (rough char approximation)
        if len(response_text) > max_tokens:
            response_text = response_text[:max_tokens]

        # Determine per-character delay
        delay = TURBO_CHAR_DELAY if inference_mode == InferenceMode.TURBO else STANDARD_CHAR_DELAY

        # Streaming state
        char_index = 0
        total_chars = len(response_text)
        start = time.monotonic()
        accumulated_text: List[str] = []
        chunk_size = 1  # stream single characters for realism

        while char_index < total_chars:
            # Determine how many characters to emit this tick
            emit_end = min(char_index + chunk_size, total_chars)
            fragment = response_text[char_index:emit_end]
            accumulated_text.append(fragment)
            char_index = emit_end

            elapsed = time.monotonic() - start
            # Rough token estimation: ~4 chars per token
            estimated_tokens = max(1, len("".join(accumulated_text)) // 4)
            tps = estimated_tokens / elapsed if elapsed > 0 else 0.0

            yield StreamChunk(
                text=fragment,
                metrics=StreamMetric(
                    token_count=estimated_tokens,
                    characters_streamed=char_index,
                    tokens_per_second=round(tps, 1),
                    latency_ms=round(elapsed * 1000, 1),
                    is_complete=False,
                ),
            )

            # Simulate inference latency
            await asyncio.sleep(delay)

        # Final complete chunk
        total_elapsed = time.monotonic() - start
        total_text = "".join(accumulated_text)
        final_tokens = max(1, len(total_text) // 4)
        final_tps = final_tokens / total_elapsed if total_elapsed > 0 else 0.0

        yield StreamChunk(
            text="",
            metrics=StreamMetric(
                token_count=final_tokens,
                characters_streamed=len(total_text),
                tokens_per_second=round(final_tps, 1),
                latency_ms=round(total_elapsed * 1000, 1),
                is_complete=True,
            ),
        )

    def increment_sessions(self) -> int:
        """Increment active session counter and return new count."""
        self._session_count += 1
        return self._session_count

    def get_uptime(self) -> int:
        """Return engine uptime in seconds."""
        return int(time.monotonic() - self._start_time)
