# start-demo.ps1 — Exhibition startup script

Write-Host "Starting Kannada Speech Aid..." -ForegroundColor Cyan

# Kill any existing processes on our ports
Write-Host "Clearing ports 8000, 3000, 5173..." -ForegroundColor Yellow
$ports = @(8000, 3000, 5173)
foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($process) {
        Stop-Process -Id $process.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}

Start-Sleep -Seconds 2

# Start AI Server
Write-Host "1. Starting AI Server (port 8000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\Major Project\Kannada-Speech-Aid'; .agents\venv\Scripts\activate; cd .agents\api; python agent_server.py"

Write-Host "   Waiting for AI server to load model (15 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Start Express
Write-Host "2. Starting Express API (port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\Major Project\Kannada-Speech-Aid\artifacts\api-server'; pnpm dev"

Start-Sleep -Seconds 5

# Start React
Write-Host "3. Starting React Frontend (port 5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\Major Project\Kannada-Speech-Aid\artifacts\kannada-speech-therapy'; pnpm dev"

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "All servers started!" -ForegroundColor Cyan
Write-Host "Open: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Demo accounts:" -ForegroundColor White
Write-Host "  Patient:   ramaswamy@example.com  / password123" -ForegroundColor Gray
Write-Host "  Therapist: therapist@example.com  / password123" -ForegroundColor Gray