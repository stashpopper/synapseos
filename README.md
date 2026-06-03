# SynapseOS — AI Code Review & Analysis Platform

> Ship cleaner code, not technical debt. AI-powered code review that keeps your source code private.

SynapseOS uses seven specialized AI agents to automatically analyze code for bugs, security vulnerabilities, performance issues, and code quality — all running locally on your machine.

## Features

- **Multi-Agent Analysis**: 7 specialized agents (Planner, Reviewer, Quality, Security, Performance, Synthesizer, Docs) working in parallel
- **Security Deep Scan**: OWASP Top 10 vulnerability detection with custom rules
- **Code Quality Intelligence**: Anti-pattern detection, cyclomatic complexity, and best practices
- **Performance Optimization**: Algorithmic complexity analysis and bottleneck detection
- **100% Private**: All analysis runs locally — your code never leaves your machine

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4
- **Backend**: Python + FastAPI
- **AI**: Local LLM inference with multi-agent orchestration

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.12+
- pip (Python package manager)

### Installation

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && pip install -r requirements.txt
```

### Running

```bash
# Start the development server (frontend)
npm run dev

# Start the backend API server
cd backend && python -m app.main
```

The app will be available at `http://localhost:5173`.

## Project Structure

```
synapseos/
├── src/                    # Frontend source code
│   ├── components/
│   │   ├── forge/          # Code review interface
│   │   └── sections/       # Landing page sections
│   ├── api/                # API client
│   └── hooks/              # Custom React hooks
├── backend/                # FastAPI backend
│   └── app/
│       ├── api/forge/      # Code analysis endpoints
│       └── main.py         # Backend entry point
├── public/                 # Static assets
└── index.html              # Entry point
```

## Development

```bash
# Run linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## License

MIT
