# Graph Report - backend  (2026-06-02)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 77 nodes · 197 edges · 14 communities (9 shown, 5 thin omitted)
- Extraction: 61% EXTRACTED · 39% INFERRED · 0% AMBIGUOUS · INFERRED: 76 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]

## God Nodes (most connected - your core abstractions)
1. `SimulationEngine` - 20 edges
2. `ScenarioId` - 19 edges
3. `InferenceMode` - 18 edges
4. `StreamChunk` - 18 edges
5. `HardwareStatus` - 12 edges
6. `StreamMetric` - 12 edges
7. `SystemConfigResponse` - 11 edges
8. `SimulationEngine` - 10 edges
9. `FastAPI` - 10 edges
10. `str` - 10 edges

## Surprising Connections (you probably didn't know these)
- `SimulationEngine` --uses--> `InferenceMode`  [INFERRED]
  app/engine.py → app/models.py
- `SimulationEngine` --uses--> `ScenarioId`  [INFERRED]
  app/engine.py → app/models.py
- `SimulationEngine` --uses--> `StreamChunk`  [INFERRED]
  app/engine.py → app/models.py
- `SimulationEngine` --uses--> `StreamMetric`  [INFERRED]
  app/engine.py → app/models.py
- `str` --uses--> `SimulationEngine`  [INFERRED]
  app/main.py → app/engine.py

## Import Cycles
- 1-file cycle: `app/main.py -> app/main.py`

## Communities (14 total, 5 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.26
Nodes (16): str, StreamChunk, SynapseOS Backend — Simulation Engine ====================================== In-, Return static metadata for a given scenario., Generator that yields StreamChunk objects character-by-character.          Each, InferenceMode, Real-time generation metrics emitted with each SSE chunk., A single SSE event payload.     The `text` field contains the next fragment of t (+8 more)

### Community 1 - "Community 1"
Cohesion: 0.24
Nodes (10): FeatureConfiguration, SynapseOS Backend — Pydantic Schemas ===================================== All r, Static metadata returned alongside scenario data., Final chunk sent when generation finishes., Represents a single configurable feature flag in SynapseOS., ScenarioMetadata, StreamComplete, TabType (+2 more)

### Community 2 - "Community 2"
Cohesion: 0.22
Nodes (5): In-memory mock engine that simulates LLM inference.      Responsibilities:, Return a list of all available scenario metadata dicts., Increment active session counter and return new count., Return engine uptime in seconds., SimulationEngine

### Community 3 - "Community 3"
Cohesion: 0.36
Nodes (7): lifespan(), SynapseOS Backend — FastAPI Application ========================================, Application lifespan — engine init and shutdown hooks., Payload for toggling system configurations., SystemConfigRequest, FastAPI, SimulationEngine

### Community 4 - "Community 4"
Cohesion: 0.33
Nodes (6): _get_engine(), get_status(), list_scenarios(), Return all available scenario definitions.     Each scenario includes its id, la, Lazily initialize the simulation engine., Retrieve hardware status logs and engine metadata.     Returns a full hardware s

### Community 5 - "Community 5"
Cohesion: 0.40
Nodes (6): str, StreamChunk, Serialize a StreamChunk to a SSE-formatted JSON string.     Format:         even, _sse_json(), PlaygroundRequest, Payload for the SSE streaming playground endpoint.

### Community 6 - "Community 6"
Cohesion: 0.50
Nodes (5): Toggle system configurations and retrieve updated hardware status.     Accepts f, update_config(), Response after applying feature toggles., SystemConfigResponse, SystemConfigRequest

### Community 7 - "Community 7"
Cohesion: 0.50
Nodes (5): Internal async generator that feeds SSE events to the StreamingResponse.     Str, Server-Sent Events endpoint for the Playground component.      Streams the mock, _sse_generator(), stream_playground(), PlaygroundRequest

## Knowledge Gaps
- **3 isolated node(s):** `FastAPI`, `Uvicorn`, `Pydantic`
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SimulationEngine` connect `Community 2` to `Community 0`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`?**
  _High betweenness centrality (0.229) - this node is a cross-community bridge._
- **Why does `ScenarioId` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 5`, `Community 6`, `Community 7`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Why does `StreamChunk` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 5`, `Community 6`, `Community 7`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Are the 10 inferred relationships involving `SimulationEngine` (e.g. with `InferenceMode` and `ScenarioId`) actually correct?**
  _`SimulationEngine` has 10 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `ScenarioId` (e.g. with `str` and `StreamChunk`) actually correct?**
  _`ScenarioId` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `InferenceMode` (e.g. with `str` and `StreamChunk`) actually correct?**
  _`InferenceMode` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `StreamChunk` (e.g. with `str` and `StreamChunk`) actually correct?**
  _`StreamChunk` has 13 INFERRED edges - model-reasoned connections that need verification._