# 🧠 SynapseForge — AI-Powered Software Engineering Command Center

> *"The IDE your AI agent wishes it had."*

---

## 📋 Executive Summary

**SynapseForge** is a full-stack, AI-powered software engineering platform that transforms raw code into production-ready software through a **multi-agent orchestration pipeline**. Built on **LangGraph** with real LLM integration, it provides developers with an interactive, terminal-style interface to analyze, review, secure, and optimize their codebases — all streaming in real-time.

It extends the SynapseOS brand identity: dark, futuristic, privacy-conscious, and terminal-aesthetic — but shifts from "local inference infrastructure" to "AI-powered developer tooling."

---

## 🎯 Why This Project?

| Factor | Analysis |
|--------|----------|
| **Theme Match** | Dark cyberpunk UI, terminal aesthetic, teal/indigo palette — seamless extension of SynapseOS |
| **Market Relevance** | AI coding assistants are the #1 trending developer tool category in 2026 |
| **Technical Depth** | LangGraph multi-agent workflows, streaming SSE, real LLM APIs — production-grade skills |
| **Portfolio Impact** | Demonstrates full-stack, AI orchestration, real-time streaming, and system design |
| **Scalability** | Start with single repo analysis → expand to team workflows, CI/CD integration |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        SYNAPSEFORGE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌──────────────────────────────────┐    │
│  │   FRONTEND       │    │         BACKEND                  │    │
│  │   (React + Vite) │    │      (FastAPI + LangGraph)       │    │
│  │                  │    │                                  │    │
│  │  ┌────────────┐  │    │  ┌──────────────────────────┐   │    │
│  │  │  Landing   │  │    │  │  API Layer (FastAPI)      │   │    │
│  │  │  Page      │  │    │  │  - /api/analyze (POST)    │   │    │
│  │  ├────────────┤  │    │  │  - /api/status (GET)      │   │    │
│  │  │  Playground│  │◄───┼──┤  - /api/results (GET)     │   │    │
│  │  │  (Main App)│  │    │  │  - /api/history (GET)     │   │    │
│  │  ├────────────┤  │    │  ├──────────────────────────┤   │    │
│  │  │  Terminal  │  │    │  │  LangGraph Orchestration  │   │    │
│  │  │  Viewer    │  │    │  │  (Multi-Agent Pipeline)   │   │    │
│  │  ├────────────┤  │    │  ├──────────────────────────┤   │    │
│  │  │  Results   │  │    │  │  Agent: Code Reviewer     │   │    │
│  │  │  Dashboard │  │    │  │  Agent: Security Auditor  │   │    │
│  │  └────────────┘  │    │  │  Agent: Performance Expert│   │    │
│  │                  │    │  │  Agent: Docs Generator    │   │    │
│  │                  │    │  └──────────────────────────┘   │    │
│  │                  │    │                                  │    │
│  │                  │    │  ┌──────────────────────────┐   │    │
│  │                  │    │  │  Streaming Layer          │   │    │
│  │                  │    │  │  - SSE for live output    │   │    │
│  │                  │    │  │  - Token-by-token display │   │    │
│  │                  │    │  └──────────────────────────┘   │    │
│  └─────────────────┘    └──────────────────────────────────┘    │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  EXTERNAL: LLM API (OpenAI / Anthropic / Ollama)         │   │
│  │  User provides API key via .env — never stored in code   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🤖 Multi-Agent Pipeline (LangGraph)

The core intelligence comes from a **LangGraph state machine** with 4 specialized agents:

```
                    ┌─────────────┐
                    │  USER INPUT  │
                    │ (code/repo)  │
                    └──────┬──────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   PLANNER AGENT        │
              │  (Analyzes scope,      │
              │   creates workflow)    │
              └────────┬───────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
┌─────────────┐ ┌──────────┐ ┌──────────┐
│ CODE REVIEW │ │ SECURITY │ │PERFORMANCE│
│    AGENT    │ │  AGENT   │ │  AGENT   │
└──────┬──────┘ └────┬─────┘ └────┬─────┘
       │             │             │
       └─────────────┼─────────────┘
                     ▼
          ┌──────────────────┐
          │  SYNTHESIZER     │
          │  (Combines all   │
          │   findings into  │
          │   unified report)│
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │  DOCS GENERATOR  │
          │  (Auto-generates │
          │   docs/suggestions│
          └──────────────────┘
```

### Agent Responsibilities

| Agent | Role | Tools Used |
|-------|------|------------|
| **Planner** | Parses input code, determines analysis depth, creates execution plan | AST parsing, file tree analysis |
| **Code Reviewer** | Reviews code quality, patterns, anti-patterns, style | Static analysis rules, code quality heuristics |
| **Security Auditor** | Scans for vulnerabilities, secrets, injection risks | OWASP Top 10 patterns, secret detection |
| **Performance Expert** | Identifies bottlenecks, optimization opportunities | Complexity analysis, anti-pattern detection |
| **Synthesizer** | Merges all agent outputs into a unified, prioritized report | LLM summarization, priority scoring |
| **Docs Generator** | Generates documentation, README suggestions, API docs | Template-based + LLM enhancement |

---

## 📁 Project Structure

```
synapseos/
├── frontend/                          # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                    # Reusable UI primitives
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Container.tsx
│   │   │   │   ├── Terminal.tsx       # NEW: Terminal component
│   │   │   │   ├── Card.tsx
│   │   │   │   └── Badge.tsx
│   │   │   ├── forge/                 # NEW: SynapseForge-specific
│   │   │   │   ├── AnalysisPanel.tsx  # Main analysis interface
│   │   │   │   ├── AgentStatus.tsx    # Live agent status indicators
│   │   │   │   ├── ResultCard.tsx     # Analysis result cards
│   │   │   │   ├── CodeViewer.tsx     # Syntax-highlighted code
│   │   │   │   ├── SeverityBadge.tsx  # Critical/High/Medium/Low
│   │   │   │   ├── AgentTimeline.tsx  # Pipeline progress visualization
│   │   │   │   ├── Recommendations.tsx # Actionable recommendations
│   │   │   │   └── ScoreGauge.tsx     # Code health score meter
│   │   │   └── sections/              # Existing landing page
│   │   │       ├── Hero.tsx
│   │   │       ├── Features.tsx
│   │   │       ├── PerformanceEngine.tsx
│   │   │       ├── Playground.tsx
│   │   │       ├── Marquee.tsx
│   │   │       ├── Pricing.tsx
│   │   │       ├── FAQ.tsx
│   │   │       └── Footer.tsx
│   │   ├── api/
│   │   │   ├── client.ts              # Existing API client
│   │   │   └── forge.ts               # NEW: Forge API client
│   │   ├── types/
│   │   │   └── index.ts               # Existing types + new ones
│   │   ├── hooks/                     # NEW
│   │   │   ├── useSSEStream.ts        # SSE streaming hook
│   │   │   └── useAnalysis.ts         # Analysis state management
│   │   ├── pages/                     # NEW
│   │   │   ├── HomePage.tsx           # Landing page
│   │   │   ├── ForgePage.tsx          # Main forge application
│   │   │   └── HistoryPage.tsx        # Analysis history
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                           # FastAPI + LangGraph
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app (existing)
│   │   ├── models.py                  # Pydantic models (existing)
│   │   ├── engine.py                  # Simulation engine (existing)
│   │   ├── forge/                     # NEW: Forge module
│   │   │   ├── __init__.py
│   │   │   ├── graph.py               # LangGraph workflow definition
│   │   │   ├── nodes.py               # Individual agent nodes
│   │   │   ├── states.py              # LangGraph state definitions
│   │   │   ├── tools.py               # Agent tool definitions
│   │   │   ├── prompts.py             # Agent system prompts
│   │   │   └── analysis.py            # Analysis orchestration
│   │   └── api/                       # NEW: Forge API endpoints
│   │       ├── __init__.py
│   │       ├── analyze.py             # POST /api/forge/analyze
│   │       ├── results.py             # GET /api/forge/results/:id
│   │       ├── history.py             # GET /api/forge/history
│   │       └── stream.py              # POST /api/forge/stream (SSE)
│   ├── requirements.txt
│   └── .env.example                   # NEW: Environment template
│
├── .env.example                       # NEW: Root env template
├── .gitignore
├── README.md
└── PROJECT_PROPOSAL.md                # This file
```

---

## 🎨 UI/UX Design — Forge Page

### Main Analysis Interface

```
┌────────────────────────────────────────────────────────────────────┐
│  SynapseOS        Features  Performance  Playground  Pricing  [⌨️] │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─ SYNAPSEFORGE ──────────────────────────────────────────────┐   │
│  │                                                              │   │
│  │  Paste code, upload a file, or enter a GitHub URL to begin   │   │
│  │                                                              │   │
│  │  ┌──────────────────────────────────────────────────────┐   │   │
│  │  │ $ cat analysis.py                                    │   │   │
│  │  │ import requests                                      │   │   │
│  │  │ def get_data(url):                                   │   │   │
│  │  │     response = requests.get(url)                     │   │   │
│  │  │     return response.json()                           │   │   │
│  │  │                                                      │   │   │
│  │  │  [PASTE CODE HERE]                                   │   │   │
│  │  │                                                      │   │   │
│  │  │  [Upload File]  [GitHub URL]  [Sample Code]          │   │   │
│  │  │                                                      │   │   │
│  │  │  ┌─────────────────────────────────────────────────┐ │   │   │
│  │  │  │  [🚀 Analyze Code]                              │ │   │   │
│  │  │  └─────────────────────────────────────────────────┘ │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌─ ANALYSIS PIPELINE ─────────────────────────────────────────┐   │
│  │                                                              │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │   │
│  │  │ 🟡       │  │ ⚪       │  │ ⚪       │  │ ⚪       │    │   │
│  │  │ PLANNER  │─►│ REVIEW   │─►│ SECURITY │─►│ PERF     │    │   │
│  │  │ Done 2s  │  │ Running..│  │ Pending  │  │ Pending  │    │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │   │
│  │                                                              │   │
│  │  Health Score: 72/100 ────────────────────░░░░░░░░░░░░     │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌─ LIVE OUTPUT ───────────────────────────────────────────────┐   │
│  │                                                              │   │
│  │  🔍 [Reviewer] Found 3 code smells in analysis.py           │   │
│  │  🛡️ [Security] No critical vulnerabilities detected         │   │
│  │  ⚡ [Perf] Consider adding timeout parameter to requests    │   │
│  │  📝 [Synthesizer] Generating unified report...              │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Results Dashboard (After Analysis)

```
┌─ ANALYSIS RESULTS ────────────────────────────────────────────┐
│                                                                │
│  ┌─ Overall Health Score ──────────────────────────────────┐  │
│  │                                                         │  │
│  │              72 / 100                                   │  │
│  │           ████████░░░░░░░░                               │  │
│  │                                                         │  │
│  │  3 Critical  │  5 High  │  8 Medium  │  12 Low          │  │
│  │  🔴           │  🟠       │  🟡         │  🟢             │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─ 🔴 Critical ──────────────────────────────────────────┐   │
│  │  1. SQL Injection vulnerability in query_builder.py:42  │   │
│  │     f"SELECT * FROM users WHERE id = {user_id}"        │   │
│  │     → Use parameterized queries                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌─ 🟠 High ──────────────────────────────────────────────┐   │
│  │  1. Unhandled exceptions in error_handler.py:15         │   │
│  │     Bare except clause catches all exceptions           │   │
│  │     → Catch specific exception types                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌─ 🟡 Medium ────────────────────────────────────────────┐   │
│  │  1. Missing type hints in api/routes.py                 │   │
│  │     → Add type annotations for better maintainability   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌─ 💡 Recommendations ───────────────────────────────────┐   │
│  │  1. Add input validation layer (pydantic models)        │   │
│  │  2. Implement rate limiting on API endpoints            │   │
│  │  3. Add comprehensive unit tests (currently 0%)         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                │
│  [Export Report] [Fix All] [View Full Report]                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Design

### POST `/api/forge/analyze`
Submit code for analysis.

```json
// Request
{
  "code": "def hello(): print('world')",
  "language": "python",
  "filename": "hello.py",
  "depth": "standard"  // "quick" | "standard" | "deep"
}

// Response (immediate)
{
  "analysis_id": "ana_7x3k9m2p",
  "status": "processing",
  "estimated_seconds": 15
}
```

### POST `/api/forge/stream`
SSE endpoint for real-time agent output.

```
event: agent_start
data: {"agent": "planner", "status": "started"}

event: agent_progress
data: {"agent": "planner", "message": "Analyzing code structure..."}

event: finding
data: {"severity": "critical", "agent": "security", "message": "...", "line": 42}

event: agent_complete
data: {"agent": "planner", "status": "completed", "findings": 3}

event: analysis_complete
data: {"analysis_id": "ana_7x3k9m2p", "score": 72}
```

### GET `/api/forge/results/:id`
Retrieve completed analysis.

```json
{
  "analysis_id": "ana_7x3k9m2p",
  "score": 72,
  "agents": ["planner", "reviewer", "security", "performance"],
  "findings": [
    {
      "severity": "critical",
      "category": "security",
      "title": "SQL Injection",
      "file": "query_builder.py",
      "line": 42,
      "description": "...",
      "recommendation": "Use parameterized queries",
      "cwe_id": "CWE-89"
    }
  ],
  "summary": "...",
  "created_at": "2026-06-02T10:30:00Z"
}
```

### GET `/api/forge/history`
List past analyses.

```json
[
  {
    "analysis_id": "ana_7x3k9m2p",
    "filename": "query_builder.py",
    "score": 72,
    "created_at": "2026-06-02T10:30:00Z"
  }
]
```

---

## 🔐 Environment Setup

### `.env.example`
```env
# LLM Provider
LLM_PROVIDER=openai          # openai | anthropic | ollama

# OpenAI
OPENAI_API_KEY=sk-your-key-here

# Anthropic
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Ollama (local)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3

# Model Selection
ANALYSIS_MODEL=gpt-4o        # Model used for analysis
FAST_MODEL=gpt-4o-mini       # Model used for quick analysis

# Server
BACKEND_PORT=8000
FRONTEND_PORT=5173
```

---

## 📦 Dependencies

### Frontend
```
react, react-dom
vite, typescript, tailwindcss
lucide-react (icons — already in use)
```

### Backend
```
fastapi, uvicorn, pydantic (already in use)
langgraph, langchain
openai, anthropic (or ollama)
python-multipart (file uploads)
```

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Days 1-2)
- [ ] Set up project structure (frontend/ + backend/ folders)
- [ ] Create `.env.example` and `requirements.txt`
- [ ] Build LangGraph state machine (nodes, states, graph definition)
- [ ] Create API endpoints (`/api/forge/analyze`, `/api/forge/stream`)
- [ ] Build frontend Forge page with code input + terminal output
- [ ] Wire up SSE streaming from backend to frontend

### Phase 2: Agent Pipeline (Days 3-5)
- [ ] Implement Planner agent (code structure analysis)
- [ ] Implement Code Reviewer agent (quality + patterns)
- [ ] Implement Security Auditor agent (OWASP patterns)
- [ ] Implement Performance Expert agent (bottlenecks)
- [ ] Implement Synthesizer agent (unified report)
- [ ] Add LLM integration (configurable provider)

### Phase 3: Results & Polish (Days 6-7)
- [ ] Build Results Dashboard UI
- [ ] Add Health Score gauge visualization
- [ ] Implement severity badges + color coding
- [ ] Add Recommendations panel
- [ ] Build Analysis History page
- [ ] Add Export Report (JSON/Markdown)
- [ ] Add GitHub URL input support
- [ ] Add file upload support

### Phase 4: Production Polish (Days 8-10)
- [ ] Error handling + fallback messages
- [ ] Loading states + skeleton screens
- [ ] Responsive design testing
- [ ] Performance optimization
- [ ] Documentation (README, API docs)
- [ ] Testing (backend unit tests, frontend component tests)

---

## 💡 Why This Will Be Amazing

1. **Visually Stunning** — Matches SynapseOS dark theme perfectly, with terminal aesthetic, glowing accents, and glass morphism
2. **Technically Impressive** — LangGraph multi-agent orchestration is cutting-edge
3. **Actually Useful** — Real code analysis that developers would use
4. **Streaming UX** — Live agent activity streaming creates a "watching AI think" experience
5. **Portfolio Gold** — Demonstrates full-stack, AI, real-time, system design
6. **Extensible** — Can add CI/CD integration, team features, custom rules later

---

## 🔄 How It Extends SynapseOS

| SynapseOS (Current) | SynapseForge (New) |
|---|---|
| Landing page for local AI inference | Landing page + app for AI-powered dev tools |
| Mock SSE playground | Real multi-agent analysis pipeline |
| Pre-defined scenarios | Dynamic code analysis |
| Inference simulation | Actual LLM-powered analysis |
| "Run Massive Models Privately" | "Your Code, Supercharged by AI" |
| Backend: simulation engine | Backend: LangGraph agent orchestration |
| Frontend: terminal mockup | Frontend: live analysis dashboard |

The landing page stays as-is (it sells the infrastructure). The Forge page becomes the **actual application** that runs on top of it.

---

## 🎯 Tagline Options

- *"The IDE your AI agent wishes it had."*
- *"Code analysis, orchestrated by AI."*
- *"From raw code to production-ready."*
- *"Your code. Analyzed. Secured. Optimized."*
- *"AI-powered software engineering, in real-time."*

---

*Ready to build? Let me know which phase to start with, or if you want to adjust the design/feature set first.*
