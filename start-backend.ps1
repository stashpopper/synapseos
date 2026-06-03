# ==================================================================
# SynapseOS — Backend Launcher (PowerShell / Windows)
# ==================================================================
# Run:  .\start-backend.ps1
# ==================================================================

$ErrorActionPreference = "Stop"
$PSScriptRoot = $PSScriptRoot -or $PSScriptRoot
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# ── Check Python ──────────────────────────────────────────────────
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
    Write-Host "[ERROR]  No Python installation found. Install Python 3.10+." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[OK]     Using Python: $($python.Source)" -ForegroundColor Green

# ── Activate venv ─────────────────────────────────────────────────
$venvPath = Join-Path $scriptDir ".venv"
if (Test-Path (Join-Path $venvPath "Scripts\Activate.ps1")) {
    Write-Host "[OK]     Activating virtual environment..." -ForegroundColor Yellow
    & (Join-Path $venvPath "Scripts\Activate.ps1")
} else {
    Write-Host "[INFO]   No venv found. Creating .venv ..." -ForegroundColor Cyan
    python -m venv .venv
    & (Join-Path $venvPath "Scripts\Activate.ps1")
}

# ── Install deps ──────────────────────────────────────────────────
Write-Host "[INFO]   Installing dependencies..." -ForegroundColor Cyan
pip install -q -r backend\requirements.txt

# ── Launch ────────────────────────────────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           SynapseOS Backend Server                       ║" -ForegroundColor Cyan
Write-Host "║                                                          ║" -ForegroundColor Cyan
Write-Host "║  🌐  http://localhost:8000                               ║" -ForegroundColor Green
Write-Host "║  📖  API docs: http://localhost:8000/docs                ║" -ForegroundColor Green
Write-Host "║  📊  Health:  http://localhost:8000/health                ║" -ForegroundColor Green
Write-Host "║                                                          ║" -ForegroundColor Cyan
Write-Host "║  Press Ctrl+C to stop                                    ║" -ForegroundColor Yellow
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
