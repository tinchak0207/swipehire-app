# SwipeHire SSL Error Fix Script
# This script diagnoses and fixes the ERR_SSL_PROTOCOL_ERROR

Write-Host "🔧 SwipeHire SSL Error Fix Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Function to check if a URL is accessible
function Test-URL {
    param([string]$URL)
    try {
        $response = Invoke-WebRequest -Uri $URL -Method GET -TimeoutSec 5 -UseBasicParsing
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

Write-Host "`n1. Checking Environment Configuration..." -ForegroundColor Yellow

# Check .env.local file
$envFile = ".\.env.local"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile
    $backendUrl = $envContent | Where-Object { $_ -like "NEXT_PUBLIC_CUSTOM_BACKEND_URL=*" }
    
    if ($backendUrl) {
        Write-Host "✅ Found backend URL configuration: $backendUrl" -ForegroundColor Green
        
        if ($backendUrl -like "*https://*") {
            Write-Host "❌ ERROR: Backend URL is using HTTPS but backend runs on HTTP" -ForegroundColor Red
            Write-Host "🔧 Fixing: Changing HTTPS to HTTP..." -ForegroundColor Yellow
            
            # Fix the HTTPS to HTTP
            $newContent = $envContent -replace "NEXT_PUBLIC_CUSTOM_BACKEND_URL=https://", "NEXT_PUBLIC_CUSTOM_BACKEND_URL=http://"
            $newContent | Set-Content $envFile
            Write-Host "✅ Fixed: Backend URL now uses HTTP" -ForegroundColor Green
        } else {
            Write-Host "✅ Backend URL correctly uses HTTP" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ ERROR: NEXT_PUBLIC_CUSTOM_BACKEND_URL not found in .env.local" -ForegroundColor Red
        Write-Host "🔧 Adding default configuration..." -ForegroundColor Yellow
        Add-Content $envFile "`nNEXT_PUBLIC_CUSTOM_BACKEND_URL=http://localhost:5000"
        Write-Host "✅ Added default backend URL configuration" -ForegroundColor Green
    }
} else {
    Write-Host "❌ ERROR: .env.local file not found" -ForegroundColor Red
    Write-Host "🔧 Creating .env.local file..." -ForegroundColor Yellow
    
    @"
# SwipeHire Environment Configuration
NEXT_PUBLIC_CUSTOM_BACKEND_URL=http://localhost:5000

# Mistral AI Configuration
MISTRAL_API_KEY=your_mistral_api_key_here
"@ | Set-Content $envFile
    
    Write-Host "✅ Created .env.local file with default configuration" -ForegroundColor Green
}

Write-Host "`n2. Checking Backend Status..." -ForegroundColor Yellow

# Check if backend port is in use
if (Test-Port -Port 5000) {
    Write-Host "✅ Backend port 5000 is in use" -ForegroundColor Green
    
    # Test HTTP connection
    if (Test-URL -URL "http://localhost:5000") {
        Write-Host "✅ Backend is accessible via HTTP" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Backend port is in use but not responding to HTTP requests" -ForegroundColor Yellow
        Write-Host "   This might be a different service or the backend is not fully started" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Backend port 5000 is not in use" -ForegroundColor Red
    Write-Host "🔧 Backend needs to be started" -ForegroundColor Yellow
}

Write-Host "`n3. Checking Frontend Status..." -ForegroundColor Yellow

# Check if frontend port is in use
if (Test-Port -Port 3000) {
    Write-Host "✅ Frontend port 3000 is in use" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend port 3000 is not in use" -ForegroundColor Red
    Write-Host "🔧 Frontend needs to be started" -ForegroundColor Yellow
}

Write-Host "`n4. Backend Environment Check..." -ForegroundColor Yellow

# Check backend .env file
$backendEnvFile = ".\swipehire-backend\.env"
if (Test-Path $backendEnvFile) {
    Write-Host "✅ Backend .env file exists" -ForegroundColor Green
    
    $backendEnvContent = Get-Content $backendEnvFile
    $portConfig = $backendEnvContent | Where-Object { $_ -like "PORT=*" }
    
    if ($portConfig) {
        Write-Host "✅ Found port configuration: $portConfig" -ForegroundColor Green
    } else {
        Write-Host "⚠️  No PORT configuration found in backend .env" -ForegroundColor Yellow
        Write-Host "   Backend will use default port 5000" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Backend .env file not found" -ForegroundColor Yellow
    Write-Host "   Backend will use default configuration" -ForegroundColor Yellow
}

Write-Host "`n5. Solution Steps..." -ForegroundColor Yellow

Write-Host "To fix the SSL error, follow these steps:" -ForegroundColor White
Write-Host ""
Write-Host "1. Start the backend:" -ForegroundColor Cyan
Write-Host "   cd swipehire-backend" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "2. In a new terminal, start the frontend:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Verify the connection:" -ForegroundColor Cyan
Write-Host "   - Frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host "   - Backend:  http://localhost:5000" -ForegroundColor Gray
Write-Host ""

# Check if both services need to be started
$needsBackend = -not (Test-Port -Port 5000)
$needsFrontend = -not (Test-Port -Port 3000)

if ($needsBackend -and $needsFrontend) {
    Write-Host "🚀 Quick Start Commands:" -ForegroundColor Green
    Write-Host ""
    Write-Host "Terminal 1 (Backend):" -ForegroundColor Cyan
    Write-Host "cd swipehire-backend && npm start" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Terminal 2 (Frontend):" -ForegroundColor Cyan
    Write-Host "npm run dev" -ForegroundColor Gray
} elseif ($needsBackend) {
    Write-Host "🚀 Start Backend:" -ForegroundColor Green
    Write-Host "cd swipehire-backend && npm start" -ForegroundColor Gray
} elseif ($needsFrontend) {
    Write-Host "🚀 Start Frontend:" -ForegroundColor Green
    Write-Host "npm run dev" -ForegroundColor Gray
} else {
    Write-Host "✅ Both services appear to be running!" -ForegroundColor Green
    Write-Host "If you're still seeing SSL errors, restart both services:" -ForegroundColor Yellow
    Write-Host "1. Stop both services (Ctrl+C)" -ForegroundColor Gray
    Write-Host "2. Start backend first, then frontend" -ForegroundColor Gray
}

Write-Host "`n6. Testing Connection..." -ForegroundColor Yellow

if (Test-Port -Port 5000) {
    Write-Host "Testing backend API endpoint..." -ForegroundColor Gray
    try {
        $testResponse = Invoke-WebRequest -Uri "http://localhost:5000/api" -Method GET -TimeoutSec 5 -UseBasicParsing
        Write-Host "✅ Backend API is responding" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Backend is running but API might not be ready" -ForegroundColor Yellow
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    }
}

Write-Host "`n✅ Diagnosis Complete!" -ForegroundColor Green
Write-Host "The SSL error should be resolved after following the steps above." -ForegroundColor White