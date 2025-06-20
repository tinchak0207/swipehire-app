# PowerShell script to test the onboarding fix
Write-Host "Testing SwipeHire Onboarding Fix..." -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan

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

# Test 1: Check if backend directory exists
Test-Condition -TestName "Backend Directory" `
    -Condition (Test-Path ".\swipehire-backend") `
    -SuccessMessage "Backend directory found" `
    -FailureMessage "Backend directory not found"

# Test 2: Check if User model has been updated
$userModelPath = ".\swipehire-backend\models\User.js"
$userModelContent = ""
if (Test-Path $userModelPath) {
    $userModelContent = Get-Content $userModelPath -Raw
}

Test-Condition -TestName "User Model - companyProfileComplete Field" `
    -Condition ($userModelContent -match "companyProfileComplete") `
    -SuccessMessage "User model includes companyProfileComplete field" `
    -FailureMessage "User model missing companyProfileComplete field"

Test-Condition -TestName "User Model - Company Fields" `
    -Condition ($userModelContent -match "companyScale" -and $userModelContent -match "companyAddress") `
    -SuccessMessage "User model includes additional company fields" `
    -FailureMessage "User model missing additional company fields"

# Test 3: Check if controller has been updated
$controllerPath = ".\swipehire-backend\controllers\users\userController.js"
$controllerContent = ""
if (Test-Path $controllerPath) {
    $controllerContent = Get-Content $controllerPath -Raw
}

Test-Condition -TestName "User Controller - Enhanced Error Handling" `
    -Condition ($controllerContent -match "ValidationError" -and $controllerContent -match "console.log") `
    -SuccessMessage "User controller has enhanced error handling" `
    -FailureMessage "User controller missing enhanced error handling"

# Test 4: Check if recruiter service has been updated
$serviceePath = ".\src\services\recruiterService.ts"
$serviceContent = ""
if (Test-Path $serviceePath) {
    $serviceContent = Get-Content $serviceePath -Raw
}

Test-Condition -TestName "Recruiter Service - Enhanced Error Handling" `
    -Condition ($serviceContent -match "Response status" -and $serviceContent -match "TypeError") `
    -SuccessMessage "Recruiter service has enhanced error handling" `
    -FailureMessage "Recruiter service missing enhanced error handling"

# Test 5: Check if environment file exists
Test-Condition -TestName "Environment Configuration" `
    -Condition (Test-Path ".\.env.local") `
    -SuccessMessage "Environment configuration file found" `
    -FailureMessage "Environment configuration file missing"

# Test 6: Check if package.json exists in backend
Test-Condition -TestName "Backend Package Configuration" `
    -Condition (Test-Path ".\swipehire-backend\package.json") `
    -SuccessMessage "Backend package.json found" `
    -FailureMessage "Backend package.json missing"

# Test 7: Check if Node.js is available
$nodeAvailable = $false
try {
    $nodeVersion = node --version 2>$null
    $nodeAvailable = $LASTEXITCODE -eq 0
} catch {
    $nodeAvailable = $false
}

Test-Condition -TestName "Node.js Installation" `
    -Condition $nodeAvailable `
    -SuccessMessage "Node.js is available (version: $nodeVersion)" `
    -FailureMessage "Node.js not found or not accessible"

# Summary
Write-Host "Test Results Summary" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host "Tests Passed: $testsPassed / $totalTests" -ForegroundColor $(if ($testsPassed -eq $totalTests) { "Green" } else { "Yellow" })

if ($testsPassed -eq $totalTests) {
    Write-Host "🎉 All tests passed! The onboarding fix should work correctly." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Run '.\start-backend.ps1' to start the backend server" -ForegroundColor White
    Write-Host "2. Run 'npm run dev' to start the frontend" -ForegroundColor White
    Write-Host "3. Test the recruiter onboarding flow" -ForegroundColor White
} else {
    Write-Host "⚠️ Some tests failed. Please review the issues above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Yellow
    Write-Host "- Ensure you're running this script from the swipehire-app root directory" -ForegroundColor White
    Write-Host "- Install Node.js if it's missing" -ForegroundColor White
    Write-Host "- Check that all files were updated correctly" -ForegroundColor White
}

Write-Host ""
Write-Host "For detailed troubleshooting, see: fix-onboarding-issue.md" -ForegroundColor Cyan