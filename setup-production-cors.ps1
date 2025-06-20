# SwipeHire Production CORS Setup Script
# This script helps configure CORS for production deployment

Write-Host "🚀 SwipeHire Production CORS Setup" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

Write-Host "`n1. Checking Current Configuration..." -ForegroundColor Yellow

# Check if production environment file exists
$prodEnvFile = ".\swipehire-backend\.env.production"
if (Test-Path $prodEnvFile) {
    Write-Host "✅ Production environment file exists" -ForegroundColor Green
    
    $prodEnvContent = Get-Content $prodEnvFile
    $frontendUrls = $prodEnvContent | Where-Object { $_ -like "FRONTEND_URL_*" }
    
    if ($frontendUrls) {
        Write-Host "✅ Found frontend URL configurations:" -ForegroundColor Green
        $frontendUrls | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    } else {
        Write-Host "⚠️  No frontend URL configurations found" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Production environment file not found" -ForegroundColor Red
    Write-Host "🔧 Creating production environment file..." -ForegroundColor Yellow
    
    @"
# SwipeHire Backend Production Environment Configuration

# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
MONGO_URI=mongodb://localhost:27017/swipehire

# Frontend URLs for CORS - Production
FRONTEND_URL_PRIMARY=https://swipehire.top
FRONTEND_URL_SECONDARY=https://www.swipehire.top
FRONTEND_URL_TERTIARY=http://swipehire.top
FRONTEND_URL_QUATERNARY=http://www.swipehire.top
NEXTJS_INTERNAL_APP_URL=https://www.swipehire.top

# Redis Configuration (optional)
USE_REDIS_ADAPTER=false
REDIS_URL=redis://localhost:6379
"@ | Set-Content $prodEnvFile
    
    Write-Host "✅ Created production environment file" -ForegroundColor Green
}

Write-Host "`n2. Checking CORS Configuration..." -ForegroundColor Yellow

# Check constants.js file
$constantsFile = ".\swipehire-backend\config\constants.js"
if (Test-Path $constantsFile) {
    $constantsContent = Get-Content $constantsFile -Raw
    
    if ($constantsContent -like "*swipehire.top*") {
        Write-Host "✅ SwipeHire domains found in CORS configuration" -ForegroundColor Green
    } else {
        Write-Host "❌ SwipeHire domains not found in CORS configuration" -ForegroundColor Red
    }
    
    if ($constantsContent -like "*console.log*CORS Check*") {
        Write-Host "��� Enhanced CORS logging enabled" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Basic CORS logging only" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ CORS configuration file not found" -ForegroundColor Red
}

Write-Host "`n3. Production Deployment Checklist..." -ForegroundColor Yellow

Write-Host "📋 Backend Deployment Steps:" -ForegroundColor Cyan
Write-Host "1. Copy .env.production to your Cloud Workstation" -ForegroundColor White
Write-Host "2. Set environment variables in Cloud Workstation:" -ForegroundColor White
Write-Host "   export NODE_ENV=production" -ForegroundColor Gray
Write-Host "   export FRONTEND_URL_PRIMARY=https://www.swipehire.top" -ForegroundColor Gray
Write-Host "   export FRONTEND_URL_SECONDARY=https://swipehire.top" -ForegroundColor Gray
Write-Host "3. Restart the backend service" -ForegroundColor White
Write-Host "4. Check backend logs for CORS messages" -ForegroundColor White

Write-Host "`n📋 Frontend Deployment Steps:" -ForegroundColor Cyan
Write-Host "1. Update production environment variables:" -ForegroundColor White
Write-Host "   NEXT_PUBLIC_CUSTOM_BACKEND_URL=https://5000-firebase-swipehire-new-1749729524468.cluster-sumfw3zmzzhzkx4mpvz3ogth4y.cloudworkstations.dev" -ForegroundColor Gray
Write-Host "2. Rebuild and redeploy frontend" -ForegroundColor White
Write-Host "3. Test API calls from browser console" -ForegroundColor White

Write-Host "`n4. Testing CORS Configuration..." -ForegroundColor Yellow

$backendUrl = "https://5000-firebase-swipehire-new-1749729524468.cluster-sumfw3zmzzhzkx4mpvz3ogth4y.cloudworkstations.dev"
$frontendOrigin = "https://www.swipehire.top"

Write-Host "Testing CORS preflight request..." -ForegroundColor Gray
try {
    # Test OPTIONS request (preflight)
    $headers = @{
        'Origin' = $frontendOrigin
        'Access-Control-Request-Method' = 'GET'
        'Access-Control-Request-Headers' = 'Content-Type'
    }
    
    $response = Invoke-WebRequest -Uri "$backendUrl/api/jobs" -Method OPTIONS -Headers $headers -TimeoutSec 10 -UseBasicParsing
    
    if ($response.Headers['Access-Control-Allow-Origin']) {
        Write-Host "✅ CORS preflight successful" -ForegroundColor Green
        Write-Host "   Access-Control-Allow-Origin: $($response.Headers['Access-Control-Allow-Origin'])" -ForegroundColor Gray
    } else {
        Write-Host "❌ CORS preflight failed - No Access-Control-Allow-Origin header" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ CORS preflight test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   This indicates the backend is not accessible or CORS is not configured" -ForegroundColor Yellow
}

Write-Host "`n5. Troubleshooting Guide..." -ForegroundColor Yellow

Write-Host "🔧 If CORS is still blocked:" -ForegroundColor Cyan
Write-Host "1. Check backend logs for CORS messages" -ForegroundColor White
Write-Host "2. Verify environment variables are set correctly" -ForegroundColor White
Write-Host "3. Ensure backend is running in production mode" -ForegroundColor White
Write-Host "4. Test with curl:" -ForegroundColor White
Write-Host "   curl -H 'Origin: https://www.swipehire.top' -H 'Access-Control-Request-Method: GET' -X OPTIONS $backendUrl/api/jobs" -ForegroundColor Gray

Write-Host "`n🔍 Debug Commands:" -ForegroundColor Cyan
Write-Host "# Check backend environment" -ForegroundColor White
Write-Host "echo `$NODE_ENV" -ForegroundColor Gray
Write-Host "echo `$FRONTEND_URL_PRIMARY" -ForegroundColor Gray
Write-Host ""
Write-Host "# Test direct API call" -ForegroundColor White
Write-Host "curl -v $backendUrl/api/jobs" -ForegroundColor Gray
Write-Host ""
Write-Host "# Test CORS preflight" -ForegroundColor White
Write-Host "curl -v -H 'Origin: https://www.swipehire.top' -X OPTIONS $backendUrl/api/jobs" -ForegroundColor Gray

Write-Host "`n✅ Setup Complete!" -ForegroundColor Green
Write-Host "Follow the deployment steps above to resolve the CORS issue." -ForegroundColor White