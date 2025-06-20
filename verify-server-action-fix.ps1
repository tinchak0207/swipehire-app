# Quick verification script for server action fix
Write-Host "🔍 Quick Verification: Server Action Fix" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Gray

# Check if any service files still have 'use server'
$serviceFiles = Get-ChildItem ".\src\services\*.ts" -ErrorAction SilentlyContinue

if ($serviceFiles) {
    $hasUseServer = $false
    
    Write-Host "`n📁 Checking service files for 'use server' directive..." -ForegroundColor Yellow
    
    foreach ($file in $serviceFiles) {
        $content = Get-Content $file.FullName -Raw
        $fileName = $file.Name
        
        if ($content -match "'use server'") {
            Write-Host "   ❌ $fileName still has 'use server'" -ForegroundColor Red
            $hasUseServer = $true
        } else {
            Write-Host "   ✅ $fileName is clean" -ForegroundColor Green
        }
    }
    
    Write-Host ""
    
    if (-not $hasUseServer) {
        Write-Host "🎉 All service files are fixed!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Test the fix:" -ForegroundColor Yellow
        Write-Host "1. .\start-backend.ps1" -ForegroundColor White
        Write-Host "2. npm run dev" -ForegroundColor White
        Write-Host "3. Complete recruiter onboarding" -ForegroundColor White
        Write-Host "4. Check Network tab - should see calls to localhost:5000" -ForegroundColor White
        Write-Host "5. Should NOT see calls to localhost:3000/recruiter-onboarding" -ForegroundColor White
    } else {
        Write-Host "⚠️  Some files still need fixing. Remove 'use server' from the files marked above." -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ No service files found in src/services/" -ForegroundColor Red
}

Write-Host ""
Write-Host "Expected after fix:" -ForegroundColor Cyan
Write-Host "- API calls go to http://localhost:5000/api/..." -ForegroundColor White
Write-Host "- No 400 Bad Request errors" -ForegroundColor White
Write-Host "- Successful onboarding completion" -ForegroundColor White

Write-Host ""