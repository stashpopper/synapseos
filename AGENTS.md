# SynapseOS Project Instructions

## Architecture Overview

Before reading source files, always check the knowledge graph first to understand the codebase structure:

```bash
cat graphify-out/graph.json | python3 -c "
import json, sys
data = json.load(sys.stdin)
print(f'Graph: {len(data[\"nodes\"])} nodes, {len(data[\"edges\"])} edges, {len(set(n.get(\"community\", \"\") for n in data[\"nodes\"]))} communities')
for c in sorted(set(n.get(\"community\", \"\") for n in data[\"nodes\"])):
    nodes = [n[\"label\"] for n in data[\"nodes\"] if n.get(\"community\") == c][:3]
    print(f'  Community {c}: {nodes}')
"
```

The full graph is in `graphify-out/graph.json`. The human-readable report is in `graphify-out/GRAPH_REPORT.md`. Use these to understand architecture before diving into source files.

## Key Architecture

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4 (port 5173)
- **Backend**: Python + FastAPI (port 8000)
- **AI Pipeline**: SynapseForge — 7 specialized agents (Planner, Reviewer, Quality, Security, Performance, Synthesizer, Docs) via LangGraph
- **LLM Inference**: Local mock engine in `backend/app/engine.py` (simulates streaming LLM responses)
- **Deployment**: Google Cloud Run with Docker, auto-scaling 0-10 instances

## Quick Commands

```bash
# Frontend
npm install && npm run dev

# Backend
cd backend && pip install -r requirements.txt && python -m app.main

# Both (separate terminals)
```

## Important Files

- `backend/app/forge/` — SynapseForge multi-agent pipeline (core logic)
- `backend/app/engine.py` — LLM simulation engine
- `backend/app/api/forge/` — API endpoints (analyze, stream)
- `src/components/forge/` — Code review UI components
- `src/components/sections/` — Landing page sections
- `cloudbuild.yaml` — GCP deployment config

## Code Style

- TypeScript strict mode, ESLint configured
- Python: Pydantic models, FastAPI conventions
- No external LLM calls in production — all analysis is local
