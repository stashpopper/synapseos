#!/usr/bin/env bash
# ===================================================================
# SynapseOS — Full Stack Launcher
# ===================================================================
# Double-click or run:  bash start-backend.sh
# Starts both the FastAPI backend (port 8000) and React frontend (port 5173).
# If a port is busy, the script kills the existing process automatically.
#
# Environment variables:
#   BACKEND_PORT  — change backend base port (default: 8000)
#   FRONTEND_PORT — change frontend base port (default: 5173)
# ===================================================================

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# ── Cleanup on exit ─────────────────────────────────────────────
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
    echo ""
    echo "🛑  Shutting down servers..."
    [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null && echo "  Stopped backend (PID $BACKEND_PID)"
    [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null && echo "  Stopped frontend (PID $FRONTEND_PID)"
    wait 2>/dev/null
    echo "✅  All servers stopped."
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# ── Resolve Python ───────────────────────────────────────────────
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

# ── Resolve Node.js ──────────────────────────────────────────────
NODE=""
for cmd in node; do
    if command -v "$cmd" &>/dev/null; then
        NODE="$cmd"
        break
    fi
done
if [ -z "$NODE" ]; then
    echo "❌  Node.js not found. Install Node.js 18+ and try again."
    exit 1
fi
echo "📦  Using Node.js: $($NODE --version)"

NPM=""
for cmd in npm; do
    if command -v "$cmd" &>/dev/null; then
        NPM="$cmd"
        break
    fi
done
if [ -z "$NPM" ]; then
    echo "❌  npm not found."
    exit 1
fi
echo "📦  Using npm: $($NPM --version)"

# ── Activate virtual environment if it exists ────────────────────
VENV_DIR="$SCRIPT_DIR/.venv"
if [ -d "$VENV_DIR" ] && [ -f "$VENV_DIR/bin/activate" ]; then
    echo "📦  Activating virtual environment..."
    source "$VENV_DIR/bin/activate" 2>/dev/null || true
elif [ -d "$VENV_DIR" ] && [ -f "$VENV_DIR/Scripts/activate" ]; then
    source "$VENV_DIR/Scripts/activate" 2>/dev/null || true
else
    echo "📦  No virtual environment found. Running with system Python..."
fi

# ── Install backend dependencies ─────────────────────────────────
echo "📥  Installing backend dependencies..."
pip install -q --break-system-packages -r backend/requirements.txt 2>/dev/null || \
pip install -q --user -r backend/requirements.txt 2>/dev/null || \
pip3 install -q -r backend/requirements.txt 2>/dev/null || \
    echo "⚠️  Backend dependencies may need manual install."

# ── Verify uvicorn ───────────────────────────────────────────────
if ! command -v uvicorn &>/dev/null; then
    pip3 install -q --break-system-packages uvicorn 2>/dev/null || \
    pip3 install -q --user uvicorn 2>/dev/null || \
    echo "⚠️  uvicorn not found — install with: pip install uvicorn"
fi

# ── Install frontend dependencies ────────────────────────────────
echo "📥  Installing frontend dependencies..."
cd "$SCRIPT_DIR"
$NPM install --silent 2>/dev/null || echo "⚠️  npm install had warnings (continuing...)"

# ── Helper: find and kill process on a port ─────────────────────
release_port() {
    local port="$1"
    local pid
    pid=$(lsof -ti:"$port" 2>/dev/null | head -1) || true
    if [ -n "$pid" ]; then
        kill -9 "$pid" 2>/dev/null || true
        sleep 1
    fi
    pid=$(fuser "$port/tcp" 2>/dev/null | tr -d ' ' | head -1) || true
    if [ -n "$pid" ]; then
        kill -9 "$pid" 2>/dev/null || true
        sleep 1
    fi
}

# ── Helper: find available port (with kill fallback) ────────────
# Prints status to stderr, port number to stdout
find_port() {
    local base_port="$1"
    local max_fallback="${2:-0}"

    # Check base port
    if ! lsof -ti:"$base_port" &>/dev/null && ! fuser "$base_port/tcp" &>/dev/null; then
        echo "$base_port"
        return 0
    fi

    # Try to kill process on base port
    local pid
    pid=$(lsof -ti:"$base_port" 2>/dev/null | head -1) || pid=$(fuser "$base_port/tcp" 2>/dev/null | tr -d ' ' | head -1) || true
    if [ -n "$pid" ]; then
        echo "  ⚠️  Port $base_port in use (PID $pid), killing..." >&2
        kill -9 "$pid" 2>/dev/null || true
        sleep 2
        if ! lsof -ti:"$base_port" &>/dev/null && ! fuser "$base_port/tcp" &>/dev/null; then
            echo "$base_port"
            return 0
        fi
    fi

    # Try fallback ports
    for i in $(seq 1 "$max_fallback"); do
        local candidate=$((base_port + i))
        if ! lsof -ti:"$candidate" &>/dev/null && ! fuser "$candidate/tcp" &>/dev/null; then
            echo "$candidate"
            return 0
        fi
    done

    return 1
}

# ── Backend port setup ──────────────────────────────────────────
BACKEND_PORT=${BACKEND_PORT:-8000}
echo ""
echo "🔍  Checking backend port..." >&2
BACKEND_PORT=$(find_port "$BACKEND_PORT" 5) || {
    echo "❌  Could not free port $BACKEND_PORT after 5 attempts." >&2
    echo "    Manual fix: kill -9 $(lsof -ti:$BACKEND_PORT 2>/dev/null | head -1)" >&2
    exit 1
}
[ "$BACKEND_PORT" != "8000" ] && echo "  ℹ️  Using port $BACKEND_PORT instead of 8000" >&2
echo "  ✅  Backend will run on port $BACKEND_PORT" >&2

# ── Frontend port setup ─────────────────────────────────────────
FRONTEND_PORT=${FRONTEND_PORT:-5173}
echo "🔍  Checking frontend port..." >&2
# Frontend doesn't fall back — CORS requires exact port match
if ! lsof -ti:"$FRONTEND_PORT" &>/dev/null && ! fuser "$FRONTEND_PORT/tcp" &>/dev/null; then
    echo "  ✅  Frontend will run on port $FRONTEND_PORT" >&2
else
    # Try to kill
    pid=$(lsof -ti:"$FRONTEND_PORT" 2>/dev/null | head -1) || pid=$(fuser "$FRONTEND_PORT/tcp" 2>/dev/null | tr -d ' ' | head -1) || true
    if [ -n "$pid" ]; then
        echo "  ⚠️  Port $FRONTEND_PORT is in use (PID $pid). Killing..." >&2
        kill -9 "$pid" 2>/dev/null || true
        sleep 2
        if ! lsof -ti:"$FRONTEND_PORT" &>/dev/null && ! fuser "$FRONTEND_PORT/tcp" &>/dev/null; then
            echo "  ✅  Port $FRONTEND_PORT is now available." >&2
        else
            echo "❌  Could not free port $FRONTEND_PORT. Frontend will not start." >&2
            echo "    Manual fix: kill -9 $(lsof -ti:$FRONTEND_PORT 2>/dev/null | head -1)" >&2
            # Still start backend
            echo ""
            echo "╔══════════════════════════════════════════════════════════╗"
            echo "║           SynapseOS Backend Server (Frontend skipped)   ║"
            echo "╚══════════════════════════════════════════════════════════╝"
            echo "" >&2
            exec uvicorn backend.app.main:app --host 0.0.0.0 --port "$BACKEND_PORT" --reload
        fi
    fi
fi

# ── Launch frontend (background) ─────────────────────────────────
echo ""
echo "🚀  Starting frontend on http://localhost:$FRONTEND_PORT..."
cd "$SCRIPT_DIR"
$NPM run dev -- --port "$FRONTEND_PORT" > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 3

# Verify frontend started
if kill -0 "$FRONTEND_PID" 2>/dev/null; then
    echo "✅  Frontend started (PID $FRONTEND_PID)"
else
    echo "⚠️  Frontend may have failed to start. Check /tmp/frontend.log"
    FRONTEND_PID=""
fi

# ── Launch backend (foreground) ──────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                SynapseOS — Full Stack                       ║"
echo "║                                                              ║"
echo "║  🖥️  Frontend: http://localhost:$FRONTEND_PORT              ║"
echo "║  ⚙️  Backend:  http://localhost:$BACKEND_PORT               ║"
echo "║  📖  API docs: http://localhost:$BACKEND_PORT/docs          ║"
echo "║  📊  Health:   http://localhost:$BACKEND_PORT/health        ║"
echo "║                                                              ║"
echo "║  Press Ctrl+C to stop both servers                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Run backend in foreground (trap handles cleanup on Ctrl+C)
uvicorn backend.app.main:app --host 0.0.0.0 --port "$BACKEND_PORT" --reload &
BACKEND_PID=$!

# Wait for backend to start
sleep 3
if kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo "✅  Backend started (PID $BACKEND_PID)"
else
    echo "❌  Backend failed to start. Check /tmp/backend.log"
    cleanup
fi

# Wait for backend process (keeps script alive, trap handles Ctrl+C)
wait "$BACKEND_PID"
