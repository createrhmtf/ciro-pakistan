# Start CIRO FastAPI backend
Set-Location $PSScriptRoot\backend
Write-Host "Verifying live setup..." -ForegroundColor Cyan
python scripts/verify_live_setup.py
Write-Host "`nStarting API on http://localhost:8000 ..." -ForegroundColor Green
python main.py
