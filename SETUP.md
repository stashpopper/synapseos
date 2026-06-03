# SynapseForge — Setup & Quick Start

## What Was Built

**SynapseForge** is a multi-agent AI code analysis platform built on top of SynapseOS. It features:

### Backend (`backend/app/forge/`)
- **LangGraph Pipeline** — 6-agent workflow: Planner → [Reviewer, Security, Performance] → Synthesizer → Docs
- **Pattern-based scanning** — Works without LLM API keys (security, performance patterns)
- **LLM integration** — Falls back gracefully when API keys aren't configured
- **SSE streaming** — Real-time agent progress streaming
- **REST API** — `/api/forge/analyze`, `/api/forge/stream`, `/api/forge/results/:id`, `/api/forge/history`

### Frontend (`src/components/forge/`)
- **AnalysisPanel** — Code input with upload, sample code, depth selector
- **ResultsDashboard** — Health score gauge, severity breakdown, findings list
- **AgentTimeline** — Visual pipeline showing agent status
- **ScoreGauge** — Animated circular score meter
- **SeverityBadge** — Color-coded severity indicators
- **ResultCard** — Expandable finding cards with recommendations
- **Recommendations** — Actionable improvement suggestions

## Running the App

### Backend
```bash
cd backend
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend
```bash
npx vite --host 0.0.0.0
```

### URLs
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **Health Check:** http://localhost:8000/health

## Configuration

Copy `.env.example` to `.env` and set your API key:
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here
ANALYSIS_MODEL=gpt-4o
```

Without API keys, the pattern-based scanners still work (security + performance).

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/forge/analyze` | Submit code for analysis |
| POST | `/api/forge/stream` | SSE streaming analysis |
| GET | `/api/forge/results/:id` | Get analysis results |
| GET | `/api/forge/history` | List analysis history |

## Testing the API

```bash
# Quick analysis
curl -X POST http://localhost:8000/api/forge/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def hello(): print(\"world\")",
    "language": "python",
    "depth": "quick"
  }'
```

## Current Status

✅ Backend API working (pattern-based scanning)
✅ Frontend dev server running
✅ TypeScript compiles cleanly
✅ LangGraph pipeline functional
⏳ LLM analysis (requires API key in `.env`)

## Next Steps

1. **Add API key** to `.env` for full LLM-powered analysis
2. **Phase 2:** Enhance agent prompts and add more code patterns
3. **Phase 3:** Add GitHub URL input, file upload, export features
4. **Phase 4:** Add database for analysis history persistence
5. **Phase 5:** Add team features, CI/CD integration
