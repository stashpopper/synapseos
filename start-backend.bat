@echo off
REM ==================================================================
REM SynapseOS — Backend Launcher (Windows)
REM ==================================================================
REM Double-click to run. Starts FastAPI on port 8000.
REM ==================================================================

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM ── Check for Python ────────────────────────────────────────────
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR]  No Python installation found. Install Python 3.10+ and try again.
    pause
    exit /b 1
)

echo [OK]     Using Python: %python%

REM ── Activate venv if it exists ─────────────────────────────────
if exist ".venv\Scripts\activate.bat" (
    echo [OK]     Activating virtual environment...
    call ".venv\Scripts\activate.bat"
) else (
    echo [INFO]   No virtual environment found. Creating .venv ...
    python -m venv .venv
    call ".venv\Scripts\activate.bat"
)

REM ── Install dependencies ───────────────────────────────────────
echo [INFO]   Installing dependencies...
pip install -q -r backend\requirements.txt

REM ── Launch ─────────────────────────────────────────────────────
echo.
echo +------------------------------------------+
echo |      SynapseOS Backend Server             |
echo |                                          |
echo |  http://localhost:8000                    |
echo |  API docs: http://localhost:8000/docs     |
echo |  Health:  http://localhost:8000/health    |
echo |                                          |
echo |  Press Ctrl+C to stop                    |
echo +------------------------------------------+
echo.

uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

pause
