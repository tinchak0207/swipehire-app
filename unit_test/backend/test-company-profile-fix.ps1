# PowerShell script to test the company profile completion fix
Write-Host "🔍 Testing Company Profile Completion Fix" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Gray

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

# Test 1: Check if onboarding page has immediate context update
$onboardingPagePath = ".\src\app\recruiter-onboarding\page.tsx"
$onboardingContent = ""
if (Test-Path $onboardingPagePath) {
    $onboardingContent = Get-Content $onboardingPagePath -Raw
}

Test-Condition -TestName "Onboarding Page - Immediate Context Update" `
    -Condition ($onboardingContent -match "updateFullBackendUserFields.*companyProfileComplete.*true") `
    -SuccessMessage "Onboarding page includes immediate context update" `
    -FailureMessage "Onboarding page missing immediate context update"

Test-Condition -TestName "Onboarding Page - Context Import" `
    -Condition ($onboardingContent -match "updateFullBackendUserFields.*useUserPreferences") `
    -SuccessMessage "Onboarding page imports updateFullBackendUserFields" `
    -FailureMessage "Onboarding page missing updateFullBackendUserFields import"

# Test 2: Check if CreateJobPostingPage has debugging
$createJobPagePath = ".\src\components\pages\CreateJobPostingPage.tsx"
$createJobContent = ""
if (Test-Path $createJobPagePath) {
    $createJobContent = Get-Content $createJobPagePath -Raw
}

Test-Condition -TestName "CreateJobPostingPage - Debug Logging" `
    -Condition ($createJobContent -match "console\.log.*CreateJobPostingPage.*Context state") `
    -SuccessMessage "CreateJobPostingPage includes debug logging" `
    -FailureMessage "CreateJobPostingPage missing debug logging"

# Test 3: Check if SettingsPage has debugging
$settingsPagePath = ".\src\components\pages\SettingsPage.tsx"
$settingsContent = ""
if (Test-Path $settingsPagePath) {
    $settingsContent = Get-Content $settingsPagePath -Raw
}

Test-Condition -TestName "SettingsPage - Debug Logging" `
    -Condition ($settingsContent -match "console\.log.*SettingsPage.*Context state") `
    -SuccessMessage "SettingsPage includes debug logging" `
    -FailureMessage "SettingsPage missing debug logging"

# Test 4: Check if UserPreferencesContext has enhanced debugging
$contextPath = ".\src\contexts\UserPreferencesContext.tsx"
$contextContent = ""
if (Test-Path $contextPath) {
    $contextContent = Get-Content $contextPath -Raw
}

Test-Condition -TestName "UserPreferencesContext - Enhanced Debugging" `
    -Condition ($contextContent -match "console\.log.*Setting fullBackendUser state") `
    -SuccessMessage "UserPreferencesContext includes enhanced debugging" `
    -FailureMessage "UserPreferencesContext missing enhanced debugging"

# Test 5: Check if backend User model has companyProfileComplete field
$userModelPath = ".\swipehire-backend\models\User.js"
$userModelContent = ""
if (Test-Path $userModelPath) {
    $userModelContent = Get-Content $userModelPath -Raw
}

Test-Condition -TestName "Backend User Model - companyProfileComplete Field" `
    -Condition ($userModelContent -match "companyProfileComplete.*Boolean") `
    -SuccessMessage "Backend User model includes companyProfileComplete field" `
    -FailureMessage "Backend User model missing companyProfileComplete field"

# Test 6: Check if backend controller includes the field in response
$controllerPath = ".\swipehire-backend\controllers\users\userController.js"
$controllerContent = ""
if (Test-Path $controllerPath) {
    $controllerContent = Get-Content $controllerPath -Raw
}

Test-Condition -TestName "Backend Controller - companyProfileComplete in Response" `
    -Condition ($controllerContent -match "companyProfileComplete.*userObject\.companyProfileComplete") `
    -SuccessMessage "Backend controller includes companyProfileComplete in response" `
    -FailureMessage "Backend controller missing companyProfileComplete in response"

# Test 7: Check if recruiter service sets the field correctly
$recruiterServicePath = ".\src\services\recruiterService.ts"
$recruiterServiceContent = ""
if (Test-Path $recruiterServicePath) {
    $recruiterServiceContent = Get-Content $recruiterServicePath -Raw
}

Test-Condition -TestName "Recruiter Service - Sets companyProfileComplete" `
    -Condition ($recruiterServiceContent -match "companyProfileComplete.*true") `
    -SuccessMessage "Recruiter service sets companyProfileComplete to true" `
    -FailureMessage "Recruiter service missing companyProfileComplete setting"

# Summary
Write-Host "Test Results Summary" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host "Tests Passed: $testsPassed / $totalTests" -ForegroundColor $(if ($testsPassed -eq $totalTests) { "Green" } else { "Yellow" })

if ($testsPassed -eq $totalTests) {
    Write-Host "🎉 All tests passed! The company profile fix should work correctly." -ForegroundColor Green
    Write-Host ""
    Write-Host "How the fix works:" -ForegroundColor Yellow
    Write-Host "1. Onboarding completion immediately updates frontend context" -ForegroundColor White
    Write-Host "2. Backend is updated with companyProfileComplete: true" -ForegroundColor White
    Write-Host "3. Context is force-refreshed to ensure sync with backend" -ForegroundColor White
    Write-Host "4. Enhanced debugging helps identify any remaining issues" -ForegroundColor White
    Write-Host ""
    Write-Host "Testing steps:" -ForegroundColor Yellow
    Write-Host "1. Start backend: .\start-backend.ps1" -ForegroundColor White
    Write-Host "2. Start frontend: npm run dev" -ForegroundColor White
    Write-Host "3. Complete onboarding flow" -ForegroundColor White
    Write-Host "4. Check 'Post a Job' page - should not show incomplete message" -ForegroundColor White
    Write-Host "5. Check Settings page - should not show onboarding link" -ForegroundColor White
    Write-Host "6. Monitor browser console for debug logs" -ForegroundColor White
} else {
    Write-Host "��️ Some tests failed. Please review the issues above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Yellow
    Write-Host "- Ensure all files were updated correctly" -ForegroundColor White
    Write-Host "- Check that imports are properly added" -ForegroundColor White
    Write-Host "- Verify backend model includes all required fields" -ForegroundColor White
}

Write-Host ""
Write-Host "Debug commands to run in browser console:" -ForegroundColor Cyan
Write-Host "// Check current context state" -ForegroundColor Gray
Write-Host "console.log('User context:', window.React?.useContext)" -ForegroundColor White
Write-Host ""
Write-Host "// Check localStorage" -ForegroundColor Gray
Write-Host "console.log('localStorage:', {" -ForegroundColor White
Write-Host "  mongoDbUserId: localStorage.getItem('mongoDbUserId')," -ForegroundColor White
Write-Host "  recruiterCompanyProfileComplete: localStorage.getItem('recruiterCompanyProfileComplete')" -ForegroundColor White
Write-Host "});" -ForegroundColor White
Write-Host ""
Write-Host "// Test backend API directly" -ForegroundColor Gray
Write-Host "fetch('http://localhost:5000/api/users/YOUR_MONGO_ID')" -ForegroundColor White
Write-Host "  .then(res => res.json())" -ForegroundColor White
Write-Host "  .then(data => console.log('Backend data:', data.companyProfileComplete))" -ForegroundColor White

Write-Host ""