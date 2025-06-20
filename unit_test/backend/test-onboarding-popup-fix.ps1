# PowerShell script to test the onboarding popup fix
Write-Host "Testing SwipeHire Onboarding Popup Fix..." -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan

$testsPassed = 0
$totalTests = 0

function Test-Condition {
    param(
        [string]$TestName,
        [bool]$Condition,
        [string]$SuccessMessage,
        [string]$FailureMessage
    )
    
    $script:totalTests++
    Write-Host "Testing: $TestName" -ForegroundColor Yellow
    
    if ($Condition) {
        Write-Host "✅ $SuccessMessage" -ForegroundColor Green
        $script:testsPassed++
    } else {
        Write-Host "❌ $FailureMessage" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 1: Check if onboarding page has the sessionStorage flag logic
$onboardingPagePath = ".\src\app\recruiter-onboarding\page.tsx"
$onboardingContent = ""
if (Test-Path $onboardingPagePath) {
    $onboardingContent = Get-Content $onboardingPagePath -Raw
}

Test-Condition -TestName "Onboarding Page - Session Storage Flag" `
    -Condition ($onboardingContent -match "onboardingJustCompleted" -and $onboardingContent -match "sessionStorage") `
    -SuccessMessage "Onboarding page includes session storage flag logic" `
    -FailureMessage "Onboarding page missing session storage flag logic"

Test-Condition -TestName "Onboarding Page - Force Refresh" `
    -Condition ($onboardingContent -match "fetchAndSetUserPreferences.*true") `
    -SuccessMessage "Onboarding page uses force refresh for user preferences" `
    -FailureMessage "Onboarding page missing force refresh logic"

Test-Condition -TestName "Onboarding Page - Navigation Delay" `
    -Condition ($onboardingContent -match "setTimeout.*router\.push") `
    -SuccessMessage "Onboarding page includes navigation delay" `
    -FailureMessage "Onboarding page missing navigation delay"

# Test 2: Check if main page has the redirect prevention logic
$mainPagePath = ".\src\app\page.tsx"
$mainPageContent = ""
if (Test-Path $mainPagePath) {
    $mainPageContent = Get-Content $mainPagePath -Raw
}

Test-Condition -TestName "Main Page - Redirect Prevention" `
    -Condition ($mainPageContent -match "onboardingJustCompleted" -and $mainPageContent -match "sessionStorage\.getItem") `
    -SuccessMessage "Main page includes redirect prevention logic" `
    -FailureMessage "Main page missing redirect prevention logic"

Test-Condition -TestName "Main Page - Flag Cleanup" `
    -Condition ($mainPageContent -match "sessionStorage\.removeItem.*onboardingJustCompleted") `
    -SuccessMessage "Main page includes flag cleanup logic" `
    -FailureMessage "Main page missing flag cleanup logic"

# Test 3: Check if UserPreferencesContext has force refresh capability
$contextPath = ".\src\contexts\UserPreferencesContext.tsx"
$contextContent = ""
if (Test-Path $contextPath) {
    $contextContent = Get-Content $contextPath -Raw
}

Test-Condition -TestName "Context - Force Refresh Parameter" `
    -Condition ($contextContent -match "forceRefresh.*boolean" -and $contextContent -match "Cache-Control.*no-cache") `
    -SuccessMessage "Context includes force refresh capability" `
    -FailureMessage "Context missing force refresh capability"

Test-Condition -TestName "Context - Cache Busting" `
    -Condition ($contextContent -match "_t=.*Date\.now") `
    -SuccessMessage "Context includes cache busting for force refresh" `
    -FailureMessage "Context missing cache busting logic"

# Test 4: Check if enhanced logging is present
Test-Condition -TestName "Enhanced Logging - Onboarding" `
    -Condition ($onboardingContent -match "\[RecruiterOnboarding\]") `
    -SuccessMessage "Onboarding page has enhanced logging" `
    -FailureMessage "Onboarding page missing enhanced logging"

Test-Condition -TestName "Enhanced Logging - Main Page" `
    -Condition ($mainPageContent -match "\[AppContent\].*Onboarding just completed") `
    -SuccessMessage "Main page has enhanced logging for onboarding flow" `
    -FailureMessage "Main page missing enhanced logging for onboarding flow"

# Test 5: Check if the interface is updated correctly
Test-Condition -TestName "Context Interface - Force Refresh Parameter" `
    -Condition ($contextContent -match "fetchAndSetUserPreferences.*forceRefresh\?.*boolean") `
    -SuccessMessage "Context interface includes optional forceRefresh parameter" `
    -FailureMessage "Context interface missing forceRefresh parameter"

# Summary
Write-Host "Test Results Summary" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host "Tests Passed: $testsPassed / $totalTests" -ForegroundColor $(if ($testsPassed -eq $totalTests) { "Green" } else { "Yellow" })

if ($testsPassed -eq $totalTests) {
    Write-Host "🎉 All tests passed! The onboarding popup fix should work correctly." -ForegroundColor Green
    Write-Host ""
    Write-Host "How the fix works:" -ForegroundColor Yellow
    Write-Host "1. When onboarding completes, a 'onboardingJustCompleted' flag is set in sessionStorage" -ForegroundColor White
    Write-Host "2. User preferences are force-refreshed to get the latest backend data" -ForegroundColor White
    Write-Host "3. Navigation to dashboard is delayed by 100ms to ensure context updates" -ForegroundColor White
    Write-Host "4. Main page checks for the flag and prevents redirect loops" -ForegroundColor White
    Write-Host "5. The flag is automatically cleaned up after use" -ForegroundColor White
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Start the backend server: .\start-backend.ps1" -ForegroundColor White
    Write-Host "2. Start the frontend: npm run dev" -ForegroundColor White
    Write-Host "3. Test the complete onboarding flow" -ForegroundColor White
    Write-Host "4. Verify no popup appears after completion" -ForegroundColor White
} else {
    Write-Host "⚠️ Some tests failed. Please review the issues above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Yellow
    Write-Host "- Ensure all files were updated correctly" -ForegroundColor White
    Write-Host "- Check that the search/replace operations completed successfully" -ForegroundColor White
    Write-Host "- Verify the file paths are correct" -ForegroundColor White
}

Write-Host ""
Write-Host "For detailed troubleshooting, see the enhanced logging in browser console" -ForegroundColor Cyan