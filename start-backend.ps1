# PowerShell script to start the SwipeHire backend server
Write-Host "Starting SwipeHire Backend Server..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path ".\swipehire-backend")) {
    Write-Host "❌ Error: swipehire-backend directory not found!" -ForegroundColor Red
    Write-Host "Please run this script from the swipehire-app root directory." -ForegroundColor Yellow
    exit 1
}

# Navigate to backend directory
Set-Location ".\swipehire-backend"

# Check if package.json exists
if (-not (Test-Path ".\package.json")) {
    Write-Host "❌ Error: package.json not found in backend directory!" -ForegroundColor Red
    exit 1
}

# Check if node_modules exists, install if not
if (-not (Test-Path ".\node_modules")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
}

# Check if port 5000 is available
$portInUse = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "⚠️ Warning: Port 5000 is already in use!" -ForegroundColor Yellow
    Write-Host "The backend server might already be running, or another service is using port 5000." -ForegroundColor Yellow
    $continue = Read-Host "Do you want to continue anyway? (y/n)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 0
    }
}

# Start the server
Write-Host "🚀 Starting backend server on http://localhost:5000..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Cyan

# Start the server
npm start