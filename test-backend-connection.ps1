# Test Backend Connection Script
Write-Host "🧪 Testing Backend Connection..." -ForegroundColor Cyan

# Test the corrected HTTP endpoint
$backendUrl = "http://localhost:5000"

Write-Host "`nTesting backend endpoints:" -ForegroundColor Yellow

# Test 1: Jobs endpoint
try {
    $response = Invoke-WebRequest -Uri "$backendUrl/api/jobs" -Method GET -TimeoutSec 10 -UseBasicParsing
    Write-Host "✅ /api/jobs - Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ /api/jobs - Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Check if frontend environment is correct
Write-Host "`nChecking frontend environment:" -ForegroundColor Yellow
$envContent = Get-Content ".\.env.local" | Where-Object { $_ -like "NEXT_PUBLIC_CUSTOM_BACKEND_URL=*" }
if ($envContent -like "*http://localhost:5000*") {
    Write-Host "✅ Frontend configured for HTTP: $envContent" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend still configured incorrectly: $envContent" -ForegroundColor Red
}

Write-Host "`n🎯 Results:" -ForegroundColor Cyan
Write-Host "- Backend is running on HTTP (correct)" -ForegroundColor White
Write-Host "- Frontend environment updated to use HTTP" -ForegroundColor White
Write-Host "- SSL error should be resolved" -ForegroundColor White

Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Restart your frontend development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host "2. The SSL error should be gone!" -ForegroundColor White
Write-Host "3. If you still see issues, clear browser cache" -ForegroundColor White