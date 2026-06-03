#!/usr/bin/env bash
# ===================================================================
# SynapseOS — Backend Launcher
# ===================================================================
# Double-click or run:  bash start-backend.sh
# Starts the FastAPI server on port 8000 with auto-reload.
# ===================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# ── Resolve Python ────────────────────────────────────────────────
PYTHON=""
for cmd in python3 python; do
    if command -v "$cmd" &>/dev/null; then
        PYTHON="$cmd"
        break
    fi
done

if [ -z "$PYTHON" ]; then
    echo "❌  No Python installation found. Install Python 3.10+ and try again."
    exit 1
fi

echo "🐍  Using Python: $PYTHON"

# ── Activate virtual environment if it exists ─────────────────────
VENV_DIR="$SCRIPT_DIR/.venv"
if [ -d "$VENV_DIR" ] && [ -f "$VENV_DIR/bin/activate" ]; then
    echo "📦  Activating virtual environment..."
    source "$VENV_DIR/bin/activate" 2>/dev/null || true
elif [ -d "$VENV_DIR" ] && [ -f "$VENV_DIR/Scripts/activate" ]; then
    # Windows-style venv
    source "$VENV_DIR/Scripts/activate" 2>/dev/null || true
else
    echo "📦  No virtual environment found. Running with system Python..."
    echo "    (Run 'python3 -m venv .venv' to create one, or install python3-venv)"
fi

# ── Install dependencies ─────────────────────────────────────────
echo "📥  Installing dependencies..."
pip install -q --break-system-packages -r backend/requirements.txt 2>/dev/null || \
pip install -q --user -r backend/requirements.txt 2>/dev/null || \
pip3 install -q -r backend/requirements.txt 2>/dev/null || \
    echo "⚠️  Dependencies may already be installed or need manual install."

# ── Verify uvicorn is available ──────────────────────────────────
if ! command -v uvicorn &>/dev/null; then
    pip3 install -q --break-system-packages uvicorn 2>/dev/null || \
    pip3 install -q --user uvicorn 2>/dev/null || \
    echo "⚠️  uvicorn not found — install with: pip install uvicorn"
fi

# ── Launch server ────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║           SynapseOS Backend Server                       ║"
echo "║                                                          ║"
echo "║  🌐  http://localhost:8000                               ║"
echo "║  📖  API docs: http://localhost:8000/docs                ║"
echo "║  📊  Health:  http://localhost:8000/health                ║"
echo "║                                                          ║"
echo "║  Press Ctrl+C to stop                                    ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

exec uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
