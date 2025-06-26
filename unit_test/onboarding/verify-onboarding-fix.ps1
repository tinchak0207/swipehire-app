# Quick verification script for onboarding popup fix
Write-Host "🔍 Quick Verification: Onboarding Popup Fix" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Gray

# Check key files exist and have the required changes
$files = @(
    @{
        Path = ".\src\app\recruiter-onboarding\page.tsx"
        Patterns = @("onboardingJustCompleted", "sessionStorage.setItem", "setTimeout.*router.push", "forceRefresh.*true")
        Name = "Onboarding Page"
    },
    @{
        Path = ".\src\app\page.tsx"
        Patterns = @("onboardingJustCompleted", "sessionStorage.getItem", "sessionStorage.removeItem")
        Name = "Main Page"
    },
    @{
        Path = ".\src\contexts\UserPreferencesContext.tsx"
        Patterns = @("forceRefresh.*boolean", "Cache-Control.*no-cache", "_t=.*Date.now")
        Name = "User Context"
    }
)

$allGood = $true

foreach ($file in $files) {
    Write-Host "`n📁 Checking $($file.Name)..." -ForegroundColor Yellow
    
    if (-not (Test-Path $file.Path)) {
        Write-Host "   ❌ File not found: $($file.Path)" -ForegroundColor Red
        $allGood = $false
        continue
    }
    
    $content = Get-Content $file.Path -Raw
    $patternResults = @()
    
    foreach ($pattern in $file.Patterns) {
        if ($content -match $pattern) {
            $patternResults += "✅ $pattern"
        } else {
            $patternResults += "❌ $pattern"
            $allGood = $false
        }
    }
    
    foreach ($result in $patternResults) {
        Write-Host "   $result" -ForegroundColor $(if ($result.StartsWith("✅")) { "Green" } else { "Red" })
    }
}

Write-Host "`n" -NoNewline

if ($allGood) {
    Write-Host "🎉 All checks passed! The onboarding popup fix is properly implemented." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Start backend: .\start-backend.ps1" -ForegroundColor White
    Write-Host "2. Start frontend: npm run dev" -ForegroundColor White
    Write-Host "3. Test the onboarding flow" -ForegroundColor White
    Write-Host "4. Monitor browser console for detailed logs" -ForegroundColor White
} else {
    Write-Host "⚠���  Some checks failed. Please review the missing patterns above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Run the full test: .\test-onboarding-popup-fix.ps1" -ForegroundColor Yellow
}

Write-Host ""