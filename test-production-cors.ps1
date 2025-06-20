# Test Production CORS Configuration
Write-Host "🧪 Testing Production CORS Configuration" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$backendUrl = "https://5000-firebase-swipehire-new-1749729524468.cluster-sumfw3zmzzhzkx4mpvz3ogth4y.cloudworkstations.dev"
$frontendOrigin = "https://www.swipehire.top"

Write-Host "`n1. Testing Backend Accessibility..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$backendUrl/api/jobs" -Method GET -TimeoutSec 10 -UseBasicParsing
    Write-Host "✅ Backend is accessible - Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend not accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Make sure backend is running on Cloud Workstation" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n2. Testing CORS Preflight (OPTIONS)..." -ForegroundColor Yellow
try {
    $headers = @{
        'Origin' = $frontendOrigin
        'Access-Control-Request-Method' = 'GET'
        'Access-Control-Request-Headers' = 'Content-Type'
    }
    
    $response = Invoke-WebRequest -Uri "$backendUrl/api/jobs" -Method OPTIONS -Headers $headers -TimeoutSec 10 -UseBasicParsing
    
    $allowOrigin = $response.Headers['Access-Control-Allow-Origin']
    $allowMethods = $response.Headers['Access-Control-Allow-Methods']
    $allowCredentials = $response.Headers['Access-Control-Allow-Credentials']
    
    if ($allowOrigin) {
        Write-Host "✅ CORS preflight successful!" -ForegroundColor Green
        Write-Host "   Access-Control-Allow-Origin: $allowOrigin" -ForegroundColor Gray
        Write-Host "   Access-Control-Allow-Methods: $allowMethods" -ForegroundColor Gray
        Write-Host "   Access-Control-Allow-Credentials: $allowCredentials" -ForegroundColor Gray
    } else {
        Write-Host "❌ CORS preflight failed - No Access-Control-Allow-Origin header" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ CORS preflight failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. Testing Actual API Request with Origin..." -ForegroundColor Yellow
try {
    $headers = @{
        'Origin' = $frontendOrigin
    }
    
    $response = Invoke-WebRequest -Uri "$backendUrl/api/jobs" -Method GET -Headers $headers -TimeoutSec 10 -UseBasicParsing
    
    $allowOrigin = $response.Headers['Access-Control-Allow-Origin']
    
    if ($allowOrigin -eq $frontendOrigin -or $allowOrigin -eq "*") {
        Write-Host "✅ API request with CORS successful!" -ForegroundColor Green
        Write-Host "   Response Status: $($response.StatusCode)" -ForegroundColor Gray
        Write-Host "   Access-Control-Allow-Origin: $allowOrigin" -ForegroundColor Gray
    } else {
        Write-Host "❌ API request CORS failed - Wrong or missing Access-Control-Allow-Origin" -ForegroundColor Red
        Write-Host "   Expected: $frontendOrigin" -ForegroundColor Gray
        Write-Host "   Got: $allowOrigin" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ API request failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n4. Browser Test Instructions..." -ForegroundColor Yellow
Write-Host "To test from your browser:" -ForegroundColor White
Write-Host "1. Go to https://www.swipehire.top" -ForegroundColor Gray
Write-Host "2. Open Developer Tools (F12)" -ForegroundColor Gray
Write-Host "3. Go to Console tab" -ForegroundColor Gray
Write-Host "4. Run this command:" -ForegroundColor Gray
Write-Host ""
Write-Host "fetch('$backendUrl/api/jobs')" -ForegroundColor Cyan
Write-Host "  .then(response => response.json())" -ForegroundColor Cyan
Write-Host "  .then(data => console.log('Success:', data))" -ForegroundColor Cyan
Write-Host "  .catch(error => console.error('CORS Error:', error));" -ForegroundColor Cyan
Write-Host ""

Write-Host "`n5. Troubleshooting..." -ForegroundColor Yellow
Write-Host "If CORS is still blocked:" -ForegroundColor White
Write-Host "1. Check backend logs for CORS messages" -ForegroundColor Gray
Write-Host "2. Verify environment variables on Cloud Workstation:" -ForegroundColor Gray
Write-Host "   echo `$NODE_ENV" -ForegroundColor DarkGray
Write-Host "   echo `$FRONTEND_URL_PRIMARY" -ForegroundColor DarkGray
Write-Host "3. Restart backend with production environment" -ForegroundColor Gray
Write-Host "4. Clear browser cache and try again" -ForegroundColor Gray

Write-Host "`n✅ CORS Test Complete!" -ForegroundColor Green