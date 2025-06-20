# Quick verification script for company profile fix
Write-Host "🔍 Quick Verification: Company Profile Fix" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Gray

# Check key changes are in place
$checks = @(
    @{
        File = ".\src\app\recruiter-onboarding\page.tsx"
        Pattern = "updateFullBackendUserFields.*companyProfileComplete.*true"
        Name = "Immediate context update in onboarding"
    },
    @{
        File = ".\src\components\pages\CreateJobPostingPage.tsx"
        Pattern = "console\.log.*CreateJobPostingPage.*Context state"
        Name = "Debug logging in CreateJobPostingPage"
    },
    @{
        File = ".\src\components\pages\SettingsPage.tsx"
        Pattern = "console\.log.*SettingsPage.*Context state"
        Name = "Debug logging in SettingsPage"
    },
    @{
        File = ".\src\contexts\UserPreferencesContext.tsx"
        Pattern = "console\.log.*Setting fullBackendUser state"
        Name = "Enhanced context debugging"
    },
    @{
        File = ".\swipehire-backend\models\User.js"
        Pattern = "companyProfileComplete.*Boolean"
        Name = "Backend model has companyProfileComplete field"
    }
)

$allGood = $true

foreach ($check in $checks) {
    Write-Host "`n📁 Checking: $($check.Name)" -ForegroundColor Yellow
    
    if (-not (Test-Path $check.File)) {
        Write-Host "   ❌ File not found: $($check.File)" -ForegroundColor Red
        $allGood = $false
        continue
    }
    
    $content = Get-Content $check.File -Raw
    if ($content -match $check.Pattern) {
        Write-Host "   ✅ Pattern found" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Pattern not found: $($check.Pattern)" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host "`n" -NoNewline

if ($allGood) {
    Write-Host "🎉 All checks passed! The company profile fix is ready." -ForegroundColor Green
    Write-Host ""
    Write-Host "Test the fix:" -ForegroundColor Yellow
    Write-Host "1. .\start-backend.ps1" -ForegroundColor White
    Write-Host "2. npm run dev" -ForegroundColor White
    Write-Host "3. Complete recruiter onboarding" -ForegroundColor White
    Write-Host "4. Check 'Post a Job' page (should work)" -ForegroundColor White
    Write-Host "5. Check Settings page (no onboarding link)" -ForegroundColor White
    Write-Host "6. Monitor browser console for debug logs" -ForegroundColor White
} else {
    Write-Host "⚠️  Some checks failed. Please review the missing patterns above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Run full test: .\test-company-profile-fix.ps1" -ForegroundColor Yellow
}

Write-Host ""